import jwt from 'jsonwebtoken';
import {Not, Repository} from 'typeorm';
import {Request, Response, NextFunction} from 'express';

import {Collection} from './entities';


export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        (req as any).user = decoded; // optional: attach to req.user
        next();
    } catch (err) {
        console.error('❌ Invalid token', err);
        return res.status(401).json({ error: 'Unauthorized - invalid token' });
    }
}
export async function handleReorderCollection(
    repo: Repository<Collection>,
    saved: Collection
): Promise<Collection> {
    const all = await repo.find({
        order: { position: 'ASC' },
    });

    // Remove the item we're updating if it already exists
    const filtered = all.filter((item) => item.id !== saved.id);

    const targetPos = Math.max(1, Math.min(saved.position ?? filtered.length + 1, filtered.length + 1));
    const updatedList: Collection[] = [];

    let inserted = false;

    for (let i = 0, pos = 1; i <= filtered.length; i++) {
        if (pos === targetPos && !inserted) {
            updatedList.push({ ...saved, position: pos++ });
            inserted = true;
        }

        if (i < filtered.length) {
            updatedList.push({ ...filtered[i], position: pos++ });
        }
    }

    await repo.save(updatedList);
    return updatedList.find((c) => c.id === saved.id)!;
}