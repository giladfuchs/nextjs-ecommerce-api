import express from 'express';
import cors from 'cors';
import {Product,  Collection} from "./entities";
import {DB} from "./db";


const app = express();


DB.initialize()
    .then(() => {
      console.log("✅ DB connected");
      app.listen(5002, () => {
        console.log("Server running at http://localhost:5002");
      });
    })
    .catch(err => {
      console.error("❌ Failed to connect DB", err);
    });

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://yaara-tau.vercel.app'
  ],
  credentials: true
}));
app.get('/data', async (req, res) => {
  try {
    const [products, collections] = await Promise.all([
      DB.getRepository(Product).find({ relations: ["images"] }),
      DB.getRepository(Collection).find()
    ]);

    const formattedProducts = products.map((product:Product) => {
      const images = (product as any).images ?? []; // adjust if needed based on your relation setup
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


