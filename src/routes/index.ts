import { Request, Response, Router } from 'express';
import { DB } from '../db';
import {Product, Collection, OrderItem, Order} from '../entities';
import authRouter from './auth';

const router = Router();
router.use('/auth', authRouter);
router.get('/check', async (req: Request, res: Response) => {
    res.json({ message: "it's working" });
});


router.post('/checkout', async (req: Request, res: Response) => {
    try {
        const { name, email, phone, cart } = req.body;

        if (!cart || !Array.isArray(cart.lines)) {
            return res.status(400).json({ error: 'Invalid cart' });
        }

        const order = new Order();
        order.name = name;
        order.email = email;
        order.phone = String(phone);
        order.totalQuantity = cart.totalQuantity;
        order.cost = cart.cost;

        order.items = cart.lines.map((item: any) => {
            const orderItem = new OrderItem();
            orderItem.productId = item.productId;
            orderItem.handle = item.handle;
            orderItem.title = item.title;
            orderItem.imageUrl = item.imageUrl;
            orderItem.imageAlt = item.imageAlt;
            orderItem.quantity = item.quantity;
            orderItem.unitAmount = item.unitAmount;
            orderItem.totalAmount = item.totalAmount;
            return orderItem;
        });

        const savedOrder = await DB.getRepository(Order).save(order);

        res.status(201).json(savedOrder);
    } catch (err) {
        console.error('❌ Failed to save order:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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
                updatedAt: product.updatedAt,
            };
        });

        res.json({ products: formattedProducts, collections });
    } catch (err) {
        console.error('❌ Failed to fetch data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
