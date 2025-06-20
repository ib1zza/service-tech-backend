import { Request, Response, NextFunction } from 'express';

export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.currentUser) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    next();
};
