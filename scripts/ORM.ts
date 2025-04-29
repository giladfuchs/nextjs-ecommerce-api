// TypeORM version of your Supabase mock insert script
import "reflect-metadata";
import {DataSource} from "typeorm";

// @ts-ignore
import mockData from "./mock_products.json";
import {Product, ProductImage, Collection} from "../src/entities";
import {DB} from "../src/db";


export function title_to_handle(title: string): string {
    const handle = title.trim().replace(/\s+/g, '-'); // Replace spaces with dash
    return handle
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

    for (const c of mockData.collections) {
        const collection = em.create(Collection, {
            title: c.title,
            handle: title_to_handle(c.title),
        });
        await em.save(collection);
    }

    for (const p of mockData.products) {
        const product = em.create(Product, {
            handle: p.handle,
            collection: p.collection,
            availableForSale: p.availableForSale,
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
