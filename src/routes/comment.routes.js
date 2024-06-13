import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getPostComments,
    updateComment,
    replyComment
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:post_id").get(getPostComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);
router.route("/replyacomment").post(verifyJWT, replyComment);

export default router