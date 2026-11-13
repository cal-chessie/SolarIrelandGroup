import CountiesClient from './CountiesClient';

const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://solarirelandgroup.ie' },
    { '@type': 'ListItem', position: 2, name: 'County Directory', item: 'https://solarirelandgroup.ie/counties' },
  ],
};

export default function CountiesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <CountiesClient />
    </>
  );
}
