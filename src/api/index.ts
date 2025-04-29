import express from 'express';
import cors from 'cors';
import { Product, Collection } from '../entities';
import { DB } from '../db';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://yaara-tau.vercel.app'
  ],
  credentials: true
}));

let initialized = false;

app.get('/data', async (req, res) => {
  try {
    if (!initialized) {
      await DB.initialize();
      initialized = true;
    }

    const [products, collections] = await Promise.all([
      DB.getRepository(Product).find({ relations: ['images'] }),
      DB.getRepository(Collection).find()
    ]);

    const formattedProducts = products.map((product:Product) => {
      const images = product.images ?? [];
      return {
        id: product.id,
        handle: product.handle,
        collection: product.collection,
        availableForSale: product.availableForSale,
        title: product.title,
        description: product.description,
        price: product.price.toString(),
        featuredImage: images[0] || null,
        images,
        tags: [],
        updatedAt: product.updatedAt
      };
    });

    const formattedCollections = collections.map((collection) => ({
      handle: collection.handle,
      title: collection.title,
      updatedAt: collection.updatedAt
    }));

    res.json({ products: formattedProducts, collections: formattedCollections });
  } catch (err) {
    console.error('❌ Failed to fetch data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default app;
