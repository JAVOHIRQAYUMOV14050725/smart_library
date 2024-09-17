import { Request, Response, NextFunction } from "express";
import { PrismaClient, Library } from "@prisma/client";
import { ErrorHandler } from "@errors";

const client = new PrismaClient();

function validateId(id: string): number {
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
        throw new ErrorHandler('Invalid ID format', 400);
    }
    return idNumber;
}

function sendResponse(res: Response, statusCode: number, success: boolean, message: string, data?: any) {
    res.status(statusCode).json({
        success,
        message,
        data
    });
}

export class LibraryController {
    static async getAllLibraries(req: Request, res: Response, next: NextFunction) {
        try {
            const libraries: Library[] = await client.library.findMany({
                include: {
                    books: true,
                },
            });
            sendResponse(res, 200, true, "Libraries fetched successfully", libraries);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch libraries: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async createLibrary(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, address, ...extraFields } = req.body;

            let errors: string[] = [];
            let unexpectedFields: string[] = Object.keys(extraFields);

            if (!name || typeof name !== 'string') errors.push('Name is required and must be a string');
            if (!address || typeof address !== 'string') errors.push('Address is required and must be a string');

            if (unexpectedFields.length > 0) {
                errors.push(`Unexpected fields provided: ${unexpectedFields.join(', ')}`);
            }

            if (errors.length > 0) {
                return next(new ErrorHandler(errors.join(', '), 400));
            }

            const existingLibrary = await client.library.findFirst({
                where: { name },
            });

            if (existingLibrary) {
                return next(new ErrorHandler('Library with this name already exists', 400));
            }

            const newLibrary = await client.library.create({
                data: { name, address },
            });

            sendResponse(res, 201, true, "Library created successfully", newLibrary);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to create library: ${error instanceof Error ? error.message : 'Unknown error'}`, 400));
        }
    }

    static async updateLibrary(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);
            const { name, address, ...extraFields }: Partial<Library> = req.body;

            let errors: string[] = [];
            let unexpectedFields: string[] = Object.keys(extraFields);

            // Validation checks
            if (name !== undefined && typeof name !== 'string') errors.push('Name must be a string');
            if (address !== undefined && typeof address !== 'string') errors.push('Address must be a string');

            if (unexpectedFields.length > 0) {
                errors.push(`Unexpected fields provided: ${unexpectedFields.join(', ')}`);
            }

            if (errors.length > 0) {
                return next(new ErrorHandler(errors.join(', '), 400));
            }

            const existingLibrary = await client.library.findUnique({
                where: { id: idNumber },
            });

            if (!existingLibrary) {
                return next(new ErrorHandler('Library not found', 404));
            }

            const updatedData: Partial<Library> = {
                name: name !== undefined ? name : existingLibrary.name,
                address: address !== undefined ? address : existingLibrary.address,
            };

            const updatedLibrary = await client.library.update({
                where: { id: idNumber },
                data: updatedData,
            });

            sendResponse(res, 200, true, "Library updated successfully", updatedLibrary);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to update library: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }


    static async deleteLibrary(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

            const existingLibrary = await client.library.findUnique({
                where: { id: idNumber },
            });

            if (!existingLibrary) {
                return next(new ErrorHandler('Library not found', 404));
            }

            await client.library.delete({
                where: { id: idNumber },
            });

            sendResponse(res, 200, true, "Library deleted successfully");
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to delete library: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }
}
