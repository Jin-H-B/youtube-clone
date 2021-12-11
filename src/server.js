//const express=require("express");
import express from "express"; //위 코드와 같음
import morgan from "morgan"; //morgan middleware 사용...export default이면 import morgan 또는 logger..이름 상관 x
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import globalRouter from "./routers/globalRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware } from "./middlewares";
import apiRouter from "./routers/apiRouter";

const app = express();
const logger = morgan("dev"); //combined, common, dev, short, tiny 중..

//pug를 view engine으로 설정
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views"); //pug를 package.json의 cwd(Current working directory)에서 src 안으로 설정

app.use(logger); //req, res 등 정보 나타내는 middleware

//express가 form 의 value를 이해하도록 함...html을 js object로
app.use(express.urlencoded({ extended: true }));
//server가 api로 웹에 보내진 text를 이해하기 위한 미들웨어 //videoController의 createComment
// app.use(express.text());
//json으로 보낼거면..
app.use(express.json());

//세션이 생성되고 서버 재스타트 해도 기억하도록 서버 메모리에 저장하는 대신 mongo store에 저장
app.use(
  session({
    secret: process.env.COOKIE_SECRET, //특정 server에서 만들었다는 cookie증명
    resave: false, //true: 매 req에서 변경 유무 관계없이 무조건 session 저장,
    cookie: {
      maxAge: 300000, //밀리세컨드...자동 로그아웃됨
    },
    saveUninitialized: false, //true: 세션 변경(로그인하면 바뀌게 코딩) 없어도 저장..즉 로그인 안한사람도 저장. 아무 내용 없는 session을 계속해서 저장
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }), //create하면 seessions collection 생성 //.env에 있는 값(npm i dotenv)
  })
);

//flash는 session을 통해 해당 유저에게 메시지를 보냄..자동으로 messages locals에 message가 보내짐
app.use(flash());

app.use(localsMiddleware); //session 미들웨어 다음에 나와야 함.
//multer 사용
app.use("/uploads", express.static("uploads")); //static으로 폴더 내 파일을 브라우저에 노출시킴
app.use("/static", express.static("assets")); //assets폴더에 접근
app.use("/convert", express.static("node_modules/@ffmpeg/core/dist")); //, @ffmpeg/core/dist에 접근

app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

//import된 router사용..router는 작은 app과 같음
app.use("/", globalRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);
//실행은 init.js에서
export default app;

/*
const PORT = 5000;

const handleListening = () =>
  console.log(`server listening on port http://localhost:${PORT}`);
app.listen(PORT, handleListening);
*/
