import { unstable_noStore as noStore } from 'next/cache';
import HomeClient from './HomeClient';
import HomeSchema from '@/components/HomeSchema';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function Home() {
  noStore();
  return (
    <>
      <HomeSchema />
      <HomeClient />
    </>
  );
}
