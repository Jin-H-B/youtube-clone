import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");
const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl; //mp4Url의 경우 FFmpeg 이전의 videoFile을 mp4Url로
  a.download = fileName; //.webm로 처음에 했었음..mp4로 하면 다운 안되는 경우도 있음..그래서 ffmpeg를 이용해서 mp4로 다운
  document.body.appendChild(a);
  a.click(); //사용자가 link 클릭한 것처럼 자동으로
};

let stream;
let recorder;
let videoFile;

const handleDownload = async () => {
  //사용자가 한번더 클릭해 또 다운로드하는거 방지
  actionBtn.removeEventListener("click", handleDownload);
  actionBtn.innerText = "Transcoding...";
  actionBtn.disabled = true;

  //ffmpeg로 webm을 .mp4로 변환 등
  const ffmpeg = createFFmpeg({
    log: true,
    corePath: "/convert/ffmpeg-core.js",
  }); //콘솔에 로그 표시
  await ffmpeg.load(); //유저가 ffmpeg 프로그램 사용할 것이라는 뜻

  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile)); //파일생성, 파일명, 바이너리데이터
  await ffmpeg.run("-i", files.input, "-r", "60", files.output); //ffmpeg 가상에 존재하는 파일을 -i(input)하여 사용자 컴터에서 아웃풋으로 변환(영상 초당 60frame)..사용자 컴퓨터에 접근해서 ffmpeg를 사용하는 중
  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb
  ); //-ss는 특정 시간대로 이동, 첫프레임의 스샷

  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" }); //버퍼(실제 binary data)를 arrayBuffer로 만들어줘서 blob함
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob); //브라우저에서 파일을 가리키게됨
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, "MyRecording.mp4");
  // const a = document.createElement("a");
  // a.href = mp4Url; //FFmpeg 이전의 videoFile을 mp4Url로
  // a.download = "MyRecording.mp4"; //.webm로 처음에 했었음..mp4로 하면 다운 안되는 경우도 있음..그래서 ffmpeg를 이용해서 mp4로 다운
  // document.body.appendChild(a);
  // a.click(); //사용자가 link 클릭한 것처럼 자동으로
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  //링크 해제
  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);

  //URL 제거
  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  //액변버튼 재활성화
  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleDownload);
};

////사용 안함
// const handleStop = () => {
//   actionBtn.innerText = "Download Recording";
//   actionBtn.removeEventListener("click", handleStop); //버튼이 하나이기 때문에 removeEventListener하는 것
//   actionBtn.addEventListener("click", handleDownload);
//   recorder.stop();
// };

const handleStart = () => {
  //버튼
  actionBtn.innerText = "Stop Recording";
  actionBtn.innerText = "Recording";
  actionBtn.disabled = true;
  actionBtn.removeEventListener("click", handleStart);

  //녹화
  recorder = new MediaRecorder(stream, { mimeType: "video/mp3" });
  //recorder의 event를 확인하려면 ondataavailable 메서드
  recorder.ondataavailable = (event) => {
    //event.data에 대해 브라우저 메모리 상의 URL 생성
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null; //미리보기에서 녹화된 이후 반복재생해서 보여줄 것이므로 srcObject 비워두기
    video.src = videoFile;
    video.loop = true; //비디오 반복재생
    video.play();
    actionBtn.innerText = "Download";
    actionBtn.disabled = false;
    actionBtn.addEventListener("click", handleDownload);
  };
  // console.log(recorder);
  recorder.start();
  // console.log(recorder);
  setTimeout(() => {
    recorder.stop();
  }, 5000);
};

//npm i regenerator-runtime 해야 async 작동
const init = async () => {
  //stream에 새 값 할당
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 1024,
      height: 576,
    },
  });
  console.log("stream:::", stream);
  video.srcObject = stream; //srcObject에 stream을 줘야 재생 가능
  video.play();
};

// //stream 종료(카메라 종료) 코드
// const tracks = stream.getTracks();
// tracks.forEach((track) => {
//   track.stop();
// });
// stream = null;

init(); //컴퓨터 카메라를 켬

actionBtn.addEventListener("click", handleStart);
