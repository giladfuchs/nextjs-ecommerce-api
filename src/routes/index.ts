import { Request, Response, Router } from 'express';
import { DB } from '../db';
import { Product, Collection } from '../entities';

const router = Router();

router.get('/check', async (req: Request, res: Response) => {
    res.json({ message: "it's working" });
});

router.get('/data', async (req: Request, res: Response) => {
    try {
        const [products, collections] = await Promise.all([
            DB.getRepository(Product).find({ relations: ['images'] }),
            DB.getRepository(Collection).find(),
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
                updatedAt: product.updatedAt,
            };
        });

        const formattedCollections = collections.map((collection: Collection) => ({
            handle: collection.handle,
            title: collection.title,
            updatedAt: collection.updatedAt,
        }));

        res.json({ products: formattedProducts, collections: formattedCollections });
    } catch (err) {
        console.error('❌ Failed to fetch data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
