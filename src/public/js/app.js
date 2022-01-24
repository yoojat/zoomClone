const socket = io();

const welcome = document.getElementById('welcome');
const form = welcome.querySelector('form');
const room = document.getElementById('room');

room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#msg input');
  const value = input.value;
  socket.emit('new_message', input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = '';
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector('#msg');
  msgForm.addEventListener('submit', handleMessageSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const roomInput = form.querySelector('#roomname');
  const nicknameInput = form.querySelector('#nickname');
  console.log(nicknameInput.value);
  // emit함수의 첫 번째 인자는 서버와 통신할 고유 string값(서버에서도 정해줌), 두번쨰 인자는 전달하는 값, 세번째 인자는 서버에서 실행시킬 함수(서버에서 done으로 받아서 실행할 수 있음)

  socket.emit(
    'connect_with_nickname',
    roomInput.value,
    nicknameInput.value,
    showRoom
  );
  // socket.emit('enter_room', input.value, showRoom); // 마지막에 done 함수
  roomName = roomInput.value;
  roomInput.value = '';
  nicknameInput.value = '';
}

form.addEventListener('submit', handleRoomSubmit);

socket.on('welcome', (user) => {
  addMessage(`${user} arrived!`);
});

socket.on('bye', (user) => {
  addMessage(`${user} left ㅠㅠ`);
});

socket.on('new_message', addMessage);
