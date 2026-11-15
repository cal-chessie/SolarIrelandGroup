// Shared by Navbar.tsx and NavbarMobileMenu.tsx (split, perf 13 Nov 2026).

/** "Check my savings" lands on the Bill Analyser: in place on the homepage, the calculator page anywhere else. */
export const savingsHref = (pathname: string) => (pathname === '/' ? '/#calculator' : '/solar-calculator');
/** On the homepage the calculator is the analyser on the page (DECISIONS.md R6); everywhere else, unchanged. */
export const onPage = (pathname: string, href: string) => (pathname === '/' && href === '/solar-calculator' ? '/#calculator' : href);


/**
 * Nav items are real <a href> links (15 Nov 2026) so crawlers can follow them;
 * they were <button onClick> and passed no link equity. A plain primary click
 * gets the old in-page behaviour (smooth scroll, menu close). Any modified
 * click (new tab, new window, download) is left to the browser.
 */
export const isPlainClick = (e: {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
}) => !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
