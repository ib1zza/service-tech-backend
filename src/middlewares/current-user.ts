import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            currentUser?: {
                id: number;
                role: string;
            };
        }
    }
}

export const currentUser = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return next();
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: number;
            role: string;
        };
        req.currentUser = payload;
    } catch (err) {
        // Пропускаем ошибку верификации
    }

    next();
};
