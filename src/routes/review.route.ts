import {   ReviewController } from "@controllers";
import { Role } from "@enums";
import { authMiddleware, checkRole } from "@middlewares";
import { Router } from "express";

const reviewRouter = Router()


reviewRouter.get("/getAll",authMiddleware, checkRole(Role.LIBRARIAN), ReviewController.getReviews);
reviewRouter.get("/get/:id",authMiddleware, checkRole(Role.LIBRARIAN), ReviewController.getReviewById);
reviewRouter.post("/create",authMiddleware, checkRole(Role.READER), ReviewController.createReview);
reviewRouter.patch("/update/:id",authMiddleware, checkRole(Role.READER), ReviewController.updateReview);
reviewRouter.delete("/delete/:id",authMiddleware, checkRole(Role.READER), ReviewController.deleteReview);






export {reviewRouter}