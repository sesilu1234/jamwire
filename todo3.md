- las cards quizas mas arriba o en medio ( en movil)

- quitar lo de free view o lock

- en movil, en la parte de arriba : lo de filter y serach bar, dar mas espacio y
  aire que respire ..
  - en el mapa, pintar un circulo (solo la circunferencia seguramente ) para que
    el usuario sepa cuanto de lejos esta mirando
    - quizas en vez de lo de cities poner jams en general, listado (sin mapa)
      ... o mejorar un poco esa pagina para poder buscar jams directamente (sin
      mas un directorio de jams, incluso aunque no tengan fecha ...)

- en movil las jams found number marcarlo en mapa quizas. y tambien quizas el
  modo de busqueda

- en pc , dar mas pading arriba un pelin para que respire en home ( y lo de que
  son las jams y eplicacion..eso igual quitarlo pues queda mal ... o ponerlo
  despues de cities, o mejorarlo con colores....)

What you must do manually 🔴 Blocking — before the new domain works Buy/point
jamwire.xyz, then change one line: BRAND.siteUrl in lib/brand.ts:35. Everything
else follows automatically. Two GitHub workflow URLs still POST to
www.jamspots.xyz — weekly-jams-maintenance.yml:16 and calculate-priority.yml:18.
If the old domain dies, your cron jobs die silently. Vercel → add the new
domain, keep the old one redirecting. Google Search Console → add the new
property, submit the sitemap, and file a Change of Address. Skip this and you
lose your existing ranking. 🟡 Assets you need to design (I can't generate these
properly) Favicon. app/icon.png and public/icon.png are the old yellow "j" on
black — wrong palette now (the new mark is yellow / dark-red / teal). You need a
single-letter "J" in the new colours. Also app/favicon_7.ico and
favicon_vercel.ico. A real OG image. This one's a genuine bug: the code declares
width: 1200, height: 630 for social previews, but the file it points at is
522×151. Link previews on WhatsApp/Twitter/Facebook will render small or
letterboxed. Make a proper 1200×630 image with the logo on a background. 🟢
Third-party names (cosmetic, but visible to users) Google OAuth consent screen —
still says "Jamspots" when people sign in. That one's user-facing. Supabase
project name, Vercel project name, GitHub repo name, local folder
(Downloads\jamspots), social handles. ⚠️ Do NOT rename (my recommendation)
jamspots_imageBucket (6 code refs) and s3://jamspots-pg-dump. Renaming the
bucket breaks every existing image URL already stored in your database — you'd
need a data migration for zero user-visible benefit. Nobody sees a bucket name.
Leave them; lib/brand.ts documents why. 📝 Cleanup when you stop trying logos
Delete the TEMP panel block in HomeComponent.tsx and the 12
public/jamwire-\*.png candidates. Unrelated but I noticed it: app/about/page.tsx
is still a placeholder that says "This is the About page." — and your footer
links to it. Want me to take on #6 (a proper 1200×630 OG image composed from the
logo)? That one's mechanical, not a design judgement call, so I can build it
now.
