import { Request, Response } from 'express';
import { PrismaClient, Author } from '@prisma/client';

const prisma = new PrismaClient();

function validateAuthorData(data: Partial<Author>): { errors: string[], missingFields: string[] } {
    const errors: string[] = [];
    const missingFields: string[] = [];

    if (!data.name) {
        missingFields.push('name');
    } else if (typeof data.name !== 'string') {
        errors.push('Author name must be a string');
    }

    if (data.biography !== undefined && typeof data.biography !== 'string') {
        errors.push('Author biography must be a string');
    }

    if (data.birthDate && isNaN(Date.parse(data.birthDate.toString()))) {
        errors.push('Author birthDate must be a valid date');
    }

    return { errors, missingFields };
}

export class AuthorController {

    static async createAuthor(req: Request, res: Response) {
        const { name, biography, birthDate } = req.body;

        const { errors, missingFields } = validateAuthorData({ name, biography, birthDate });
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: ' + missingFields.join(', '),
            });
        }
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation error: ' + errors.join(', '),
            });
        }

        try {
            const newAuthor = await prisma.author.create({
                data: {
                    name,
                    biography,
                    birthDate: birthDate ? new Date(birthDate) : null,
                },
            });

            return res.status(201).json({
                success: true,
                message: 'Author created successfully',
                data: newAuthor,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error creating author';
            console.error('Create author error:', errorMessage);
            return res.status(500).json({
                success: false,
                message: 'Failed to create author: ' + errorMessage,
            });
        }
    }

    static async getAllAuthors(req: Request, res: Response) {
        try {
            const authors = await prisma.author.findMany();
            return res.status(200).json({
                success: true,
                data: authors,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error fetching authors';
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch authors: ' + errorMessage,
            });
        }
    }

    static async getAuthorById(req: Request, res: Response) {
        const { id } = req.params;

        if (isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid author ID',
            });
        }

        try {
            const author = await prisma.author.findUnique({
                where: { id: parseInt(id) },
                include: { books: true },
            });

            if (!author) {
                return res.status(404).json({
                    success: false,
                    message: 'Author not found',
                });
            }

            return res.status(200).json({
                success: true,
                data: author,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error fetching author';
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch author: ' + errorMessage,
            });
        }
    }

    static async updateAuthor(req: Request, res: Response) {
        const { id } = req.params;
        const { name, biography, birthDate } = req.body;

        if (isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid author ID',
            });
        }

        const { errors, missingFields } = validateAuthorData({ name, biography, birthDate });
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: ' + missingFields.join(', '),
            });
        }
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation error: ' + errors.join(', '),
            });
        }

        try {
            const updatedAuthor = await prisma.author.update({
                where: { id: parseInt(id) },
                data: {
                    name,
                    biography,
                    birthDate: birthDate ? new Date(birthDate) : undefined,
                },
            });
            console.log();
            

            return res.status(200).json({
                success: true,
                message: 'Author updated successfully',
                data: updatedAuthor,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error updating author';
            return res.status(500).json({
                success: false,
                message: 'Failed to update author: ' + errorMessage,
            });
        }
    }

    static async deleteAuthor(req: Request, res: Response) {
        const { id } = req.params;

        if (isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid author ID',
            });
        }

        try {
            const author = await prisma.author.findUnique({
                where: { id: parseInt(id) },
            });

            if (!author) {
                return res.status(404).json({
                    success: false,
                    message: 'Author not found',
                });
            }

            await prisma.author.delete({
                where: { id: parseInt(id) },
            });

            return res.status(200).json({
                success: true,
                message: 'Author deleted successfully',
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error deleting author';
            return res.status(500).json({
                success: false,
                message: 'Failed to delete author: ' + errorMessage,
            });
        }
    }
}
