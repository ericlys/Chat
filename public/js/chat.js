const socket = io("http://localhost:3000");

  let idChatRoom = "";
  let userEmail = "";

function onLoad() {
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get("name");
  const avatar = urlParams.get("avatar");
  const email = urlParams.get("email");

  userEmail = email;

  document.querySelector(".user_logged").innerHTML += `
    <img
      class="avatar_user_logged"
      src=${avatar}
    />
    <strong id="user_logged">${name}</strong>
  `;

  socket.emit("start", {
    email,
    name,
    avatar,
  });

  socket.on("new_users", (user) => {
    const existInDiv = document.getElementById(`user_${user._id}`);

    if (!existInDiv) {
      addUser(user);
    }
  });

  socket.emit("get_users", (users) => {
  
    users.map((user) => {
      if (user.email !== email) {
        addUser(user);
      }
    });
  });

  socket.on("message", (data) => {
    if(data.message.roomId === idChatRoom){
      addMessage(data)
      goToBottom()
    }
  })

  socket.on("notification", data => {

    if(data.roomId !== idChatRoom){
      const user = document.getElementById(`user_${data.from._id}`);
  
      user.insertAdjacentHTML("afterbegin", 
      `
        <div class="notification"></div>
      `
      );
    }
  })
}

function deleteMessage(id) {

  socket.emit("deleteMessage",  id);

  const messageElement = document.getElementById(id);
  messageElement.remove();

}

function removeMessage(data){

}

function addMessage(data){
  const divMessageUser = document.getElementById("message_user");
  divMessageUser.innerHTML += `
  <div 
    class="messageWrapper${data.user.email === userEmail ? ' myMessage' : ''}"
    ${data.user.email === userEmail ? `id=${data.message._id}` : ''}
  >
    <div class="message">
      <span class="message_header">
        <div class="user_name user_name_date">
          <img
            class="img_user"
            src=${data.user.avatar}
          />
          <strong> ${data.user.name} &nbsp; </strong>
          <span class="date">${dayjs(data.message.created_at).format("DD/MM/YYYY HH:mm")} </span>
        </div>
        ${data.user.email === userEmail ? 
          `<div onClick="deleteMessage('${data.message._id}')" class="trashIcon"> <i class="material-icons">delete</i></div>` 
          : 
          ''
        }
      </span>
      <div class="messages">
        <span class="chat_message"> ${data.message.text}</span>
      </div>
    </div>
  </div>
  `
}

document.getElementById("users_list").addEventListener("click", (e) => {
  const inputMessage = document.getElementById("user_message");
  inputMessage.classList.remove("hidden");

  document.querySelectorAll("li.user_name_list")
  .forEach(item => item.classList.remove("user_in_focus"))

  document.getElementById("message_user").innerHTML = "";

  if (e.target && e.target.matches("li.user_name_list")) {
    const idUser = e.target.getAttribute("idUser");

    e.target.classList.add("user_in_focus");

    const notification = document.querySelector(`#user_${idUser} .notification`);
    if(notification){
      notification.remove()
    }

    socket.emit("start_chat", { idUser }, (response) => {
      idChatRoom = response.room.idChatRoom;
  
      response.messages.forEach(message => {

        const data = {
          message,
          user: message.to
        }

        addMessage(data)
      })

      goToBottom()
    });
  
  }
});

function addUser(user) {
  const usersList = document.getElementById("users_list");
  usersList.innerHTML += ` 
    <li
      class="user_name_list"
      id="user_${user._id}"
      idUser="${user._id}"
      >
        <img
          class="nav_avatar"
          src=${user.avatar}
        />
        ${user.name}
    </li>
  `;
}

document.getElementById("user_message").addEventListener("keypress", (e) => {
  if(e.key === "Enter") {
    const message = e.target.value;

    e.target.value = "";

    const data = {
      message,
      idChatRoom
    }

    socket.emit("message", data)
  }
})

function backToBottom(){
  const container = document.getElementById("message_user");
  const downButton = document.getElementById("arrow-down");
  if(container.scrollTop + 2  < container.scrollHeight - container.clientHeight){
    downButton.classList.remove("hidden");
  }else {
    downButton.classList.add("hidden")
  }

  
}

function goToBottom() {
  const container = document.getElementById("message_user");
  container.scrollTop =  container.scrollHeight - container.clientHeight
}

document.getElementById("message_user").addEventListener('scroll', () => {
  backToBottom()
})


onLoad();