import {Collection} from './entities';
import {Not, Repository} from 'typeorm';

import {Request, Response, NextFunction} from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({error: 'Unauthorized'});
    }

    next();
}

export async function handleReorderCollection(
    repo: Repository<Collection>,
    saved: Collection
): Promise<Collection> {
    const all = await repo.find({
        where: {id: Not(saved.id)},
        order: {position: 'ASC'},
    });

    const targetPos = saved.position ?? all.length + 1;
    const updatedList: Collection[] = [];
    let inserted = false;
    let currentPos = 1;

    for (const c of all) {
        if (!inserted && currentPos === targetPos) {
            updatedList.push({...saved, position: currentPos++});
            inserted = true;
        }
        updatedList.push({...c, position: currentPos++});
    }

    if (!inserted) {
        updatedList.push({...saved, position: currentPos});
    }

    await repo.save(updatedList);
    return updatedList.find((c) => c.id === saved.id)!;
}