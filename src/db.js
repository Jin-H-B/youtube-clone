import mongoose from "mongoose";

mongoose.connect(
  process.env.DB_URL,
  { useNewUrlParser: true },
  { useUnifiedTopology: true },
  { useFindAndModify: false },
  { useCreateIndex: true }
); //powershell에서 mongo 실행하면 db주소(내컴퓨터)..wetube는 name of db

const db = mongoose.connection;

const handleError = (error) => console.log("DB Error", error);
const handleOpen = () => console.log("Connected to DB");

db.on("error", handleError);
db.once("open", handleOpen);
