import { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { DB } from './db';
import { Product, Collection } from './entities';

const app = express();
app.use(cors());
// app.use(
//     cors({
//         origin: [
//             'http://localhost:3000',
//             'https://yaara-tau.vercel.app'
//         ],
//         credentials: true
//     })
// );

let initialized = false;

app.get('/check', async (req: Request, res: Response) => {
  res.json({ message: "its work" });

})
app.get('/data', async (req: Request, res: Response) => {
  try {
    if (!initialized) {
      await DB.initialize();
      initialized = true;
    }

    const [products, collections] = await Promise.all([
      DB.getRepository(Product).find({ relations: ['images'] }),
      DB.getRepository(Collection).find()
    ]);

    const formattedProducts = products.map((product: Product) => {
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

    const formattedCollections = collections.map((collection:Collection) => ({
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

// ✅ THIS IS WHAT VERCEL NEEDS
export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req as any, res as any);
}
