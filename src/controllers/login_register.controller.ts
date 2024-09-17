import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { sign, signRefreshToken, verifyRefreshToken } from '@utils'; // JWT helpers
import { Role } from '@enums';

const prisma = new PrismaClient();

const validRoles: Role[] = [Role.ADMIN, Role.LIBRARIAN, Role.READER, Role.AUTHOR];

export class LoginRegisterController {
    static async register(req: Request, res: Response) {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: ' +
                    `${!name ? 'name ' : ''}` +
                    `${!email ? 'email ' : ''}` +
                    `${!password ? 'password ' : ''}` +
                    `${!role ? 'role ' : ''}`,
            });
        }

        if (!validRoles.includes(role as Role)) {
            return res.status(400).json({
                success: false,
                message: `Select a valid role: ${validRoles.join(', ')}`,
            });
        }

        if (role === Role.ADMIN) {
            const adminCount = await prisma.user.count({
                where: { role: Role.ADMIN },
            });

            if (adminCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin already exists. Only one admin can be created.',
                });
            }
        }

        if (role === Role.LIBRARIAN || role === Role.AUTHOR) {
            return res.status(400).json({
                success: false,
                message: 'Librarians and authors cannot register.',
            });
        }

        try {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'A user with this email already exists.',
                });
            }


          
            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: await bcrypt.hash(password, 10),
                    role,
                },
            });

           
            const accessToken = sign(
                { id: newUser.id, email: newUser.email, role: newUser.role },
                '1h' 
            );

            const refreshToken = signRefreshToken(
                { id: newUser.id, email: newUser.email, role: newUser.role },
                '7d'
            );

            return res.status(201).json({
                success: true,
                message: 'User successfully registered',
                data: {
                    user: newUser,
                    accessToken,
                    refreshToken,
                },
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error during registration';
           
            return res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    }

    static async login(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required: ' +
                    `${!email ? 'email ' : ''}` +
                    `${!password ? 'password ' : ''}`,
            });
        }

        try {
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Incorrect email or password',
                });
            }

           
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Incorrect email or password',
                });
            }

            
            const accessToken = sign(
                { id: user.id, email: user.email, role: user.role },
                '1h'
            );

            const refreshToken = signRefreshToken(
                { id: user.id, email: user.email, role: user.role },
                '7d' 
            );

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                accessToken,
                refreshToken,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error during login';
            return res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    }

    static async refreshToken(req: Request, res: Response) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required',
            });
        }

        try {
            const payload = verifyRefreshToken(refreshToken);

            if (!payload) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token',
                });
            }

            const newAccessToken = sign(
                { id: payload.id, email: payload.email, role: payload.role },
                '1h' 
            );

            return res.status(200).json({
                success: true,
                message: 'Access token refreshed',
                accessToken: newAccessToken,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error during token refresh';
            return res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    }
}
