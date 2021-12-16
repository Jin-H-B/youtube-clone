import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

//JOIN
export const getJoin = (req, res) =>
  res.render("join.pug", { pageTitle: "Join" }); //globalRouter

export const postJoin = async (req, res) => {
  // console.log("req.body:", req.body);
  const { name, userName, email, password, password2, location } = req.body;
  if (password !== password2) {
    req.flash("error", "Password confirmation doesn't match");
    return res.status(400).render("join.pug", {
      pageTitle: "Join",
    });
  }
  const userExist = await User.exists({
    $or: [{ userName: userName }, { email: email }],
  });
  if (userExist) {
    req.flash("error", "This username/email already taken.");
    return res.status(400).render("join.pug", {
      pageTitle: "Join",
    });
  }
  try {
    await User.create({
      name,
      userName,
      email,
      password,
      location,
    });

    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join.pug", {
      pageTitle: "Join",
      errorMessage: error._message,
    });
  }
};

//LOGIN
export const getLogin = (req, res) => {
  return res.render("login.pug", { pageTitle: "login" });
}; //global Router

export const postLogin = async (req, res) => {
  const { userName, password } = req.body;
  // console.log("req.body:", req.body);
  //특정 username과 일치하는 userModel의 user를 생성
  const user = await User.findOne({
    userName: userName,
    socialOnly: false, //왜 이거 추가하면 에러메시지 뜨나...결론.db에 socialOnly 수정 전 저장이 안됨
  });
  if (!user) {
    req.flash("error", "An account with this userName doesn't exist");
    return res.status(400).render("login.pug", {
      pageTitle: "Login",
    });
  } // console.log(user.password);
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    req.flash("error", "Wrong password");
    return res.status(400).render("login.pug", {
      pageTitle: "Login",
    });
  }

  req.session.loggedIn = true;
  req.session.user = user;
  // console.log("req.session:", req.session);
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GITHUB_CLIENT,
    allow_signup: false,
    scope: "read:user user:email", //github에서 공백으로 구분하기 원함
  };
  const params = new URLSearchParams(config).toString(); //config obj를 url prams 형태로 변환(인코딩)
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  //깃허브에서 준 임시 코드를 토큰으로 바꿔주는 과정
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GITHUB_CLIENT,
    client_secret: process.env.GITHUB_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  //npm i node-fetch
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: { Accept: "application/json" },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    //access api
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    // console.log(userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    //access_token으로 이메일 요청 보내면 깃헙에서 해당 이메일 주소가 있는지 알려줌
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name ? userData.name : "Undefined",
        userName: userData.login,
        email: emailObj.email,
        socialOnly: true,
        password: "", //socialOnly가 true이면 비번을 가질 필요가 없음
        location: userData.location ? userData.location : "Undefined",
      });
    }

    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  // req.session.destroy(); //현재 세션을 없앤다는 것. 초기화해 로그아웃...그러나 이 코드를 쓰면 seession이 없어져서 flash를 사용할 수 없음 에러
  req.session.user = null;
  res.locals.loggedInUser = req.session.user;
  req.session.loggedIn = false;
  req.flash("info", "Bye");
  return res.redirect("/");
}; //user Router

export const getEditUser = (req, res) => {
  return res.render("edit-profile.pug", { pageTitle: "Edit Profile" }); //user: req.session.user 필요 없는 이유는 미들웨어
};
export const postEditUser = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, userName, location }, //body는 웹페이지에서 요청된 변수값
    file, //multer 사용하기 때문에 req.file 사용 가능
  } = req;
  // const { name, email, userName, location } = req.body;
  // console.log("file::", file);

  const exist = await User.exists({
    $and: [
      { _id: { $ne: _id } }, //다른 아이디 중에서 찾을때..
      { $or: [{ userName: userName }, { email: email }] },
    ],
  });
  if (exist) {
    req.flash("error", "This username/email already taken.");
    return res.status(400).render("edit-profile.pug", {
      pageTitle: "Edit Profile",
    });
  }

  const isHeroku = process.env.NODE_ENV === "production";

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? (isHeroku ? file.location : file.path) : avatarUrl, //file이 있으면? file.path. 없으면 avatarUrl그대로..aws 사용 시 location
      name: name,
      email: email,
      userName: userName,
      location: location,
    },
    {
      new: true, //이거 설정 해야 이전 데이터 지우고 새 오브젝트만 db에 저장
    }
  );

  //session업데이트 안 하면 db만 업데이트 됨
  req.session.user = updatedUser;
  req.flash("success", "Changes saved");
  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "Can't change password");
    return res.redirect("/"); //깃헙 로그인시
  }
  return res.render("users/change-password.pug", {
    pageTitle: "Change Password",
  });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { oldPwd, newPwd, newPwdConfirm },
  } = req;
  //구 비번 맞는지 확인
  const ok = await bcrypt.compare(oldPwd, password);
  if (!ok) {
    req.flash("error", "The current passowrd incorrect");
    return res.status(400).render("users/change-password.pug", {
      pageTitle: "Change Password",
    });
  }

  //새패스워드 확인
  if (newPwd !== newPwdConfirm) {
    req.flahs("error", "New password does not match");
    //status(400)하면 웹페이지도 오류로 인식해 기억 팝업 X
    return res.status(400).render("users/change-password.pug", {
      pageTitle: "Change Password",
    });
  }

  //새 패스워드 해싱해서 저장
  const user = await User.findById(_id); //db에서 해당 id 자료 찾음
  user.password = newPwd;
  user.save(); //save() 호출하면 user.js에 pre("save")설정한 것에 의해 비번이 해싱됨
  //redirect로 로그아웃자동으로 되므로 세션 디스트로이 되지만..혹시 로그인 된 상태에서 진행하려면 session도 업데이트
  req.session.user.password = user.password;
  req.flash("info", "Password updated");
  return res.redirect("/users/logout");
};

export const seeUser = async (req, res) => {
  //session이 아닌 url에서 id 정보 가져옴. public으로 할것이기 때문
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    model: Video,
  });
  // console.log("user:", user);
  if (!user) {
    return res.status(404).render("404.pug", { pageTitle: "User Not Found" });
  }
  // const videos = await Video.find({ owner: user._id }); //user._id와 일치하는 owner의 모든 video를 찾음
  return res.render("users/profile.pug", {
    pageTitle: `${user.name}'s Profile`,
    user,
  });
}; //user Router

export const deleteUser = (req, res) => res.send("Delete Users"); //user Router

export const userHome = (req, res) => res.send("User Home"); //user Router
