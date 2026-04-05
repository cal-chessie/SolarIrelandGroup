import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solar Panels Ireland | 32 County Solar Installers Directory',
  description:
    'Find solar panel installers in all 32 counties of Ireland. Solar Ireland is the parent brand connecting local county sites with expert installation, SEAI grants, and free surveys nationwide.',
  openGraph: {
    title: 'Solar Panels Ireland | 32 County Solar Installers Directory',
    description:
      'Find solar panel installers in all 32 counties of Ireland. Local expertise, tailored pricing, and SEAI-registered installations from Dublin to Donegal.',
  },
};

export default function CountiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
