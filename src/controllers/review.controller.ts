import { PrismaClient, Review } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ErrorHandler } from "@errors"; // Import ErrorHandler if not already imported

const prisma = new PrismaClient();

const validateId = (id: string): number => {
  const idNumber = parseInt(id, 10);
  if (isNaN(idNumber)) {
    throw new ErrorHandler('Invalid ID format', 400);
  }
  return idNumber;
};

const validateReviewData = async (data: Partial<Review>): Promise<{ errors: string[], missingFields: string[] }> => {
  const errors: string[] = [];
  const missingFields: string[] = [];

  if (!data.content) {
    missingFields.push('content');
  } else if (typeof data.content !== 'string') {
    errors.push('Content must be a string');
  }

  if (!data.rating) {
    missingFields.push('rating');
  } else if (typeof data.rating !== 'number') {
    errors.push('Rating must be a number');
  }

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

const sendResponse = (res: Response, statusCode: number, success: boolean, message: string, data?: any): void => {
  res.status(statusCode).json({ success, message, data });
};

export class ReviewController {
  static async getReviewById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = validateId(req.params.id);
      const review = await prisma.review.findUnique({
        where: { id },
      });
      if (review) {
        sendResponse(res, 200, true, 'Review fetched successfully', review);
      } else {
        sendResponse(res, 404, false, 'Review not found');
      }
    } catch (error) {
      next(new ErrorHandler('Failed to fetch review', 500));
    }
  }

  static async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendResponse(res, 400, false, 'Validation errors', errors.array());
      }

      const { content, rating, bookId, userId } = req.body;
      const { errors: validationErrors, missingFields } = await validateReviewData({ content, rating, bookId, userId });

      if (validationErrors.length > 0 || missingFields.length > 0) {
        return sendResponse(res, 400, false, 'Validation errors', { validationErrors, missingFields });
      }

      const review = await prisma.review.create({
        data: {
          content,
          rating,
          book: { connect: { id: bookId } },
          user: { connect: { id: userId } },
        },
      });
      sendResponse(res, 201, true, 'Review created successfully', review);
    } catch (error) {
      next(new ErrorHandler('Failed to create review', 500));
    }
  }

  static async getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviews = await prisma.review.findMany();
      sendResponse(res, 200, true, 'Reviews fetched successfully', reviews);
    } catch (error) {
      next(new ErrorHandler('Failed to fetch reviews', 500));
    }
  }

  static async updateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendResponse(res, 400, false, 'Validation errors', errors.array());
      }

      const { id } = req.params;
      const { content, rating, userId } = req.body;
      const reviewId = validateId(id);

      const existingReview = await prisma.review.findUnique({
        where: { id: reviewId },
      });


      if (!existingReview || existingReview.userId !== userId) {
        return sendResponse(res, 403, false, 'You can only update your own reviews');
      }

      const { errors: validationErrors, missingFields } = await validateReviewData({ content, rating, bookId: existingReview.bookId, userId });

      if (validationErrors.length > 0 || missingFields.length > 0) {
        return sendResponse(res, 400, false, 'Validation errors', { validationErrors, missingFields });
      }

      const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: { content, rating },
      });

      sendResponse(res, 200, true, 'Review updated successfully', updatedReview);
    } catch (error) {
      next(new ErrorHandler('Failed to update review', 500));
    }
  }

  static async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const reviewId = validateId(id);

      const existingReview = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!existingReview || existingReview.userId !== userId) {
        return sendResponse(res, 403, false, 'You can only delete your own reviews');
      }

      await prisma.review.delete({
        where: { id: reviewId },
      });

      sendResponse(res, 200, true, 'Review deleted successfully');
    } catch (error) {
      next(new ErrorHandler('Failed to delete review', 500));
    }
  }
}
