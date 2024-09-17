import { BorrowingController } from '@controllers';
import { Role } from '@enums';
import { authMiddleware, checkRole } from '@middlewares';
import { Router } from 'express';

const borrowingRouter = Router();


borrowingRouter.get('/getAll', authMiddleware, checkRole(Role.LIBRARIAN), BorrowingController.getAllBorrowings);
borrowingRouter.get('/get/:id', authMiddleware, checkRole(Role.LIBRARIAN), BorrowingController.getBorrowingById);
borrowingRouter.post('/create', authMiddleware, checkRole(Role.LIBRARIAN), BorrowingController.createBorrowing);
borrowingRouter.patch('/update/:id', authMiddleware, checkRole(Role.LIBRARIAN), BorrowingController.updateBorrowing);
borrowingRouter.delete('/delete/:id', authMiddleware, checkRole(Role.LIBRARIAN), BorrowingController.deleteBorrowing);

export { borrowingRouter };
