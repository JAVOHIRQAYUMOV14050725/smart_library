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
    const response: { success: boolean, message: string } = { success, message };
    if (data) response.message = data;
    res.status(statusCode).json(response);
}

function validateUserData(data: Partial<User>): string[] {
    const errors: string[] = [];
    if (data.name !== undefined && typeof data.name !== 'string') errors.push('Name must be a string');
    if (data.email !== undefined && typeof data.email !== 'string') errors.push('Email must be a string');
    if (data.password !== undefined && typeof data.password !== 'string') errors.push('Password must be a string');
    if (data.role !== undefined && !Object.values(Role).includes(data.role as Role)) errors.push(`Role must be one of: ${Object.values(Role).join(', ')}`);
    return errors;
}

export class AdminUserController {
    static async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as User;
            if (user.role === Role.ADMIN) {
                const librarians: User[] = await client.user.findMany({ where: { role: Role.LIBRARIAN } });
                sendResponse(res, 200, true, "Librarians fetched successfully", librarians);
            } else {
                throw new ErrorHandler('Admin privileges required', 403);
            }
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, password, role }: { name: string, email: string, password: string, role: string } = req.body;
            const user = req.user as User;

            if (user.role === Role.ADMIN) {
                if (role !== Role.LIBRARIAN) {
                    return next(new ErrorHandler('Admins can only create Librarian users', 403));
                }

                const adminCount = await client.user.count({ where: { role: Role.ADMIN } });
                if (adminCount >1) {
                    return next(new ErrorHandler('Admin already exists', 403));
                }

                const errors = validateUserData({ name, email, password, role });
                if (errors.length > 0) {
                    return next(new ErrorHandler(errors.join(', '), 400));
                }

                const existingUser = await client.user.findUnique({ where: { email } });
                if (existingUser) {
                    return next(new ErrorHandler('User with this email already exists', 400));
                }

                const newUser = await client.user.create({
                    data: {
                        name,
                        email,
                        password: await bcrypt.hash(password, 10),
                        role,
                    },
                });
                sendResponse(res, 201, true, "User created successfully", newUser);
            } else {
                throw new ErrorHandler('Admin privileges required', 403);
            }
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);
            const { name, email, password, role }: Partial<User> = req.body;
    
            const user = req.user as User;
    
            if (user.role === Role.ADMIN) {
                const existingUser = await client.user.findUnique({ where: { id: idNumber } });
                if (!existingUser) {
                    return next(new ErrorHandler('User not found', 404));
                }
    
                if (existingUser.role !== Role.LIBRARIAN) {
                    return next(new ErrorHandler('Admins can only update Librarian users', 403));
                }
    
                if (email && email !== existingUser.email) {
                    const emailInUse = await client.user.findUnique({ where: { email } });
                    if (emailInUse) {
                        return next(new ErrorHandler('Email is already in use', 400));
                    }
                }
    
                const errors = validateUserData({ name, email, password, role });
                if (errors.length > 0) {
                    return next(new ErrorHandler(errors.join(', '), 400));
                }
    
                const updatedUser = await client.user.update({
                    where: { id: idNumber },
                    data: {
                        name: name ?? existingUser.name,
                        email: email ?? existingUser.email,
                        password: password ? await bcrypt.hash(password, 10) : existingUser.password,
                        role: role ?? existingUser.role,
                    },
                });
    
                sendResponse(res, 200, true, "User updated successfully", updatedUser);
            } else {
                throw new ErrorHandler('Admin privileges required', 403);
            }
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }
    
    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);
            const user = req.user as User;
    
            if (user.role === Role.ADMIN) {
                const existingUser = await client.user.findUnique({ where: { id: idNumber } });
                if (!existingUser) {
                    return next(new ErrorHandler('User not found', 404));
                }
    
                if (existingUser.role !== Role.LIBRARIAN) {
                    return next(new ErrorHandler('Admins can only delete Librarian users', 403));
                }
    
                await client.user.delete({ where: { id: idNumber } });
                sendResponse(res, 200, true, "User deleted successfully");
            } else {
                throw new ErrorHandler('Admin privileges required', 403);
            }
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }
    
}
