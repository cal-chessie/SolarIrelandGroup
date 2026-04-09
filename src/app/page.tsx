import { unstable_noStore as noStore } from 'next/cache';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function Home() {
  noStore();
  return <HomeClient />;
}
