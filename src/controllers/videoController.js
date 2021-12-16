import User from "../models/User.js";
import Video from "../models/Video.js";
import Comment from "../models/Comment.js";

//Video.find({}, (error, videos) 등의 콜백 방식이 아닌 async 사용
export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate({ path: "owner", model: User }); //videos=[] ...아직 없으니까 empty임
  // console.log("videos collection::", videos);
  return res.render("home.pug", {
    pageTitle: "Home",
    videos: videos,
  });
}; //globalRouter..home.pug를 rendering하고, pageTitle에는 "Home" 대입

export const watchVideo = async (req, res) => {
  // console.log(req.params);
  const { id } = req.params;
  const video = await Video.findById(id)
    .populate({
      path: "owner",
      model: User,
    })
    .populate({
      path: "comments",
      model: Comment,
    }); //populate는 id뿐 아니라 user 객체 자체를 저장시킴..populate()할 때 path랑 model 지정해 줘야함..
  // console.log("video:::->", video);
  // const owner = await User.findById(video.owner); //videoModel에서 owner설정했지만, 아래 _id 직접 세팅하므로 삭제
  // console.log("owner:", owner);
  if (video) {
    return res.render("watch.pug", {
      // pageTitle: `Watching ${video.title}`,
      pageTitle: video.title,
      video,
    });
  } else {
    return res.render("404.pug", { pageTitle: "video not found" });
  }
}; //video Router

export const editVideo = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await Video.findById(id);
  const {
    user: { _id },
  } = req.session;
  if (!video) {
    return res.status(404).render("404.pug", { pageTitle: "video not found" });
  }
  // console.log("video.owner::", video.owner, "_id::", _id);
  if (video.owner.toString() !== _id) {
    req.flash("error", "Not Authorized");
    return res.status(403).redirect("/"); //login 안된 상태에서 edit하려고 하면 403 Forbidden
  }

  return res.render("edit.pug", {
    pageTitle: `Editing ${video.title}`,
    video,
  });
}; //video Router

export const postEdit = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { id } = req.params;
  //console.log(req.body);
  // const video = await Video.exists({ _id: id });...t or f 만 체크시 object를 다 받을 필요 X,
  const video = await Video.findById(id);
  // const { thumb } = req.file; //undefined.....왜왜
  console.log("req.file:", req.file);
  const { title, description, hashtags } = req.body;
  if (!video) {
    return res.status(404).render("404.pug", { pageTitle: "video not found" });
  }
  console.log("video.owner:", String(video.owner));
  console.log("_id:", _id);
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of the video");
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndUpdate(id, {
    // thumbUrl: thumb[0].path,//...안돼..
    title: title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });

  req.flash("success", "Changes saved");
  return res.redirect(`/videos/${id}`);
};

export const uploadVideo = (req, res) => {
  return res.render("upload.pug", {
    pageTitle: `upload video`,
  });
}; //video Router

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;

  const { video, thumb } = req.files; //single()일때는 const {path: fileUrl }=req.file
  // console.log("req.session:", req.session);
  //console.log(req.body);
  const { title, description, hashtags } = req.body;
  // console.log(title, description, hashtags);
  // console.log("_id::", _id);
  try {
    //await Video.create()로도 가능..video선언 필요 없고 .save()없어도 됨
    const newVideo = await Video.create({
      title: title,
      description: description,
      createdAt: Date.now(),
      fileUrl: video[0].path,
      thumbUrl: thumb[0].path,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
      meta: {},
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();

    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(400).render("upload.pug", {
      pageTitle: `upload video`,
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  const user = await User.findById(_id);
  if (!video) {
    return res.status(404).render("404.pug", { pageTitle: "video not found" });
  }
  if (String(video.owner) !== _id) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  await user.videos.splice(user.videos.indexOf(id), 1); //user에 있는 video도 삭제
  user.save();
  return res.redirect("/");
}; //video Router

export const searchVideo = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    //search
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"), //RegExp()..contain search..i(ignore)는 대소문자 구분X
      },
    });
    // (videos = await Video.find({
    //   title: {
    //     $regex: new RegExp(keyword, "i"), //RegExp()..contain search..i(ignore)는 대소문자 구분X
    //   },
    // })).populate({ path: "owner", model: User });
  }
  return res.render("search.pug", {
    pageTitle: `Search video`,
    videos,
  });
}; //global Router

export const videoHome = (req, res) => res.send("Video Home");
//export default trending;//하나밖에 export하지 못함.

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404); //status()는 상태만 표기, 못끝냄
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  // console.log(req.params);
  // console.log(req.body); //app.use(express.text()); 사용하면 콘솔에 나타남.
  // console.log(req.session.user); //fetch는 자동으로 쿠키를 백엔드에 보냄.
  const {
    body: { text },
    session: { user },
    params: { id },
  } = req;

  const video = await Video.findById(id);
  // console.log("comment::->", text);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  // console.log("comment:::->", comment);
  video.comments.push(comment._id); //comment 생성 후 video의 comments:[]에 넣어야함.
  // console.log("video.comments::->", video.comments);
  video.save();
  return res.status(201).json({ newCommentId: comment._id }); //response에 json 안 데이터 전송
};

export const deleteComment = async (req, res) => {
  const {
    session: { user },
    params: { id }, //commentId
  } = req;

  const comment = await Comment.findByIdAndDelete(id);

  return res.sendStatus(200);
};
