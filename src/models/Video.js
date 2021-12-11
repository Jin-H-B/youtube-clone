//db에 저장되는 데이터이 구조를 정의
import mongoose from "mongoose";

// export const formatHashtags = (hashtags) =>hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`));

const videoSchema = new mongoose.Schema({
  /*{type: String}과 동일*/
  title: { type: String, required: true, trim: true, maxlength: 30 },
  fileUrl: { type: String, required: true },
  thumbUrl: { type: String, required: true },
  description: { type: String, required: true, trim: true, minlength: 2 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      // required: true, //video에 코멘트가 필요하지는 않을 듯..
      ref: "Comment",
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  }, //mongoose를 통해 userModel의 ObjectId를 videoModel에 설정
});

//middleware
/*
videoSchema.pre("save", async function () {
  //console.log("we save", this);
  this.hashtags = this.hashtags[0]
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});
*/

//static function 만들기
videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Video = mongoose.model("Video", videoSchema);

export default Video;
