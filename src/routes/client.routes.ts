import { Router, Request, Response, NextFunction } from 'express';
import { ClientService } from '../services/ClientService';
import { currentUser } from '../middlewares/current-user';
import { requireAuth } from '../middlewares/require-auth';
import { requireRole } from '../middlewares/require-role';

interface CreateClientBody {
    login: string;
    password: string;
    phone: string;
    companyName: string;
}

export const clientRouter = (clientService: ClientService) => {
    const router = Router();

    // Применяем middleware с правильной типизацией
    router.use((req: Request, res: Response, next: NextFunction) => {
        currentUser(req, res, (err?: any) => {
            if (err) return next(err);
            requireAuth(req, res, next);
        });
    });

    // Доступно только администраторам
    router.post(
        '/',
        (req: Request, res: Response, next: NextFunction) => {
            requireRole('admin')(req, res, (err?: any) => {
                if (err) return next(err);
                (async () => {
                    try {
                        const { login, password, phone, companyName } = req.body as CreateClientBody;
                        const client = await clientService.createClient(
                            login,
                            password,
                            phone,
                            companyName
                        );
                        res.status(201).json(client);
                    } catch (error: unknown) {
                        const message = error instanceof Error ? error.message : 'Unknown error';
                        res.status(400).json({ error: message });
                    }
                })();
            });
        }
    );

    // Доступно клиентам и администраторам
    router.get(
        '/:id/appeals',
        (req: Request, res: Response, next: NextFunction) => {
            requireRole('admin', 'client')(req, res, (err?: any) => {
                if (err) return next(err);
                (async () => {
                    try {
                        const clientId = req.params.id === 'me'
                            ? req.currentUser!.id
                            : parseInt(req.params.id);

                        // Проверка прав доступа
                        if (req.currentUser!.role === 'client' && clientId !== req.currentUser!.id) {
                            res.status(403).json({ error: 'Forbidden' });
                            return;
                        }

                        const appeals = await clientService.getClientAppeals(clientId);
                        res.json(appeals);
                    } catch (error: unknown) {
                        const message = error instanceof Error ? error.message : 'Unknown error';
                        res.status(400).json({ error: message });
                    }
                })();
            });
        }
    );

    return router;
};
