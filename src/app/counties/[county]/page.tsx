import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CountyPage, { countyMetadata } from '@/components/county/CountyPage';
import { COUNTIES, getCounty } from '@/data/counties';

// Only counties with a data file exist; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return COUNTIES.map((c) => ({ county: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ county: string }> }): Promise<Metadata> {
  const c = getCounty((await params).county);
  return c ? countyMetadata(c) : {};
}

export default async function Page({ params }: { params: Promise<{ county: string }> }) {
  const c = getCounty((await params).county);
  if (!c) notFound();
  return <CountyPage county={c} />;
}
