import { Router, Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService';
import { currentUser } from '../middlewares/current-user';
import { requireAuth } from '../middlewares/require-auth';
import { requireRole } from '../middlewares/require-role';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validate-request';

export const adminRouter = (adminService: AdminService) => {
    const router = Router();

    // Правильное применение middleware
    router.use((req: Request, res: Response, next: NextFunction) => {
        currentUser(req, res, (err?: any) => {
            if (err) return next(err);
            requireAuth(req, res, (err?: any) => {
                if (err) return next(err);
                requireRole('admin')(req, res, next);
            });
        });
    });

    router.post(
        '/',
        [
            body('login').trim().isLength({ min: 2, max: 10 }).withMessage('Login must be 2-10 chars'),
            body('password').trim().isLength({ min: 2, max: 10 }).withMessage('Password must be 2-10 chars'),
            body('fio').trim().notEmpty().withMessage('Full name is required'),
            body('phone').trim().isMobilePhone('any').withMessage('Invalid phone number')
        ],
        (req: Request, res: Response, next: NextFunction) => {
            validateRequest(req, res, (err?: any) => {
                if (err) return next(err);
                (async () => {
                    try {
                        const { login, password, fio, phone } = req.body;
                        const admin = await adminService.createAdmin(login, password, fio, phone);
                        res.status(201).json(admin);
                    } catch (error: unknown) {
                        next(error);
                    }
                })();
            });
        }
    );

    router.put(
        '/credentials',
        [
            body('newLogin').trim().isLength({ min: 2, max: 10 }).optional(),
            body('newPassword').trim().isLength({ min: 2, max: 10 }).optional()
        ],
        (req: Request, res: Response, next: NextFunction) => {
            validateRequest(req, res, (err?: any) => {
                if (err) return next(err);
                (async () => {
                    try {
                        const { newLogin, newPassword } = req.body;
                        const admin = await adminService.updateAdminCredentials(
                            req.currentUser!.id,
                            newLogin,
                            newPassword
                        );
                        res.json(admin);
                    } catch (error: unknown) {
                        next(error);
                    }
                })();
            });
        }
    );

    return router;
};
