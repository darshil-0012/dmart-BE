import crypto from "node:crypto";
import { inArray } from "drizzle-orm";

import { db } from "../index";
import { product } from "../schema/product";

const PRODUCT_DEFINITIONS = [
  {
    name: "Dove Shampoo 200ml",
    description: "Dove Shampoo 200ml",
    price: 99,
  },
  {
    name: "Tata Salt 1kg",
    description: "Tata Salt 1kg",
    price: 22,
  },
  {
    name: "Surf Excel Detergent 500g",
    description: "Surf Excel Detergent 500g",
    price: 55,
  },
  {
    name: "Amul Butter 100g",
    description: "Amul Butter 100g",
    price: 56,
  },
  {
    name: "Parle-G Biscuits 800g",
    description: "Parle-G Biscuits 800g",
    price: 45,
  },
  {
    name: "Aashirvaad Atta 5kg",
    description: "Aashirvaad Whole Wheat Atta 5kg",
    price: 289,
  },
  {
    name: "Fortune Sunflower Oil 1L",
    description: "Fortune Sunflower Oil 1L",
    price: 148,
  },
  {
    name: "MDH Kitchen King 100g",
    description: "MDH Kitchen King Masala 100g",
    price: 74,
  },
  {
    name: "Maggi Noodles Pack of 12",
    description: "Maggi 2-Minute Noodles Masala Pack of 12",
    price: 168,
  },
  {
    name: "Amul Taaza Milk 1L",
    description: "Amul Taaza Toned Milk 1L",
    price: 58,
  },
  {
    name: "Britannia Bread 400g",
    description: "Britannia Daily Fresh Bread 400g",
    price: 42,
  },
  {
    name: "Nescafe Classic 100g",
    description: "Nescafe Classic Instant Coffee 100g",
    price: 359,
  },
  {
    name: "Taj Mahal Tea 500g",
    description: "Taj Mahal Tea 500g",
    price: 315,
  },
  {
    name: "Red Label Tea 1kg",
    description: "Brooke Bond Red Label Tea 1kg",
    price: 565,
  },
  {
    name: "Kellogg's Corn Flakes 475g",
    description: "Kellogg's Corn Flakes Original 475g",
    price: 185,
  },
  {
    name: "Saffola Oats 1kg",
    description: "Saffola Classic Masala Oats 1kg",
    price: 239,
  },
  {
    name: "Tata Sampann Toor Dal 1kg",
    description: "Tata Sampann Unpolished Toor Dal 1kg",
    price: 176,
  },
  {
    name: "India Gate Basmati Rice 5kg",
    description: "India Gate Basmati Rice Classic 5kg",
    price: 629,
  },
  {
    name: "Sundrop Peanut Butter 462g",
    description: "Sundrop Crunchy Peanut Butter 462g",
    price: 205,
  },
  {
    name: "Nutella Hazelnut Spread 350g",
    description: "Nutella Hazelnut Spread with Cocoa 350g",
    price: 379,
  },
  {
    name: "Good Day Cashew 200g",
    description: "Britannia Good Day Cashew Cookies 200g",
    price: 45,
  },
  {
    name: "MTR Idli Mix 500g",
    description: "MTR Instant Idli Mix 500g",
    price: 98,
  },
  {
    name: "Patanjali Honey 500g",
    description: "Patanjali Pure Honey 500g",
    price: 185,
  },
  {
    name: "Dabur Chyawanprash 500g",
    description: "Dabur Chyawanprash 500g",
    price: 205,
  },
  {
    name: "Harpic Toilet Cleaner 500ml",
    description: "Harpic Power Plus Toilet Cleaner 500ml",
    price: 112,
  },
  {
    name: "Lizol Floor Cleaner 1L",
    description: "Lizol Citrus Floor Cleaner 1L",
    price: 169,
  },
  {
    name: "Dettol Handwash 900ml",
    description: "Dettol Original Liquid Handwash Refill 900ml",
    price: 174,
  },
  {
    name: "Colgate Strong Teeth 200g",
    description: "Colgate Strong Teeth Toothpaste 200g",
    price: 118,
  },
  {
    name: "Vaseline Body Lotion 400ml",
    description: "Vaseline Intensive Care Body Lotion 400ml",
    price: 289,
  },
  {
    name: "Pampers Pants Medium 34s",
    description: "Pampers Baby Dry Pants Medium 34 Count",
    price: 449,
  },
  {
    name: "Pedigree Adult Dog Food 3kg",
    description: "Pedigree Adult Dry Dog Food Chicken and Vegetables 3kg",
    price: 760,
  },
  {
    name: "Lays Classic Salted 140g",
    description: "Lays Classic Salted Potato Chips 140g",
    price: 65,
  },
  {
    name: "Paper Boat Aamras 1L",
    description: "Paper Boat Aamras Drink 1L",
    price: 110,
  },
  {
    name: "Coca-Cola 2.25L",
    description: "Coca-Cola Soft Drink 2.25L",
    price: 105,
  },
  {
    name: "Bisleri Water 1L",
    description: "Bisleri Mineral Water 1L",
    price: 20,
  },
] as const;

export async function seedProduct(): Promise<void> {
  const existing = await db
    .select({ name: product.name })
    .from(product)
    .where(
      inArray(
        product.name,
        PRODUCT_DEFINITIONS.map((item) => item.name)
      )
    );

  const existingNames = new Set(existing.map((item) => item.name));
  const missingProducts = PRODUCT_DEFINITIONS.filter(
    (item) => !existingNames.has(item.name)
  ).map((item) => ({
    id: crypto.randomUUID(),
    ...item,
  }));

  if (missingProducts.length === 0) {
    console.log("Products seed: all products already exist.");
    return;
  }

  await db.insert(product).values(missingProducts);

  console.log(`Products seed: inserted ${missingProducts.length} products.`);
}
