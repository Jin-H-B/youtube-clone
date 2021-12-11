//만든 후 웹펙 entry에 추가..
const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtns = document.querySelectorAll(".deleteBtn");

const addComment = (text, newCommentId) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = newCommentId;
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = ` ${text}`;
  const span2 = document.createElement("span");
  span2.innerText = "❌";
  span2.className = "deleteBtn";
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment); //appendChild는 끝에 , prepend는 앞에

  //이부분 추가 안하면 fake comment는 삭제가 안됨
  span2.addEventListener("click", handleDelete);
};

const handleDelete = async (event) => {
  event.preventDefault();
  // console.log(event.target.parentNode);
  const toBeDelComment = event.target.parentNode;
  const { id } = toBeDelComment.dataset;
  // console.log(id);
  toBeDelComment.remove(); //frontEnd에서 제거

  await fetch(`/api//videos/comment/${id}`, {
    method: "DELETE",
    headers: {
      "Content-type": "application/json", // Indicates the content
    },
  });
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;

  if (text === "") {
    return; //사용자가 댓글 입력 안하고 submit 누르면 handleSubmit작동 X
  }

  //fetch는 url변경 없이 js를 통해서 req를 보낼 수 있게함
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    }, //headers에 json 데이터를 보낸다고 기재해야함
    //req.body를 가져오는 다른 방법
    body: JSON.stringify({ text }), //오브젝트로 보내려면 JSON.stringify().
  });
  // console.log("response::", response);

  const status = response.status;
  if (status == 201) {
    const json = await response.json(); //response에서 json 추출
    // console.log(json);
    const { newCommentId } = json;
    //fake comment를 생성
    addComment(text, newCommentId);
  }
  textarea.value = ""; //let text, 한 뒤 text=""으로 하면 초기화 안됨
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

if (deleteBtns) {
  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", handleDelete);
  });
}
