import { Router } from "express";
import { login_registerRouter } from "./login_register.route";
import { adminRouter } from "./admin.route";
import { categoryRouter } from "./category.route";
import { authorRouter } from "./author.route";
import { librarianRouter } from "./reader.route";
import { libraryRouter } from "./library.route";
import { bookRouter } from "./book.route";
import { branchRouter } from "./branch.route";
import { reviewRouter } from "./review.route";
import { borrowingRouter } from "./borrowing.route";

let router:Router = Router()



router.use("/",login_registerRouter)
router.use("/librarian",adminRouter)
router.use("/categories",categoryRouter)
router.use("/author",authorRouter)
router.use("/reader",librarianRouter)
router.use("/library",libraryRouter)
router.use("/book",bookRouter)
router.use("/branch",branchRouter)
router.use("/review",reviewRouter)
router.use("/borrowing",borrowingRouter)





export {router}

