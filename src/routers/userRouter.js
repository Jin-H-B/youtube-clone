import express from "express";
import {
  getEditUser,
  postEditUser,
  deleteUser,
  seeUser,
  logout,
  userHome,
  startGithubLogin,
  finishGithubLogin,
  getChangePassword,
  postChangePassword,
} from "../controllers/userController";
import {
  protectorMiddleware,
  publicOnlyMiddleware,
  uploadAvatarMiddleware,
} from "../middlewares";
const userRouter = express.Router();
//const handleEditUser=(req,res)=>res.send("Edit Users");
//const handleDelete=(req,res)=>res.send("Delete Users");

userRouter.get("/", userHome);
userRouter.get("/logout", protectorMiddleware, logout);
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEditUser)
  .post(uploadAvatarMiddleware.single("avatar"), postEditUser);

userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);

userRouter.get("/:id", seeUser); // ':id'는 parameter로 사용자들이 동영상을 특정 아이디로 업로드하면 그 번호를 대입해줌

userRouter.get("/delete", deleteUser);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin); //깃헙에서 만든 url

export default userRouter;
