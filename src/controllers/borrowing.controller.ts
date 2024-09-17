

import { PrismaClient, Borrowing } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ErrorHandler } from '@errors'; // Import ErrorHandler if not already imported

const prisma = new PrismaClient();

const validateId = (id: string): number => {
  const idNumber = parseInt(id, 10);
  if (isNaN(idNumber)) {
    throw new ErrorHandler('Invalid ID format', 400);
  }
  return idNumber;
};



const validateBorrowingData = async (data: Partial<Borrowing>): Promise<{ errors: string[], missingFields: string[] }> => {
  const errors: string[] = [];
  const missingFields: string[] = [];

  if (!data.bookId) {
    missingFields.push('bookId');
  } else if (typeof data.bookId !== 'number') {
    errors.push('Book ID must be a number');
  } else {
    const bookExists = await prisma.book.findUnique({ where: { id: data.bookId } });
    if (!bookExists) {
      errors.push('Book ID does not exist');
    }
  }

  if (!data.userId) {
    missingFields.push('userId');
  } else if (typeof data.userId !== 'number') {
    errors.push('User ID must be a number');
  } else {
    const userExists = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!userExists) {
      errors.push('User ID does not exist');
    }
  }

  return { errors, missingFields };
};

const validateDateFormat = (date: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
};

const sendResponse = (res: Response, statusCode: number, success: boolean, message: string, data?: any): void => {
  res.status(statusCode).json({ success, message, data });
};

export class BorrowingController {
  static async getBorrowingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = validateId(req.params.id);
      const borrowing = await prisma.borrowing.findUnique({ where: { id } });
      if (borrowing) {
        sendResponse(res, 200, true, 'Borrowing record fetched successfully', borrowing);
      } else {
        sendResponse(res, 404, false, 'Borrowing record not found');
      }
    } catch (error) {
      next(new ErrorHandler('Failed to fetch borrowing record', 500));
    }
  }

  static async createBorrowing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookId, userId, borrowDate, returnDate } = req.body;

      if (!validateDateFormat(borrowDate)) {
        return sendResponse(res, 400, false, 'Invalid borrowDate format. Expected format is YYYY-MM-DD');
      }

      if (returnDate && !validateDateFormat(returnDate)) {
        return sendResponse(res, 400, false, 'Invalid returnDate format. Expected format is YYYY-MM-DD');
      }

      const { errors, missingFields } = await validateBorrowingData({ bookId, userId });
      if (errors.length > 0 || missingFields.length > 0) {
        return sendResponse(res, 400, false, 'Validation errors', { errors, missingFields });
      }

      const borrowing = await prisma.borrowing.create({
        data: {
          book: { connect: { id: bookId } },
          user: { connect: { id: userId } },
          borrowDate: new Date(borrowDate),
          returnDate: returnDate ? new Date(returnDate) : null,
        },
      });
      sendResponse(res, 201, true, 'Borrowing created successfully', borrowing);
    } catch (error) {
      next(new ErrorHandler('Failed to create borrowing', 500));
    }
  }

  static async getAllBorrowings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const borrowings = await prisma.borrowing.findMany();
      sendResponse(res, 200, true, 'Borrowing records fetched successfully', borrowings);
    } catch (error) {
      next(new ErrorHandler('Failed to fetch borrowing records', 500));
    }
  }

  static async updateBorrowing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendResponse(res, 400, false, 'Validation errors', errors.array());
      }

      const { id } = req.params;
      const { bookId, userId, borrowDate, returnDate } = req.body;
      const borrowingId = validateId(id);

      const existingBorrowing = await prisma.borrowing.findUnique({ where: { id: borrowingId } });
      if (!existingBorrowing) {
        return sendResponse(res, 404, false, 'Borrowing record not found');
      }

      const { errors: validationErrors, missingFields } = await validateBorrowingData({ bookId, userId });
      if (validationErrors.length > 0 || missingFields.length > 0) {
        return sendResponse(res, 400, false, 'Validation errors', { validationErrors, missingFields });
      }

      const updatedBorrowing = await prisma.borrowing.update({
        where: { id: borrowingId },
        data: {
          bookId,
          userId,
          borrowDate: borrowDate ? new Date(borrowDate) : existingBorrowing.borrowDate,
          returnDate: returnDate ? new Date(returnDate) : existingBorrowing.returnDate,
        },
      });

      sendResponse(res, 200, true, 'Borrowing record updated successfully', updatedBorrowing);
    } catch (error) {
      next(new ErrorHandler('Failed to update borrowing record', 500));
    }
  }

  static async deleteBorrowing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const borrowingId = validateId(id);

      const existingBorrowing = await prisma.borrowing.findUnique({ where: { id: borrowingId } });
      if (!existingBorrowing) {
        return sendResponse(res, 404, false, 'Borrowing record not found');
      }

      await prisma.borrowing.delete({ where: { id: borrowingId } });
      sendResponse(res, 200, true, 'Borrowing record deleted successfully');
    } catch (error) {
      next(new ErrorHandler('Failed to delete borrowing record', 500));
    }
  }
}
