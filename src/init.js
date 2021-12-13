import "regenerator-runtime"; //async await 사용
import "dotenv/config"; //npm i dotenv...가장 먼저 선언해야..require("dotenv").config(); 방식은 모든 파일에 선언해야
import "./db.js"; //db파일을 import해서 mongodb에 연결
import Video from "./models/Video.js";
import User from "./models/User.js";
import app from "./server.js";

const PORT = process.env.PORT || 4000; //헤로쿠 없이 하면 4000;

const handleListening = () =>
  console.log(`server listening on port http://localhost:${PORT}`);
app.listen(PORT, handleListening);
