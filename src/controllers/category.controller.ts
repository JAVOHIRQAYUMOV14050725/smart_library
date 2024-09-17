import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CategoryController {

    static async createCategory(req: Request, res: Response) {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required',
            });
        }

        try {
            const newCategory = await prisma.category.create({
                data: { name },
            });
            return res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: newCategory,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    return res.status(400).json({
                        success: false,
                        message: 'Category name already exists',
                    });
                }
            } else if (error instanceof Error) {
               return res.status(500).json({
                    success: false,
                    message: `Create category error: ${error.message}`,
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Unknown error occurred',
            });
        }
    }

    static async getAllCategories(req: Request, res: Response) {
        try {
            const categories = await prisma.category.findMany();
            return res.status(200).json({
                success: true,
                data: categories,
            });
        } catch (error) {
            if (error instanceof Error) {
               return res.status(500).json({
                    success: false,
                    message: `Get categories error: ${error.message}`,
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Unknown error occurred',
            });
        }
    }

    static async getCategoryById(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const category = await prisma.category.findUnique({
                where: { id: parseInt(id) },
            });

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found',
                });
            }

            return res.status(200).json({
                success: true,
                data: category,
            });
        } catch (error) {
            if (error instanceof Error) {
               return res.status(500).json({
                    success: false,
                    message: `Get category by ID error: ${error.message}`,
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Unknown error occurred',
            });
        }
    }

    static async updateCategory(req: Request, res: Response) {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required',
            });
        }

        try {
            const updatedCategory = await prisma.category.update({
                where: { id: parseInt(id) },
                data: { name },
            });

            return res.status(200).json({
                success: true,
                message: 'Category updated successfully',
                data: updatedCategory,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    return res.status(404).json({
                        success: false,
                        message: 'Category not found',
                    });
                }
            } else if (error instanceof Error) {
               return res.status(500).json({
                    success: false,
                    message: `Update category error: ${error.message}`,
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Unknown error occurred',
            });
        }
    }

    static async deleteCategory(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const category = await prisma.category.findUnique({
                where: { id: parseInt(id) },
            });

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found',
                });
            }

            await prisma.category.delete({
                where: { id: parseInt(id) },
            });

            return res.status(200).json({
                success: true,
                message: 'Category deleted successfully',
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    return res.status(404).json({
                        success: false,
                        message: 'Category not found',
                    });
                }
            } else if (error instanceof Error) {
               return res.status(500).json({
                    success: false,
                    message: `Delete category error: ${error.message}`,
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Unknown error occurred',
            });
        }
    }
}
