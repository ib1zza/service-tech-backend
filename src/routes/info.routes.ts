import { Router, Request, Response, NextFunction } from 'express';
import { POinfoService } from '../services/POinfoService';
import { currentUser } from '../middlewares/current-user';
import { requireAuth } from '../middlewares/require-auth';
import { requireRole } from '../middlewares/require-role';

interface UpdateAboutInfoBody {
    text: string;
}

export const infoRouter = (poinfoService: POinfoService) => {
    const router = Router();

    router.get(
        '/about',
        async (req: Request, res: Response) => {
            try {
                const info = await poinfoService.getAboutInfo();
                res.json(info);
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Failed to get info';
                res.status(400).json({ error: message });
            }
        }
    );

    router.put(
        '/about',
        (req: Request, res: Response, next: NextFunction) => {
            currentUser(req, res, (err?: any) => {
                if (err) return next(err);
                requireAuth(req, res, (err?: any) => {
                    if (err) return next(err);
                    requireRole('admin')(req, res, next);
                });
            });
        },
        async (req: Request<{}, {}, UpdateAboutInfoBody>, res: Response) => {
            try {
                const { text } = req.body;
                const info = await poinfoService.updateAboutInfo(text);
                res.json(info);
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Failed to update info';
                res.status(400).json({ error: message });
            }
        }
    );

    return router;
};
