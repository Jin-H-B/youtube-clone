import express from "express";
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
} from "../controllers/userController";
import { home, searchVideo } from "../controllers/videoController"; //각각 export할 때는 이름을 정확히 기재
import { protectorMiddleware, publicOnlyMiddleware } from "../middlewares";

const globalRouter = express.Router(); //global Router는 홈에서 바로 접속 가능한 router

globalRouter.get("/", home); //home에 접속하면 user controller의 home을 실행
globalRouter
  .route("/join")
  .all(publicOnlyMiddleware)
  .get(getJoin)
  .post(postJoin); //join에 접속하면 user controller의 join을 실행
globalRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(getLogin)
  .post(postLogin); //login에 접속하면 user controller의 login 실행
globalRouter.get("/search", searchVideo);
export default globalRouter;
