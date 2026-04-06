---
Task ID: 1
Agent: Main
Task: Fix hydration error + blog pagination + server stability

Work Log:
- Verified Navbar.tsx hydration fix (usePathname() replacing window.location.pathname) was already applied from previous session
- Fixed blog pagination: page 2 showed nothing because (a) no scroll-to-top when changing pages, (b) whileInView with once:true prevented re-animation of new articles
- Added gridRef + handlePageChange() to scroll to article grid on page change
- Changed article grid animation from whileInView+once to animate with key={currentPage} for proper re-animation on page change
- Updated all pagination buttons (prev, page numbers, next) to use handlePageChange()
- Cleared .next cache and rebuilt for production (next build)
- Built production server and started with node directly for stability

Stage Summary:
- Blog pagination now scrolls to grid and re-animates articles on page change
- All 7 static pages + 9+ blog posts returning HTTP 200
- Production server running stable on port 3000
