import { seedDemoData } from "../lib/db";

async function main() {
  await seedDemoData();
  console.log("Demo events seeded.");
}

main();
