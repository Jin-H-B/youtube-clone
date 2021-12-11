import express from "express";
import {
  registerView,
  createComment,
  deleteComment,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView); //form이 아닌 상태의 post 요청
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.delete("/videos/comment/:id([0-9a-f]{24})", deleteComment);

export default apiRouter;
