import {Request, Response, Router} from 'express';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

import {DB} from '../db';
import {Product, Collection, OrderItem, Order, User} from '../entities';

const router = Router();

router.post('/checkout', async (req: Request, res: Response) => {
    try {
        const {name, email, phone, cart} = req.body;

        if (!cart || !Array.isArray(cart.lines)) {
            return res.status(400).json({error: 'Invalid cart'});
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
        res.status(500).json({error: 'Internal Server Error'});
    }
});
router.get('/data', async (req: Request, res: Response) => {
    try {
        const [products, collections] = await Promise.all([
            DB.getRepository(Product).find({relations: ['images']}),
            DB.getRepository(Collection).find({order: {position: 'ASC'}}),
        ]);

        const formattedProducts = products.map((product: Product) => {
            return {
                ...product,
                featuredImage: product.images[0],
            };
        });

        res.json({products: formattedProducts, collections});
    } catch (err) {
        console.error('❌ Failed to fetch data:', err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await DB.getRepository(User).findOneBy({ username });
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET!, {
        expiresIn: '8d',
    });

    res.cookie('token', token, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    res.json({ message: 'Login successful' });
});
export default router;
