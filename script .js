// Хранилище данных (в реальном приложении — сервер/БД)
let users = [];
let posts = [];
let chats = [];
let currentUser = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Переключение между формами авторизации и регистрации
    document.getElementById('showRegister').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.auth-form').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    });

    // Обработчики форм
    document.getElementById('loginBtn').addEventListener('click', login);
    document.getElementById('registerBtn').addEventListener('click', register);
    document.getElementById('sendButton').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    // Публикация поста
    document.querySelector('.post-create button').addEventListener('click', createPost);

    // Вкладки интерфейса
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', switchTab);
    });
});

// Регистрация нового пользователя
function register() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    if (!username || !email || !password) {
        alert('Заполните все поля!');
        return;
    }

    // Проверка на существование пользователя
    if (users.find(u => u.username === username)) {
        alert('Пользователь с таким именем уже существует!');
        return;
    }

    const newUser = {
        id: Date.now(),
        username,
        email,
        password, // В реальном приложении — хэшировать!
        status: 'online',
        avatar: username.charAt(0).toUpperCase()
    };

    users.push(newUser);
    loginUser(newUser);
}

// Авторизация
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const user = users.find(u =>
        u.username === username && u.password === password
    );

    if (user) {
        loginUser(user);
    } else {
        alert('Неверное имя пользователя или пароль!');
    }
}

// Успешный вход в систему
function loginUser(user) {
    currentUser = user;

    // Обновляем интерфейс
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';
    document.getElementById('currentUser').textContent = user.username;
    document.querySelector('.user-profile .avatar').textContent = user.avatar;

    // Загружаем данные
    loadContacts();
    loadPosts();
    updateOnlineStatus();
}

// Загрузка контактов
function loadContacts() {
    const contactsList = document.getElementById('contactsList');
    contactsList.innerHTML = '';

    users.forEach(user => {
        if (user.id !== currentUser.id) {
            const contact = document.createElement('div');
            contact.className = 'contact';
            contact.innerHTML = `
                <div class="avatar ${user.status}">${user.avatar}</div>
                <div class="contact-info">
                    <div class="contact-name">${user.username}</div>
            <div class="last-message">Нет сообщений</div>
        </div>
        <div class="message-time">12:00</div>
            `;
            contact.addEventListener('click', () => openChat(user));
            contactsList.appendChild(contact);
        }
    });
}

// Открытие чата
function openChat(contact) {
    document.querySelectorAll('.contact').forEach(c => c.classList.remove('active'));
    event.target.closest('.contact').classList.add('active');

    document.getElementById('chatName').textContent = contact.username;
    document.getElementById('chatAvatar').textContent = contact.avatar;
    document.getElementById('chatStatus').textContent = contact.status;
    document.getElementById('chatStatus').className =
        'online-status ' + contact.status;
}

// Отправка сообщения
function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();

    if (!text) return;

    const message = document.createElement('div');
    message.className = 'message my-message';
    message.innerHTML = `
        ${text}
        <div class="message-time-stamp">${getCurrentTime()}</div>
    `;

    document.getElementById('messages').appendChild(message);
    input.value = '';
}

// Создание поста
function createPost() {
    const textarea = document.querySelector('.post-create textarea');
    const content = textarea.value.trim();

    if (!content) return;

    const post = {
        id: Date.now(),
        author: currentUser.username,
        authorAvatar: currentUser.avatar,
        content,
        time: getCurrentTime(),
        likes: 0
    };

    posts.unshift(post);
    renderPosts();
    textarea.value = '';
}

// Отображение постов
function renderPosts() {
    const postsList = document.getElementById('postsList');
    postsList.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-avatar">${post.authorAvatar}</div>
                <div class="post-author">${post.author}</div>
                <div class="post-time">${post.time}</div>
            </div>
            <div class="post-content">${post.content}</div>
        `;
        postsList.appendChild(postElement);
    });
}

// Переключение вкладок
function switchTab(e) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

    const tabName = e.target.dataset.tab;
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Обновление статуса онлайн
function updateOnlineStatus() {
    setInterval(() => {
        // Имитация изменения статуса (в реальном приложении — от сервера)
        users.forEach(user => {
            if (Math.random() > 0.7 && user.id !== currentUser.id) {
                user.status = Math.random() > 0.5 ? 'online' : 'offline';
            }
        });
        loadContacts();
    }, 30000); // Каждые 30 секунд
}

// Вспомогательная функция для времени
function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}
