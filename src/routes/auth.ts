import { Request, Response, Router } from 'express';
import { DB } from '../db';
import { Product, Collection } from '../entities';

const router = Router();

// Model lookup
const modelMap = {
    product: Product,
    collection: Collection,
};
router.get('/check', async (req: Request, res: Response) => {
    res.json({ message: "it's auth working" });
});

router.post('/:model/:add_or_id', async (req: Request, res: Response) => {
    try {
        const { model, add_or_id } = req.params;
        const body = req.body;

        const Entity = modelMap[model as keyof typeof modelMap];
        if (!Entity) {
            return res.status(400).json({ error: 'Unknown model' });
        }

        const repo = DB.getRepository(Entity);
        let instance;
        if (add_or_id === 'add') {
            instance = repo.create(body);
        } else {
            instance = await repo.preload({ id: Number(add_or_id), ...body });
            if (!instance) {
                return res.status(404).json({ error: 'Entity not found' });
            }
        }

        const saved = await repo.save(instance);
        res.status(200).json(saved);
    } catch (err) {
        console.error('❌ Error in generic add/update:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
