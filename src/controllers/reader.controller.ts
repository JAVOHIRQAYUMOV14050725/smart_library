import { Request, Response, NextFunction } from "express";
import { PrismaClient, User } from "@prisma/client";
import { ErrorHandler } from "@errors";
import { Role } from "@enums";
import bcrypt from "bcrypt";

const client = new PrismaClient();

function validateId(id: string): number {
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
        throw new ErrorHandler('Invalid ID format', 400);
    }
    return idNumber;
}

function sendResponse(res: Response, statusCode: number, success: boolean, message: string, data?: any) {
    res.status(statusCode).json({ success, message, data });
}

function validateUserData(data: Partial<User>): string[] {
    const errors: string[] = [];
    if (data.name !== undefined && typeof data.name !== 'string') errors.push('Name must be a string');
    if (data.email !== undefined && typeof data.email !== 'string') errors.push('Email must be a string');
    if (data.password !== undefined && typeof data.password !== 'string') errors.push('Password must be a string');
    if (data.role !== undefined && !Object.values(Role).includes(data.role as Role)) errors.push(`Role must be one of: ${Object.values(Role).join(', ')}`);
    return errors;
}

export class LibrarianUserController {
    static async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);
            const { name, email, password, role }: Partial<User> = req.body;

            const user = req.user as User;

            if (user.role === Role.LIBRARIAN) {
                const existingUser = await client.user.findUnique({ where: { id: idNumber } });
                if (!existingUser) {
                    return next(new ErrorHandler('User not found', 404));
                }

                if (existingUser.role === Role.ADMIN || existingUser.role === Role.AUTHOR) {
                    return next(new ErrorHandler('Cannot update Admin or Author users', 403));
                }

                const errors = validateUserData({ name, email, password, role });
                if (errors.length > 0) {
                    return next(new ErrorHandler(errors.join(', '), 400));
                }

                const updatedUser = await client.user.update({
                    where: { id: idNumber },
                    data: { name: name ?? existingUser.name, email: email ?? existingUser.email, password: password ?? existingUser.password, role: role ?? existingUser.role },
                });

                sendResponse(res, 200, true, "User updated successfully", updatedUser);
            } else {
                throw new ErrorHandler('Librarian privileges required', 403);
            }
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);
            const user = req.user as User;

            if (user.role === Role.LIBRARIAN) {
                const existingUser = await client.user.findUnique({ where: { id: idNumber } });
                if (!existingUser) {
                    return next(new ErrorHandler('reader not found', 404));
                }

                if (existingUser.role === Role.ADMIN || existingUser.role === Role.AUTHOR) {
                    return next(new ErrorHandler('Cannot delete Admin or Author users', 403));
                }


                await client.user.delete({ where: { id: idNumber } });
                sendResponse(res, 200, true, "User deleted successfully");
            } else {
                throw new ErrorHandler('Librarian privileges required', 403);
            }
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async getReaders(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as User;

            if (user.role === Role.LIBRARIAN) {
                const readers: User[] = await client.user.findMany({ where: { role: Role.READER } });
                sendResponse(res, 200, true, "Readers fetched successfully", readers);
            } else {
                throw new ErrorHandler('Librarian privileges required', 403);
            }
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch readers: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }
}
