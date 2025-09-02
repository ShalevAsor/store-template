import { PrismaClient, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

// Helper function to get random stock for physical products
function getRandomStock(): number | null {
  // 20% chance of unlimited stock (null)
  if (Math.random() < 0.2) return null;
  // Otherwise random stock between 5-50
  return Math.floor(Math.random() * 46) + 5;
}

// Categories for products
const categories = [
  "Electronics",
  "Home & Kitchen",
  "Sports & Outdoors",
  "Books & Education",
  "Health & Wellness",
  "Office Supplies",
  "Travel",
  "Digital Products",
];

const products = [
  // Electronics
  {
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 99.99,
    compareAtPrice: 129.99,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500",
    ],
    isDigital: false,
    category: "Electronics",
    sku: "WH-001",
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable Bluetooth speaker with amazing sound quality",
    price: 79.99,
    compareAtPrice: 99.99,
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500",
    ],
    isDigital: false,
    category: "Electronics",
    sku: "BS-001",
  },
  {
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse for productivity",
    price: 39.99,
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
    ],
    isDigital: false,
    category: "Electronics",
    sku: "WM-001",
  },
  {
    name: "Wireless Keyboard",
    description: "Compact wireless keyboard for productivity",
    price: 69.99,
    images: [
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500",
    ],
    isDigital: false,
    category: "Electronics",
    sku: "WK-001",
  },
  {
    name: "Portable Charger",
    description: "High-capacity portable phone charger",
    price: 49.99,
    images: [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500",
    ],
    isDigital: false,
    category: "Electronics",
    sku: "PC-001",
  },

  // Home & Kitchen
  {
    name: "Coffee Mug",
    description: "Ceramic coffee mug perfect for your morning brew",
    price: 15.99,
    images: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500",
    ],
    isDigital: false,
    category: "Home & Kitchen",
    sku: "CM-001",
  },
  {
    name: "Desk Lamp",
    description: "Modern LED desk lamp with adjustable brightness",
    price: 45.99,
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
    ],
    isDigital: false,
    category: "Home & Kitchen",
    sku: "DL-001",
  },
  {
    name: "Water Bottle",
    description: "Insulated stainless steel water bottle",
    price: 29.99,
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500",
    ],
    isDigital: false,
    category: "Home & Kitchen",
    sku: "WB-001",
  },
  {
    name: "Plant Pot Set",
    description: "Set of 4 ceramic plant pots with drainage",
    price: 34.99,
    compareAtPrice: 49.99,
    images: [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500",
    ],
    isDigital: false,
    category: "Home & Kitchen",
    sku: "PPS-001",
  },

  // Sports & Outdoors
  {
    name: "Running Shoes",
    description: "Comfortable running shoes for your daily workout",
    price: 89.99,
    compareAtPrice: 120.0,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500",
    ],
    isDigital: false,
    category: "Sports & Outdoors",
    sku: "RS-001",
  },
  {
    name: "Yoga Mat",
    description: "Premium yoga mat for your daily practice",
    price: 35.99,
    images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500"],
    isDigital: false,
    category: "Sports & Outdoors",
    sku: "YM-001",
  },
  {
    name: "Backpack",
    description: "Durable backpack perfect for travel and daily use",
    price: 59.99,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
      "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=500",
    ],
    isDigital: false,
    category: "Sports & Outdoors",
    sku: "BP-001",
  },

  // Digital Products
  {
    name: "Digital Marketing Course",
    description: "Complete digital marketing course with certificates",
    price: 199.99,
    compareAtPrice: 299.99,
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500",
    ],
    isDigital: true,
    category: "Digital Products",
    sku: "DMC-001",
  },
  {
    name: "E-book: Web Development",
    description: "Comprehensive guide to modern web development",
    price: 49.99,
    images: [
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500",
    ],
    isDigital: true,
    category: "Digital Products",
    sku: "EWD-001",
  },
  {
    name: "Design Templates Pack",
    description: "Collection of 50+ professional design templates",
    price: 89.99,
    compareAtPrice: 149.99,
    images: ["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500"],
    isDigital: true,
    category: "Digital Products",
    sku: "DTP-001",
  },
  {
    name: "Stock Photo Bundle",
    description: "Bundle of 500 high-resolution stock photos",
    price: 79.99,
    images: [
      "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=500",
    ],
    isDigital: true,
    category: "Digital Products",
    sku: "SPB-001",
  },

  // Office Supplies
  {
    name: "Smartphone Case",
    description: "Protective case for your smartphone with elegant design",
    price: 24.99,
    images: ["https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500"],
    isDigital: false,
    category: "Electronics",
    sku: "SC-001",
  },
  {
    name: "Phone Stand",
    description: "Adjustable phone stand for desk or nightstand",
    price: 19.99,
    images: [
      "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=500",
    ],
    isDigital: false,
    category: "Office Supplies",
    sku: "PS-001",
  },
  {
    name: "Notebook Set",
    description: "Set of 3 premium notebooks for journaling",
    price: 24.99,
    images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"],
    isDigital: false,
    category: "Office Supplies",
    sku: "NS-001",
  },
  {
    name: "Desk Organizer",
    description: "Bamboo desk organizer with multiple compartments",
    price: 42.99,
    images: [
      "https://images.unsplash.com/photo-1586953983027-d7508a64f4bb?w=500",
    ],
    isDigital: false,
    category: "Office Supplies",
    sku: "DO-001",
  },
];

async function main() {
  console.log("Starting seed...");

  // Clear existing data
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  console.log("Cleared existing products and images...");

  // Insert new products with images
  for (const productData of products) {
    const { images, ...productFields } = productData;

    // Create product
    const product = await prisma.product.create({
      data: {
        ...productFields,
        slug: generateSlug(productData.name),
        status: ProductStatus.ACTIVE,
        stock: productData.isDigital ? null : getRandomStock(), // Digital = unlimited, Physical = random stock
      },
    });

    // Create product images
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl: images[i],
          altText: `${product.name} - Image ${i + 1}`,
          sortOrder: i,
        },
      });
    }

    console.log(`Created product: ${product.name}`);
  }

  console.log(`Seed completed! Added ${products.length} products with images.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
