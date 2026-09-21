import { NextResponse } from 'next/server';
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();
// Relaxed limit: 60 clicks per minute per user
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');
  const token = searchParams.get('token');
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "anonymous";



  if (!placeId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  // 1. Light Rate Limit check.
  // Fail open, the way /api/public/places already does. Upstash throws when
  // UPSTASH_REDIS_REST_URL/_TOKEN are unset, and this call was the only one
  // in the file not guarded — so with no Redis configured the handler
  // rejected and Next answered 500 with an empty body. The caller then blew
  // up on res.json() with "Unexpected end of JSON input", swallowed it, and
  // picking a city silently did nothing.
  try {
    const { success } = await ratelimit.limit(ip);
    if (!success)
      return NextResponse.json({ error: "Too many clicks" }, { status: 429 });
  } catch (e) {
    console.error("Ratelimit bypass", e, ip);
  }

  // 2. Cache Check (Save $$$)
  try {
    const cached = await redis.get(`detail:${placeId}`);
    if (cached) return NextResponse.json(typeof cached === 'string' ? JSON.parse(cached) : cached);
  } catch (e) { console.error("Cache error", e); }

  // 3. Google Details API
  const googleUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  googleUrl.searchParams.set("place_id", placeId);
  googleUrl.searchParams.set("language", "en");
  googleUrl.searchParams.set("fields", "geometry,name,formatted_address");
  googleUrl.searchParams.set("key", process.env.GOOGLE_MAPS_API_KEY!);
  if (token) googleUrl.searchParams.set("sessiontoken", token);

  try {
    const res = await fetch(googleUrl.toString());
    const data = await res.json();

    if (data.status !== "OK") return NextResponse.json({ error: data.status }, { status: 400 });

    const result = {
      name: data.result.name,
      lat: data.result.geometry.location.lat,
      lng: data.result.geometry.location.lng,
      address: data.result.formatted_address
    };

    // 4. Cache forever. Also guarded: a cache write failing is not a
    // reason to fail a lookup that has already succeeded.
    try {
      await redis.set(`detail:${placeId}`, JSON.stringify(result));
    } catch (e) {
      console.error("Cache write error", e);
    }

    return NextResponse.json(result);
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}