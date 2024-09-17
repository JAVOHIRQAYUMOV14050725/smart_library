
import { Request, Response } from 'express';
import { PrismaClient, Book } from '@prisma/client';

const prisma = new PrismaClient();

function validateBookData(data: Partial<Book>): { errors: string[], missingFields: string[] } {
    const errors: string[] = [];
    const missingFields: string[] = [];

    if (!data.title) {
        missingFields.push('title');
    } else if (typeof data.title !== 'string') {
        errors.push('Book title must be a string');
    }
    
    if (data.publicationDate && isNaN(Date.parse(data.publicationDate.toString()))) {
        errors.push('Publication date must be a valid date');
    }

    if (data.description !== undefined && typeof data.description !== 'string') {
        errors.push('Description must be a string');
    }

    if (data.status !== undefined && typeof data.status !== 'string') {
        errors.push('Status must be a string');
    }

    return { errors, missingFields };
}

export class BookController {

   
    static async createBook(req: Request, res: Response) {
        const { title, description, publicationDate, categoryId, status, libraryId, branchId } = req.body;

        
        const { errors, missingFields } = validateBookData({ title, description, publicationDate, status });
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: ' + missingFields.join(', '),
            });
        }

        if(!title){
            return res.status(400).json({
                success: false,
                message: 'title must be entered: ' + missingFields.join(', '),
            });
        }
         if(!description){
            return res.status(400).json({
                success: false,
                message: 'description must be entered: ' + missingFields.join(', '),
            })
        }
         if(!publicationDate){
            return res.status(400).json({
                success: false,
                message: 'publicationDate must be entered: ' + missingFields.join(', '),
            })
         }

         if(!status){
            return res.status(400).json({
                success: false,
                message: 'status must be entered: ' + missingFields.join(', '),
            })
         }

         if(!categoryId){
            return res.status(400).json({
                success: false,
                message: 'categoryId must be entered: ' + missingFields.join(', '),
            })
         }
         
         if(!branchId){
            return res.status(400).json({
                success: false,
                message: 'branchId must be entered: ' + missingFields.join(', '),
            })
         }

         if(!libraryId){
            return res.status(400).json({
                success: false,
                message: 'libraryId must be entered: ' + missingFields.join(', '),
            })
         }


        

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation error: ' + errors.join(', '),
            });
        }

        try {
            const newBook = await prisma.book.create({
                data: {
                    title,
                    description,
                    publicationDate: new Date(publicationDate),
                    category: { connect: { id: categoryId } },
                    status,
                    library: libraryId ? { connect: { id: libraryId } } : undefined,
                    branch: branchId ? { connect: { id: branchId } } : undefined,
                },
            });

            return res.status(201).json({
                success: true,
                message: 'Book created successfully',
                data: newBook,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error creating book';
            return res.status(500).json({
                success: false,
                message: 'Failed to create book: ' + errorMessage,
            });
        }
    }

   
    static async getAllBooks(req: Request, res: Response) {
        try {
            const books = await prisma.book.findMany({
                include: {
                    authors: true,
                    category: true,
                    library: true,
                    branch: true,
                },
            });
            return res.status(200).json({
                success: true,
                data: books,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error fetching books';
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch books: ' + errorMessage,
            });
        }
    }

  
    static async getBookById(req: Request, res: Response) {
        const { id } = req.params;

        if (isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid book ID',
            });
        }

        try {
            const book = await prisma.book.findUnique({
                where: { id: parseInt(id) },
                include: {
                    authors: true,
                    category: true,
                    library: true,
                    branch: true,
                    reviews: true, // Optional: include related reviews if needed
                },
            });

            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: 'Book not found',
                });
            }

            return res.status(200).json({
                success: true,
                data: book,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error fetching book';
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch book: ' + errorMessage,
            });
        }
    }

  
    static async updateBook(req: Request, res: Response) {
        const { id } = req.params;
        const { title, description, publicationDate, categoryId, status, libraryId, branchId } = req.body;

        if (isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid book ID',
            });
        }

        const { errors, missingFields } = validateBookData({ title, description, publicationDate, status });
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
            const updatedBook = await prisma.book.update({
                where: { id: parseInt(id) },
                data: {
                    title,
                    description,
                    publicationDate: publicationDate ? new Date(publicationDate) : undefined,
                    category: { connect: { id: categoryId } },
                    status,
                    library: libraryId ? { connect: { id: libraryId } } : undefined,
                    branch: branchId ? { connect: { id: branchId } } : undefined,
                },
            });

            return res.status(200).json({
                success: true,
                message: 'Book updated successfully',
                data: updatedBook,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error updating book';
                     return res.status(500).json({
                success: false,
                message: 'Failed to update book: ' + errorMessage,
            });
        }
    }

   
    static async deleteBook(req: Request, res: Response) {
        const { id } = req.params;

        if (isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid book ID',
            });
        }

        try {
            const book = await prisma.book.findUnique({
                where: { id: parseInt(id) },
            });

            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: 'Book not found',
                });
            }

            await prisma.book.delete({
                where: { id: parseInt(id) },
            });

            return res.status(200).json({
                success: true,
                message: 'Book deleted successfully',
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error deleting book';
                        return res.status(500).json({
                success: false,
                message: 'Failed to delete book: ' + errorMessage,
            });
        }
    }
}

