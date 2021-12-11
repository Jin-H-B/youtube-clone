//views/watch.pug에 이 스크립트 로드
const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

console.log("videoPlayer.js/비디오 id:", videoContainer.dataset);

//비디오 컨트롤러 마우스 화면 안팎으로 무브때 타임아웃 캔슬
let controlsTimeout = null;
//비디오 컨트롤러 화면 내에서 타임아웃
let controlsMovementTimeout = null;
//음소거 해제해도 기존 상태로 돌아가기 위해 global 선언
let volumeValue = 0.5;
video.volume = volumeValue; //default

//MDN htmlMediaElement 참조
const handlePlayClick = (event) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMuteClick = (event) => {
  const {
    target: { value },
  } = event;

  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }

  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volumeRange.value = volumeValue; //volumeValue는 글로벌변수이므로 volumeRange에서 값을 할당하면 글로벌 변수로 값이 바뀜
};

const handleVolumeChange = (event) => {
  //console.log(event.target.value);
  const {
    target: { value },
  } = event;
  //mute버튼 내용 바꾸기
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  //음소거 해제하면 기존 상태(보여지는 막대기)로 돌아가기
  volumeValue = value;
  //세팅된 값을 video.value(실제 음 크기)로 할당
  video.volume = value;
};

const formatTime = (seconds) => {
  return new Date(seconds * 1000).toISOString().substr(14, 5);
}; //substr 스트링 자르는 시작, 시작부터 끝 글자수

const handleLoadedMetaData = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  //   console.log(video.currentTime);
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime); //비디오플레이거 타임라인 값을 조작값으로.. 반대는 안됨
};

const handleTimelineChange = (event) => {
  // console.log(event.target.value);
  const {
    target: { value },
  } = event;
  //조작한 값을 실제 비디오 플레이서 타임라인에 대입
  video.currentTime = value;
};

const handleFullScreen = () => {
  const fullscreen = document.fullscreenElement; //아니면 null값 반환
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    video.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout); //timeout cancle..controlsTimeout은 숫자아이디 대입된 상태
    controlsTimeout = null; //다시 null로 만들어서 mouse가 감지되면 초기화(컨트롤 생성)
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 2000);
};

const handleMouseLeave = () => {
  //바로 showing 사라지지 않게 setTimeout
  controlsTimeout = setTimeout(hideControls, 2000);
};

const handleEnded = () => {
  const { id } = videoContainer.dataset; //pug에서 video id를 찾아서 JS에서는 videoContainer로 접근
  fetch(`/api/videos/${id}/view`, { method: "POST" });
};

//스페이스바
const handleSpaceBar = (event) => {
  if (event.keyCode === 32) {
    handlePlayClick();
  }
};

const handleMousedown = (event) => {
  handlePlayClick();
};

const handleEnterFullScreen = (event) => {
  //enter keycode=13
  if (event.keyCode === 13) {
    handleFullScreen();
  }
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange); //"change"로도 가능..코드는 다르게 해야..
// video.addEventListener("loadeddata", handleLoadedMetadata);
video.addEventListener("loadedmetadata", handleLoadedMetaData); //loadedmetadata..video에 필요한 정보
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded); //event가 끝났을 때
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
document.addEventListener("keydown", handleSpaceBar);
video.addEventListener("click", handleMousedown);
document.addEventListener("keydown", handleEnterFullScreen);
