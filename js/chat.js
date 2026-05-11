// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    setupChatEventListeners();
});

function setupChatEventListeners() {
    // Обработчик отправки сообщения (кнопка)
    document.getElementById('sendButton')?.addEventListener('click', sendMessage);

    // Обработчик отправки сообщения (клавиша Enter)
    document.getElementById('messageInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Обработчик очистки истории чата
    document.getElementById('clearChatHistory')?.addEventListener('click', clearChatHistory);
}

// Функция отправки сообщения
function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();

    if (!text || !currentChat) return;

    // Создаём объект сообщения
    const message = {
        id: Date.now(),
        sender: currentUser.username,
        text: text,
        timestamp: Date.now(),
        isRead: false
    };

    // Находим чат или создаём новый
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

    // Очищаем поле ввода и фокусируемся на нём
    input.value = '';
    input.focus();
}

// Добавление сообщения в интерфейс чата
function addMessageToChat(message) {
    const messagesContainer = document.getElementById('messages');

    if (!messagesContainer) return;

    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.sender === currentUser.username ? 'my-message' : 'other-message'}`;
    messageElement.dataset.messageId = message.id;
    messageElement.innerHTML = `
        <div class="message-text">${escapeHtml(message.text)}</div>
        <div class="message-meta">
            <span class="message-time">${formatTime(message.timestamp)}</span>
            ${message.isRead && message.sender !== currentUser.username ?
                '<span class="read-status">Прочитано</span>' : ''}
        </div>
    `;

    messagesContainer.appendChild(messageElement);
    scrollToBottom();
}

// Прокрутка к последнему сообщению
function scrollToBottom() {
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Загрузка истории чата
function loadChatMessages() {
    const messagesContainer = document.getElementById('messages');

    if (!messagesContainer || !currentChat) return;

    messagesContainer.innerHTML = '';

    // Ищем существующий чат
    const chat = chats.find(c =>
        c.participants.includes(currentUser.username) &&
        c.participants.includes(currentChat.username)
    );

    if (!chat || !chat.messages || chat.messages.length === 0) {
        showNoMessages();
        return;
    }

    // Сортируем сообщения по времени (старые сначала)
    const sortedMessages = [...chat.messages].sort((a, b) => a.timestamp - b.timestamp);

    sortedMessages.forEach(message => {
        addMessageToChat(message);
    });
}

// Показать сообщение «нет сообщений»
function showNoMessages() {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = `
        <div class="no-messages">
            Пока нет сообщений. Начните разговор!
        </div>
    `;
}

// Очистка истории чата
function clearChatHistory() {
    if (!currentChat) return;

    const confirmClear = confirm('Вы уверены, что хотите очистить историю этого чата?');

    if (!confirmClear) return;

    const chat = chats.find(c =>
        c.participants.includes(currentUser.username) &&
        c.participants.includes(currentChat.username)
    );

    if (chat) {
        chat.messages = [];
        saveChats();
        loadChatMessages();
    }
}

// Обновление статуса прочтения
function updateReadStatus(chatPartner) {
    const chat = chats.find(c =>
        c.participants.includes(currentUser.username) &&
        c.participants.includes(chatPartner.username)
    );

    if (chat && chat.messages) {
        chat.messages.forEach(message => {
            if (message.sender !== currentUser.username && !message.isRead) {
                message.isRead = true;
            }
        });
        saveChats();
    }
}

// Экранирование HTML для безопасности
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Форматирование времени
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// Вспомогательные функции для работы с чатами
function saveChats() {
    localStorage.setItem('chats', JSON.stringify(chats));
}

function loadChats() {
    chats = JSON.parse(localStorage.getItem('chats')) || [];
}

// Экспорт функций для использования в других модулях
window.chatUtils = {
    loadChatMessages,
    updateReadStatus,
    clearChatHistory,
    sendMessage
};
