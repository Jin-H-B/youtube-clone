import multer from "multer";
import multerS3 from "multer-s3"; //AWS에 파일 업로드 하기 위해
import aws from "aws-sdk";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const s3ImageUploader = multerS3({
  s3: s3,
  bucket: "clonetubeprac/images", //aws 버킷에 images 폴더
  acl: "public-read",
});

const s3VideoUploader = multerS3({
  s3: s3,
  bucket: "clonetubeprac/videos", //aws 버킷에 videos 폴더
  acl: "public-read",
});

const isHeroku = process.env.NODE_ENV === "production"; //heroku상에서 production으로 돼 있음.

export const localsMiddleware = (req, res, next) => {
  //   if (req.session.loggedIn) {
  //     res.locals.loggedIn = true;
  //   } //이걸 Boolean(req.session.loggedIn)으로 바꿈
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "WETUBE";
  res.locals.loggedInUser = req.session.user || {}; //로그인 돼있지 않으면 {}
  // console.log(req.session);
  next();
};

//로그인 돼있을 때
export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    req.flash("error", "Not Authorized. login first");
    return res.redirect("/login");
  }
};

//로그아웃 돼 있을때
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not Authorized. please logout"); //메시지 타입, 메시지
    return res.redirect("/");
  }
};

//npm i multer 사용 프로필사진 업로드용 미들웨어
//사용자가 보낸 파일을 uploads폴더에 저장
export const uploadAvatarMiddleware = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 300000, //bytes
  },
  storage: isHeroku ? s3ImageUploader : undefined, //AWS
}); //user Router
export const uploadVideoMiddleware = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 3000000,
  },
  storage: isHeroku ? s3VideoUploader : undefined, //AWS
});
