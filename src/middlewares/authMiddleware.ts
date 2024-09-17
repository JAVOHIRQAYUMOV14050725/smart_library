import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ErrorHandler } from "@errors";
import { Role } from "@enums";

interface AuthenticatedUser {
    id: number;
    name: string;
    email: string;
    password: string;
    role: Role;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return next(new ErrorHandler("Token taqdim etilmagan", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY as string) as AuthenticatedUser;
        req.user = decoded;
        next();
    } catch (error) {
        next(new ErrorHandler("Noto'g'ri token", 401));
    }
}
