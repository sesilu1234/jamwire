import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUCKET = 'jamspots_imageBucket';

/**
 * Refused before the buffer ever reaches sharp, so a 50 MB upload cannot make
 * the route decode it. The client checks the same number first; this is the
 * copy that counts, because the client's can be skipped.
 */
export const MAX_INPUT_BYTES = 8 * 1024 * 1024;

/**
 * Resolutions to try, largest first, all encoded at the same quality.
 *
 * Dimension is the lever rather than quality because the two are not
 * interchangeable at a fixed byte budget: the same bytes spread over more
 * pixels is a visibly worse photo, while the same pixels at a slightly smaller
 * size is barely noticeable. So a photo that will not fit gets smaller, never
 * uglier.
 *
 * 2048 is the top rung because the largest thing the app renders is the jam
 * hero - full width, but cropped to a ~560px band with scrims and text over
 * it. Past 2048 the extra pixels are not visible, and the encode jumps well
 * past MAX_OUTPUT_BYTES anyway.
 */
const DIMENSION_LADDER = [2048, 1600, 1280];

/** Fixed. Below ~70 WebP starts banding on skies and stage lighting. */
const QUALITY = 82;

/** What the ladder aims for. Most photos clear it on the first rung. */
const TARGET_BYTES = 400 * 1024;

/** If even the smallest rung is over this, something is wrong and we refuse. */
const MAX_OUTPUT_BYTES = 500 * 1024;

type Compressed = {
  buffer: Buffer;
  width: number;
  height: number;
};

/**
 * Encode to WebP, stepping the resolution down until the result fits
 * `TARGET_BYTES`.
 *
 * `.rotate()` with no argument applies the EXIF orientation tag before the
 * re-encode drops the metadata. Without it every portrait photo taken on a
 * phone is stored on its side.
 */
async function compress(input: Buffer): Promise<Compressed> {
  const meta = await sharp(input).metadata();

  /**
   * Orientation-invariant, so it is right whichever way the EXIF tag turns the
   * photo. Rungs above it would be no-ops, and two rungs that clamp to the
   * same size would encode the same bytes twice, so both are dropped: a photo
   * already under 1280 is encoded exactly once.
   */
  const longestSide = Math.max(meta.width ?? 0, meta.height ?? 0);
  const rungs = [
    ...new Set(DIMENSION_LADDER.map((d) => Math.min(d, longestSide))),
  ];

  let result!: Compressed;

  for (const dimension of rungs) {
    const buffer = await sharp(input)
      .rotate()
      .resize({
        width: dimension,
        height: dimension,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY })
      .toBuffer();

    const out = await sharp(buffer).metadata();
    result = { buffer, width: out.width ?? 0, height: out.height ?? 0 };

    if (buffer.byteLength <= TARGET_BYTES) break;
  }

  return result;
}

/**
 * Compress and store each photo, returning the public URLs in the order they
 * came in - the first one is the cover, so order matters.
 *
 * A failure on any single photo fails the whole call. The previous version
 * skipped the broken one and carried on, which published a jam with two photos
 * while reporting success.
 */
export async function uploadPhotos(
  formImages: File[],
): Promise<{ urls: string[] } | { error: string }> {
  try {
    const urls: string[] = [];

    for (const file of formImages) {
      if (file.size > MAX_INPUT_BYTES) {
        return {
          error: `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB. Photos have to be under 8 MB.`,
        };
      }

      const input = Buffer.from(await file.arrayBuffer());

      let output: Compressed;
      try {
        output = await compress(input);
      } catch (e) {
        console.error('Compression error:', e);
        return { error: `"${file.name}" could not be read as an image.` };
      }

      if (output.buffer.byteLength > MAX_OUTPUT_BYTES) {
        console.error(
          `Compression floor hit: ${file.name} still ${output.buffer.byteLength} bytes at ${output.width}x${output.height}`,
        );
        return {
          error: `"${file.name}" could not be compressed enough to store.`,
        };
      }

      // No part of the client's filename survives into the key: it was going in
      // raw, and two files landing in the same millisecond used to collide.
      const filePath = `images/${Date.now()}-${randomUUID()}.webp`;

      const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(filePath, output.buffer, {
          contentType: 'image/webp',
          cacheControl: '3600',
        });

      if (error) {
        console.error('Upload error:', error);
        return { error: `"${file.name}" could not be uploaded.` };
      }

      // Both numbers, so an oversized bucket can be traced back to a decision
      // rather than guessed at.
      console.log(
        `Stored ${filePath}: ${Math.round(file.size / 1024)} KB -> ${Math.round(output.buffer.byteLength / 1024)} KB at ${output.width}x${output.height}`,
      );

      urls.push(
        supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath).data
          .publicUrl,
      );
    }

    return { urls };
  } catch (e) {
    console.error('uploadPhotos failure:', e);
    return { error: 'Server error' };
  }
}
