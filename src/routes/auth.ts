import {Request, Response, Router} from 'express';
import multer from 'multer';
import {put} from '@vercel/blob';
import path from 'path';
import sharp from 'sharp';

import {DB} from '../db';
import {Product, Collection, ProductImage, Order} from '../entities';
import {title_to_handle} from "../util";
import {handleReorderCollection} from "../service";


const router = Router();
const upload = multer();

// Model lookup
const modelMap = {
    product: Product,
    collection: Collection,
};


router.post('/image', upload.single('image'), async (req: Request, res: Response) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({error: 'No image uploaded'});
        if (!file.mimetype.startsWith('image/'))
            return res.status(400).json({error: 'Only image files are allowed'});

        const safeFileName = path.basename(file.originalname);

        const resizedBuffer = await sharp(file.buffer)
            .resize(500, 500, {
                fit: 'cover',
                position: 'top',
            })
            .withMetadata({orientation: undefined})
            .jpeg({quality: 80})
            .toBuffer();

        const blob = await put(`products/${safeFileName}`, resizedBuffer, {
            access: 'public',
            allowOverwrite: true,
        });

        res.json({url: blob.url});
    } catch (err) {
        console.error('❌ Upload error:', err);
        res.status(500).json({
            error: 'Upload failed',
            message: err instanceof Error ? err.message : String(err),
        });
    }
});

router.get('/order/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({error: 'Invalid order ID'});
        }

        const order = await DB.getRepository(Order).findOne({
            where: {id},
            relations: ['items'], // fetch nested items
        });

        if (!order) {
            return res.status(404).json({error: 'Order not found'});
        }

        res.json(order);
    } catch (err) {
        console.error('❌ Failed to fetch order:', err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});
router.post('/order/status', async (req, res) => {
    const {id, status} = req.body;

    const repo = DB.getRepository(Order);
    const order = await repo.findOne({where: {id}});

    if (!order) return res.status(404).json({error: 'Not found'});

    order.status = status;
    await repo.save(order);

    res.json(order);
});
router.get('/orders', async (req: Request, res: Response) => {
    try {
        const orders = await DB.getRepository(Order).find({
            relations: ['items'], // adjust if your relation is named differently
            order: {createdAt: 'DESC'},
        });

        res.json(orders);
    } catch (err) {
        console.error('❌ Failed to fetch orders:', err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});
router.post('/product/:add_or_id', async (req: Request, res: Response) => {
    const {add_or_id} = req.params;
    const body = req.body;
    body.handle = title_to_handle(body.title);
    body.updatedAt = new Date();

    const repo = DB.getRepository(Product);
    const {images, ...productData} = body;

    if (add_or_id === 'add') {
        const product = new Product();
        Object.assign(product, productData);

        const savedProduct = await repo.save(product);
        if (Array.isArray(images)) {
            const imageRepo = DB.getRepository(ProductImage);
            const imageEntities = images.map((img) =>
                imageRepo.create({product: savedProduct, url: img.url, altText: img.altText})
            );
            await imageRepo.save(imageEntities);
        }

        return res.status(201).json({...savedProduct, images});
    }

    const existing = await repo.findOne({where: {id: Number(add_or_id)}, relations: ['images']});
    if (!existing) return res.status(404).json({error: 'Entity not found'});

    Object.assign(existing, productData);
    const updatedProduct = await repo.save(existing);

    if (Array.isArray(images)) {
        const imageRepo = DB.getRepository(ProductImage);
        await imageRepo.delete({product: updatedProduct});
        const newImages = images.map((img) =>
            imageRepo.create({product: updatedProduct, url: img.url, altText: img.altText})
        );
        await imageRepo.save(newImages);
    }

    return res.status(200).json({...updatedProduct, images});
});


router.post('/collection/:add_or_id', async (req: Request, res: Response) => {
    const {add_or_id} = req.params;
    const body = req.body;
    body.updatedAt = new Date();

    const repo = DB.getRepository(Collection);
    let instance;

    if (add_or_id === 'add') {
        instance = repo.create(body);
    } else {
        instance = await repo.preload({id: Number(add_or_id), ...body});
        if (!instance) return res.status(404).json({error: 'Entity not found'});
    }

    const saved = await repo.save(instance);
    const final = await handleReorderCollection(repo, saved as Collection);
    return res.status(add_or_id === 'add' ? 201 : 200).json(final);
});

export default router;
