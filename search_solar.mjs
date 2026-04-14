import ZAI from 'z-ai-web-dev-sdk';
import { writeFileSync } from 'fs';

async function main() {
  const zai = await ZAI.create();

  const queries = [
    { id: 1, query: "best solar panel companies Ireland 2025 2026" },
    { id: 2, query: "top rated solar PV installers Ireland reviews" },
    { id: 3, query: "solar companies Ireland website features customer portal" },
    { id: 4, query: "SEAI registered solar panel installers Ireland list" },
  ];

  for (const { id, query } of queries) {
    console.log(`Running search ${id}: "${query}"...`);
    try {
      const results = await zai.functions.invoke('web_search', { query, num: 10 });
      const outPath = `/home/z/my-project/download/search_results_${id}.json`;
      writeFileSync(outPath, JSON.stringify(results, null, 2));
      console.log(`  → Saved ${results.length} results to ${outPath}`);
    } catch (err) {
      console.error(`  → ERROR: ${err.message}`);
    }
  }

  console.log("Done.");
}

main().catch(console.error);
