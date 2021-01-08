const socket = io();
let username = '';
let userList = [];

let loginPage = document.querySelector('#LoginPage');
let chatPage = document.querySelector('#ChatPage');

let loginInput = document.querySelector('#LoginNameInput');
let textInput = document.querySelector('#ChatTextInput');

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

function renderUserList() {
    let ul = document.querySelector('.UserList')
    ul.innerHTML = '';

    userList.forEach(i => {
        ul.innerHTML += '<li>' + i + '</li>';
    });
}

function addMessage(type, user, msg) {
    let ul = document.querySelector('.ChatList');
    switch (type) {
        case 'status':
            ul.innerHTML += '<li class="m-status">' + msg + '</li>';
            break;

        case 'msg':
            if(username == user){
                ul.innerHTML += '<li class="m-text"><span class="sender">'+user+'</span>' + ' ' +msg+ '</li>';
            }
            else{
                ul.innerHTML += '<li class="m-text"><span>'+user+'</span>' + ' ' +msg+ '</li>';
            }
            
            break;
    }
    ul.scrollTop = ul.scrollHeight;
}

loginInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let name = loginInput.value.trim();
        if (name != '') {
            username = name;
            document.title = 'Chat (' + username + ')';
            socket.emit('join-request', username);
        }
    }
});

textInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let txt = textInput.value.trim();
        textInput.value = '';

        if (txt != '') {
            addMessage('msg', username, txt);
            socket.emit('send-msg', txt);
        }
    }
});


socket.on('user-ok', (list) => {
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();
    addMessage('status', null, 'Conectado!!');

    userList = list;
    renderUserList();
});

socket.on('list-update', (data) => {
    if (data.joined) {
        addMessage('status', null, data.joined + ' Entrou no chat!');
    }

    if (data.left) {
        addMessage('status', null, data.left + ' Saiu do chat!');
    }

    userList = data.list;
    renderUserList();
});

socket.on('show-msg', (data) => {
    addMessage('msg', data.username, data.message);
});

socket.on('disconnect', () => {
    addMessage('status', null, 'Você foi desconectado!!');
    userList = [];
    renderUserList();
});

socket.on('reconnect_error', () => {
    addMessage('status', null, 'Tentando Reconectar!!');
});

socket.on('reconnection', () => {
    if(username != ''){
        addMessage('status',null, 'Reconectado!');
        socket.emit('join-request', username); 
    }
}); 

/* disconnect e reconnet_error não funcionam para a versao socket@3.0.5 */