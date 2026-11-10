# Fake photos retired, 11 Nov 2026

Cal confirmed the site's hero image and the six install gallery images were not real photos. The hero stays by his decision; the gallery fakes are retired. The jobs in the gallery are real.

- The home hero (`public/hero-solar.jpg` and `.webp`) is NOT trashed. It was briefly swapped for a real photo on 11 Nov, then restored on Cal's word: "i dont want you to change the hero image". Hero.tsx is exactly as it was. Only the link-share cards and schema image point at the real photo, `public/installs/solar-ireland-group-family-home-roof.jpg` (Cal's IMG_2818).
- `install-job-records.ts.txt`: the job records the gallery showed against the fake photos. Re-attach once Cal says which real photo is which job.
- `install-1.webp` to `install-6.webp`: the six fake gallery photos. The home gallery and the eight blog cards in `src/lib/blog-data.ts` that used them now point at the real photos in `public/installs/`.
