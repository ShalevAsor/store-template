import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 99.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
  },
  {
    name: "Coffee Mug",
    description: "Ceramic coffee mug perfect for your morning brew",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500",
  },
  {
    name: "Running Shoes",
    description: "Comfortable running shoes for your daily workout",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
  },
  {
    name: "Smartphone Case",
    description: "Protective case for your smartphone with elegant design",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500",
  },
  {
    name: "Desk Lamp",
    description: "Modern LED desk lamp with adjustable brightness",
    price: 45.99,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
  },
  {
    name: "Backpack",
    description: "Durable backpack perfect for travel and daily use",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
  },
];

async function main() {
  console.log("Starting seed...");

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
