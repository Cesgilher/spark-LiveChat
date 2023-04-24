
const socket = io();
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomTitle = document.getElementById('roomTitle');
const userList = document.getElementById('users');

console.log(username, room)

// Join chatroom
socket.emit('joinRoom', {username, room});


//Message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // Get message text
    const msg = event.target.elements.msg.value;
    
    socket.emit('chatMessage',msg);

    // Clear input
    event.target.elements.msg.value = '';
    event.target.elements.msg.focus();
    
});


// Output message to Client
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.content}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

// Get room and users
socket.on('roomUsers', ({room, users}) => {
    console.log(room, users);
    outputRoomName(room);
    outputUsers(users);
});

// Add room name to Client
function outputRoomName(room) {
    roomName.innerText = room;
    roomTitle.innerText = room;
}   

// Add users to Client
function outputUsers(users) {
    userList.innerHTML = 
    `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}