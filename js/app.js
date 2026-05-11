// Глобальные переменные приложения
let currentUser = null;
let currentChat = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let chats = JSON.parse(localStorage.getItem('chats')) || [];
let posts = JSON.parse(localStorage.getItem('posts')) || [];

// Инициализация приложения при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Проверяем авторизацию
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        showApp();
        loadContacts();
        loadPosts();
    } else {
        showAuth();
    }
    
    // Настройка обработчиков событий
    setupEventListeners();
    
    // Инициализация темы
    initializeTheme();
}

function setupEventListeners() {
    // Переключение вкладок
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Отправка сообщений
    document.getElementById('sendButton').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Создание поста
    document.querySelector('.post-create button')?.addEventListener('click', createPost);
    
    // Смена темы
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

function switchTab(tabName) {
    // Убираем активный класс у всех вкладок
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Добавляем активный класс выбранной вкладке
    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
    
    // Показываем/скрываем соответствующие секции
    switch (tabName) {
        case 'chats':
            document.querySelector('.contacts-list').style.display = 'block';
            document.querySelector('.posts-list').style.display = 'none';
            break;
        case 'posts':
            document.querySelector('.contacts-list').style.display = 'none';
            document.querySelector('.posts-list').style.display = 'block';
            loadPosts();
            break;
        default:
            document.querySelector('.contacts-list').style.display = 'block';
            document.querySelector('.posts-list').style.display = 'none';
    }
}

function showAuth() {
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
}

function showApp() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';
    
    // Обновляем интерфейс пользователя
    document.getElementById('currentUser').textContent = currentUser.username;
    
    // Устанавливаем первую букву в качестве аватара
    const firstLetter = currentUser.username.charAt(0).toUpperCase();
    document.getElementById('userAvatar').textContent = firstLetter;
}

function loadContacts() {
    const contactsList = document.getElementById('contactsList');
    contactsList.innerHTML = '';
    
    // Фильтруем пользователей, исключая текущего
    const otherUsers = users.filter(user => user.username !== currentUser.username);
    
    
    otherUsers.forEach(user => {
        const contact = document.createElement('div');
        contact.className = 'contact';
        contact.innerHTML = `
            <div class="avatar ${user.isOnline ? 'online' : 'offline'}">
                ${user.username.charAt(0).toUpperCase()}
                ${user.isOnline ? '<div class="online-indicator"></div>' : ''}
            </div>
            <div class="contact-info">
                <div class="contact-name">${user.username}</div>
                <div class="last-message">${getLastMessage(user.username) || 'Нет сообщений'}</div>
            </div>
            <div class="message-time">${getLastMessageTime(user.username)}</div>
        `;
        
        contact.addEventListener('click', () => openChat(user));
        contactsList.appendChild(contact);
    });
}

function getLastMessage(username) {
    // Ищем чат с этим пользователем
    const chat = chats.find(c =>
        c.participants.includes(currentUser.username) &&
        c.participants.includes(username)
    );
    
    if (!chat || !chat.messages || chat.messages.length === 0) return null;
    
    return chat.messages[chat.messages.length - 1].text;
}

function getLastMessageTime(username) {
    const chat = chats.find(c =>
        c.participants.includes(currentUser.username) &&
        c.participants.includes(username)
    );
    
    if (!chat || !chat.messages || chat.messages.length === 0) return '';
    const lastMessage = chat.messages[chat.messages.length - 1];
    return formatTime(lastMessage.timestamp);
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function openChat(user) {
    currentChat = user;
    document.getElementById('chatName').textContent = user.username;
    document.getElementById('chatStatus').textContent = user.isOnline ? 'Онлайн' : 'Офлайн';
    document.getElementById('chatStatus').className = user.isOnline ? 'online-status' : 'offline-status';
    
    // Обновляем аватар чата
    document.getElementById('chatAvatar').textContent = user.username.charAt(0).toUpperCase();
    
    // Загружаем сообщения чата
    loadChatMessages();
}

function loadChatMessages() {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';
    
    
    // Ищем существующий чат или создаём новый
    let chat = chats.find(c =>
        c.participants.includes(currentUser.username) &&
        c.participants.includes(currentChat.username)
    );
    
    if (!chat) {
        chat = {
            id: Date.now(),
            participants: [currentUser.username, currentChat.username],
            messages: []
        };
        chats.push(chat);
    }
    
    chat.messages.forEach(message => {
        addMessageToChat(message);
    });
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    // Создаём объект сообщения
    const message = {
        id: Date.now(),
        sender: currentUser.username,
        text: text,
        timestamp: Date.now()
    };
    
    // Находим чат
    let chat = chats.find(c =>
        c.participants.includes(currentUser.username) &&
        c.participants.includes(currentChat.username)
    );
    
    if (!chat) {
        chat = {
            id: Date.now(),
            participants: [currentUser.username, currentChat.username],
            messages: []
        };
        chats.push(chat);
    }
    
    // Добавляем сообщение в чат
    chat.messages.push(message);
    saveChats();
    
    // Отображаем сообщение
    addMessageToChat(message);
    
    // Очищаем поле ввода
    input.value = '';
}

function addMessageToChat(message) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.sender === currentUser.username ? 'my-message' : 'other-message'}`;
    messageElement.innerHTML = `
        <div>${message.text}</div>
        <div class="message-time-stamp">${formatTime(message.timestamp)}</div>
    `;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function createPost() {
    const textarea = document.querySelector('.post-create textarea');
    const content = textarea.value.trim();

    if (!content) {
        alert('Введите текст поста!');
        return;
    }

    // Создаём объект поста
    const post = {
        id: Date.now(),
        author: currentUser.username,
        content: content,
        timestamp: Date.now(),
        likes: 0,
        comments: []
    };

    posts.push(post);
    savePosts();

    // Очищаем поле ввода
    textarea.value = '';

    // Обновляем список постов
    loadPosts();
}

function loadPosts() {
    const postsList = document.querySelector('.posts-list');
    postsList.innerHTML = '';

    // Сортируем посты по времени (новые сверху)
    const sortedPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp);

    sortedPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-avatar">${post.author.charAt(0).toUpperCase()}</div>
                <div class="post-author">${post.author}</div>
                <div class="post-time">${formatTime(post.timestamp)}</div>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
                <button class="like-btn" data-id="${post.id}">
                    ❤️ ${post.likes}
        </button>
        <div class="comments-list">
            ${post.comments.map(comment => `
                <div class="comment">
                    <strong>${comment.author}:</strong> ${comment.text}
                </div>
            `).join('')}
        </div>
        <input type="text" class="comment-input" data-post-id="${post.id}" placeholder="Добавить комментарий...">
        <button class="add-comment-btn" data-post-id="${post.id}">Отправить</button>
    </div>
`;
        postsList.appendChild(postElement);
    });

    // Добавляем обработчики для лайков и комментариев
    setupPostActions();
}

function setupPostActions() {
    // Обработчики лайков
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = parseInt(this.getAttribute('data-id'));
            likePost(postId);
        });
    });

    // Обработчики комментариев
    document.querySelectorAll('.add-comment-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = parseInt(this.getAttribute('data-post-id'));
            addComment(postId);
        });
    });
}

function likePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.likes++;
        savePosts();
        loadPosts(); // Обновляем отображение
    }
}

function addComment(postId) {
    const input = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
    const text = input.value.trim();
    if (!text) return;

    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments.push({
            author: currentUser.username,
            text: text,
            timestamp: Date.now()
        });
        savePosts();
        input.value = '';
        loadPosts(); // Обновляем отображение
    }
}

// Сохранение данных в localStorage
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

function saveChats() {
    localStorage.setItem('chats', JSON.stringify(chats));
}

function savePosts() {
    localStorage.setItem('posts', JSON.stringify(posts));
}

// Смена темы
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');

    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        themeToggle.textContent = 'Тёмная тема';
    } else {
        body.classList.add('dark-theme');
        themeToggle.textContent = 'Светлая тема';
    }
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');

    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.textContent = 'Светлая тема';
    } else {
        body.classList.remove('dark-theme');
        themeToggle.textContent = 'Тёмная тема';
    }
}

// Выход из системы
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAuth();
}
