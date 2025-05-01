// TypeORM version of your Supabase mock insert script
import "reflect-metadata";
import {DataSource} from "typeorm";

// @ts-ignore
import mockData from "./mock_products.json";
import {Product, ProductImage, Collection} from "../src/entities";
import {DB} from "../src/db";
import {title_to_handle} from "../src/util";


async function dropTables() {
    await DB.dropDatabase();
    await DB.synchronize();
}

async function resetTables() {
    const em = DB.manager;
    console.log("🧨 Deleting existing data...");
    await em.delete(ProductImage, {});
    await em.delete(Product, {});
    await em.delete(Collection, {});
    console.log("✅ Tables reset.");
}

async function insertData() {
    const em = DB.manager;
    console.log("📥 Inserting mock data...");

    for (const [index, c] of mockData.collections.entries()) {
        const collection = em.create(Collection, {
            title: c.title,
            handle: title_to_handle(c.title),
            position: index,
        });
        await em.save(collection);
    }
    const getRandomCollection = () => {
        const index = Math.floor(Math.random() * mockData.collections.length);
        return mockData.collections[index].title;
    };
    for (const p of mockData.products) {
        const product = em.create(Product, {
            handle: title_to_handle(p.title),
            collection: title_to_handle(getRandomCollection()),
            available: true,
            title: p.title,
            description: p.description,
            price: parseFloat(p.price),
        });

        const savedProduct = await em.save(product);

        for (const img of p.images) {
            const image = em.create(ProductImage, {
                product: savedProduct,
                url: img.url,
                altText: img.altText,
            });
            await em.save(image);
        }
    }

    console.log("✅ Mock data inserted successfully.");
}

DB.initialize()
    .then(async () => {
        await resetTables();
        await insertData();
        process.exit();
    })
    .catch((err) => {
        console.error("❌ Failed to run seed script", err);
        process.exit(1);
    });
// npx tsx  scripts/ORM.ts