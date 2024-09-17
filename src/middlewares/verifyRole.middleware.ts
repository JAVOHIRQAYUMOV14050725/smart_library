import { Role } from "@enums";
import { ErrorHandler } from "@errors";
import { Request, Response, NextFunction } from "express";

export function checkRole(requiredRole: Role) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.role) {
            return next(new ErrorHandler("User role is not defined", 401));
        }

        console.log('User role:', req.user.role); 
        if (req.user.role !== requiredRole) {
            return next(new ErrorHandler("Forbidden", 403));
        }

        next();
    };
}
