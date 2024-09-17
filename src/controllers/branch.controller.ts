import { Request, Response, NextFunction } from "express";
import { Branch, PrismaClient } from "@prisma/client";
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



export class BranchController {
    static async getAllBranches(req: Request, res: Response, next: NextFunction) {
        try {
            const branches: Branch[] = await client.branch.findMany({
                include: {
                    books: true, 
                },
            });
            sendResponse(res, 200, true, "Branches fetched successfully", branches);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch branches: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async createBranches(req: Request, res: Response, next: NextFunction) {
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

            const existingBranch = await client.branch.findFirst({
                where: { name },
            });

            if (existingBranch) {
                return next(new ErrorHandler('Branch with this name already exists', 400));
            }

            const newBranch = await client.branch.create({
                data: { name, address },
            });

            sendResponse(res, 201, true, "Branch created successfully", newBranch);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to create branch: ${error instanceof Error ? error.message : 'Unknown error'}`, 400));
        }
    }

    static async updateBranch(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);
            const { name, address, ...extraFields }: Partial<Branch> = req.body;

            let errors: string[] = [];
            let unexpectedFields: string[] = Object.keys(extraFields);

            if (name !== undefined && typeof name !== 'string') errors.push('Name must be a string');
            if (address !== undefined && typeof address !== 'string') errors.push('Address must be a string');

            if (unexpectedFields.length > 0) {
                errors.push(`Unexpected fields provided: ${unexpectedFields.join(', ')}`);
            }

            if (errors.length > 0) {
                return next(new ErrorHandler(errors.join(', '), 400));
            }

            const existingBranch = await client.branch.findUnique({
                where: { id: idNumber },
            });

            if (!existingBranch) {
                return next(new ErrorHandler('Branch not found', 404));
            }
          
            const updatedData: Partial<Branch> = {
                name: name !== undefined ? name : existingBranch.name,
                address: address !== undefined ? address : existingBranch.address,
            };

            const updateBranch = await client.branch.update({
                where: { id: idNumber },
                data: updatedData,
            });

            sendResponse(res, 200, true, "branch updated successfully", updateBranch);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to update branch: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async deleteBranch(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

            const existingBranch = await client.branch.findUnique({
                where: { id: idNumber },
            });

            if (!existingBranch) {
                return next(new ErrorHandler('Branch not found', 404));
            }

            await client.branch.delete({
                where: { id: idNumber },
            });

            sendResponse(res, 200, true, "Branch deleted successfully");
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to delete Branch: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }
}
