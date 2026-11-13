// Shared by Navbar.tsx and NavbarMobileMenu.tsx (split, perf 13 Nov 2026).

/** "Check my savings" lands on the Bill Analyser: in place on the homepage, the calculator page anywhere else. */
export const savingsHref = (pathname: string) => (pathname === '/' ? '/#calculator' : '/solar-calculator');
/** On the homepage the calculator is the analyser on the page (DECISIONS.md R6); everywhere else, unchanged. */
export const onPage = (pathname: string, href: string) => (pathname === '/' && href === '/solar-calculator' ? '/#calculator' : href);

