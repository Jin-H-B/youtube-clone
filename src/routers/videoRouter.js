import express from "express";
import {
  watchVideo,
  editVideo,
  postEdit,
  deleteVideo,
  uploadVideo,
  postUpload,
  videoHome,
} from "../controllers/videoController";
import { protectorMiddleware, uploadVideoMiddleware } from "../middlewares";

const videoRouter = express.Router();
// const handleWatch=(req,res)=>res.send("Watch Videos");
// const handleEdit=(req,res)=>res.send("Edit Videos");
// const handleDelete=(req,res)=>res.send("Delete videos");

videoRouter.get("/", videoHome);
videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(uploadVideo)
  .post(
    uploadVideoMiddleware.fields([
      { name: "video", maxCount: 1 },
      { name: "thumb", maxCount: 1 },
    ]),
    postUpload
  ); //:id보다 위에 안 두면 express가 upload 글자를 id변수로 인식..인식 안시키려면 id에 숫자만 넣도록 해야
videoRouter.get("/:id([0-9a-f]{24})", watchVideo); // /:id(\\d+) '\d+'는 숫자만 선택한다는 정규표현식..js에서는 '\'표현하기 위해 '\\'라고 써야 함.
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(editVideo)
  .post(postEdit); //uploadVideoMiddleware.single("thumb"), 왜 안되나..
// videoRouter.get("/:id(\\d+)/edit", editVideo);
// videoRouter.post("/:id(\\d+)/edit", postEdit);
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware)
  .get(deleteVideo);

export default videoRouter;
