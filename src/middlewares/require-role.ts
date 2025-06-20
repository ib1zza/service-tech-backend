import { Request, Response, NextFunction } from 'express';

export const requireRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.currentUser || !roles.includes(req.currentUser.role)) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        next();
    };
};
