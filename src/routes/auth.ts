import {Request, Response, Router} from 'express';
import {DB} from '../db';
import {Product, Collection, ProductImage} from '../entities';

const router = Router();

// Model lookup
const modelMap = {
    product: Product,
    collection: Collection,
};

import {ProductImage} from '../entities';
import {title_to_handle} from "../util";

router.post('/:model/:add_or_id', async (req: Request, res: Response) => {
    try {
        const {model, add_or_id} = req.params;
        const body = req.body;
        const Entity = modelMap[model as keyof typeof modelMap];
        if (!Entity) {
            return res.status(400).json({error: 'Unknown model'});
        }

        const repo = DB.getRepository(Entity);

        let instance;
        body.updatedAt = new Date();

        if (model === 'product') {
            body.handle = title_to_handle(body.title)
            const {images, ...productData} = body;

            if (add_or_id === 'add') {
                const product = new Product();
                Object.assign(product, productData);

                const savedProduct = await repo.save(product);

                if (Array.isArray(images)) {
                    const imageRepo = DB.getRepository(ProductImage);
                    const imageEntities = images.map((img) =>
                        imageRepo.create({
                            product: savedProduct,
                            url: img.url,
                            altText: img.altText,
                        })
                    );
                    await imageRepo.save(imageEntities);
                }

                return res.status(201).json({...savedProduct, images});
            } else {
                const existingProduct = await repo.findOne({
                    where: {id: Number(add_or_id)},
                    relations: ['images'],
                });

                if (!existingProduct) {
                    return res.status(404).json({error: 'Entity not found'});
                }

                Object.assign(existingProduct, productData);
                const updatedProduct = await repo.save(existingProduct);

                if (Array.isArray(images)) {
                    const imageRepo = DB.getRepository(ProductImage);
                    await imageRepo.delete({product: updatedProduct});

                    const newImages = images.map((img) =>
                        imageRepo.create({
                            product: updatedProduct,
                            url: img.url,
                            altText: img.altText,
                        })
                    );
                    await imageRepo.save(newImages);
                }

                return res.status(200).json({...updatedProduct, images});
            }
        }

        // generic fallback
        if (add_or_id === 'add') {
            instance = repo.create(body);
        } else {
            instance = await repo.preload({id: Number(add_or_id), ...body});
            if (!instance) {
                return res.status(404).json({error: 'Entity not found'});
            }
        }

        const saved = await repo.save(instance);
        res.status(200).json(saved);
    } catch (err) {
        console.error('❌ Error in generic add/update:', err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

export default router;
