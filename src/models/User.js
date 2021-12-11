import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatarUrl: { type: String },
  socialOnly: { type: Boolean, default: false },
  userName: { type: String, required: true, unique: true },
  password: { type: String }, //required: true
  name: { type: String, required: true },
  location: String,
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  videos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
});

//save하기 전에..비번 해싱..
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    //true일 경우 modified됐다는 것..비번이 다시 해싱되는 것 방지
    this.password = await bcrypt.hash(this.password, 5);
  } //5는 salRound..hashing 횟수를 말함
});

//몽구스는 model의 첫 번째 인자로 컬렉션 이름. User이면 소문자화 후 복수형으로 바꿔서 users 컬렉션이 됩. 강제 개명이 싫다면 세 번째 인자로 컬렉션 이름
const User = mongoose.model("User", userSchema);
export default User;
