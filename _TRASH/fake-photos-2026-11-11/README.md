# Fake photos retired, 11 Nov 2026

Cal confirmed the site's hero image and the six install gallery images were not real photos. The jobs in the gallery are real.

- `hero-solar.jpg`, `hero-solar.webp`: the old home hero and the link-share/schema image. Replaced by `public/installs/solar-ireland-group-family-home-roof.(webp|jpg)` (Cal's IMG_2818). Every reference was re-pointed.
- `install-job-records.ts.txt`: the job records the gallery showed against the fake photos. Re-attach once Cal says which real photo is which job.
- `public/install-1.webp` to `install-6.webp` are still in `public/`: the blog cards in `src/lib/blog-data.ts` use them (8 entries), and that file was outside this change's allowlist. Moving them would 404 the blog. They leave once the blog images are re-pointed.
