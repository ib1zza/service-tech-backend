import { Router, Request, Response, NextFunction } from 'express';
import { StaffService } from '../services/StaffService';
import { currentUser } from '../middlewares/current-user';
import { requireAuth } from '../middlewares/require-auth';
import { requireRole } from '../middlewares/require-role';

interface CreateStaffBody {
    login: string;
    password: string;
    fio: string;
}

export const staffRouter = (staffService: StaffService) => {
    const router = Router();

    // Proper middleware chaining with error handling
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
        async (req: Request<{}, {}, CreateStaffBody>, res: Response) => {
            try {
                const { login, password, fio } = req.body;
                const staff = await staffService.createStaff(login, password, fio);
                res.status(201).json(staff);
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Failed to create staff member';
                res.status(400).json({ error: message });
            }
        }
    );

    router.get(
        '/:id/appeals',
        async (req: Request<{ id: string }>, res: Response) => {
            try {
                const staffId = parseInt(req.params.id);
                if (isNaN(staffId)) {
                    res.status(400).json({ error: 'Invalid staff ID' });
                    return;
                }

                const appeals = await staffService.getStaffAppeals(staffId);
                res.json(appeals);
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Failed to get staff appeals';
                res.status(400).json({ error: message });
            }
        }
    );

    return router;
};
