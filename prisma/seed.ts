// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { DEFAULT_SETTINGS } from "../src/constants/storeSettings";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding store settings...");

  const promises = Object.entries(DEFAULT_SETTINGS).map(([key, definition]) =>
    prisma.storeSetting.upsert({
      where: { key },
      update: {}, // Don't overwrite existing settings
      create: {
        key,
        value: definition.value,
        type: definition.type,
        category: definition.category,
        description: definition.description,
        isRequired: definition.isRequired,
      },
    })
  );

  await Promise.all(promises);

  console.log("✅ Store settings seeded successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
