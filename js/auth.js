// Обработчики событий для форм авторизации и регистрации
document.addEventListener('DOMContentLoaded', function() {
    setupAuthEventListeners();
    loadUsers();
});

function setupAuthEventListeners() {
    // Обработчик кнопки входа
    document.getElementById('loginBtn')?.addEventListener('click', login);

    // Обработчик кнопки регистрации
    document.getElementById('registerBtn')?.addEventListener('click', register);

    // Обработчик перехода к форме регистрации
    document.getElementById('showRegister')?.addEventListener('click', function(e) {
        e.preventDefault();
        showRegistrationForm();
    });

    // Обработчик возврата к форме входа
    document.getElementById('showLogin')?.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm();
    });
}

// Функция авторизации
function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showError('Введите логин и пароль');
        return;
    }

    // Проверяем существование пользователя
    const user = users.find(u => u.username === username);

    if (user && user.password === password) {
        // Успешная авторизация
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Обновляем статус пользователя как онлайн
        user.isOnline = true;
        saveUsers();

        // Показываем основное приложение
        showApp();
    } else {
        showError('Неверный логин или пароль');
    }
}

// Функция регистрации
function register() {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Валидация формы
    if (!username) {
        showError('Введите имя пользователя');
        return;
    }

    if (!email) {
        showError('Введите email');
        return;
    }

    if (password.length < 4) {
        showError('Пароль должен содержать минимум 4 символа');
        return;
    }

    if (password !== confirmPassword) {
        showError('Пароли не совпадают');
        return;
    }

    // Проверяем, не существует ли пользователь с таким именем
    if (users.find(u => u.username === username)) {
        showError('Пользователь с таким именем уже существует');
        return;
    }

    // Проверяем, не существует ли пользователь с таким email
    if (users.find(u => u.email === email)) {
        showError('Пользователь с таким email уже существует');
        return;
    }

    // Создаём нового пользователя
    const newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        isOnline: true,
        avatar: username.charAt(0).toUpperCase()
    };

    users.push(newUser);
    saveUsers();

    // Автоматически авторизуем пользователя
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    showApp();
}

// Показ формы регистрации
function showRegistrationForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

// Возврат к форме авторизации
function showLoginForm() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

// Показать сообщение об ошибке
function showError(message) {
    // Удаляем предыдущее сообщение об ошибке, если есть
    const existingError = document.querySelector('.auth-error');
    if (existingError) {
        existingError.remove();
    }

    const errorElement = document.createElement('div');
    errorElement.className = 'auth-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #ff4757;
        font-size: 12px;
        margin: 5px 0;
        text-align: center;
    `;

    const form = document.querySelector('.auth-form:not([style*="display: none"])');
    form.insertBefore(errorElement, form.firstChild);

    setTimeout(() => {
        errorElement.remove();
    }, 3000);
}

// Вспомогательные функции для работы с пользователями
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

function loadUsers() {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    // Устанавливаем статус офлайн для всех пользователей при загрузке
    storedUsers.forEach(user => {
        user.isOnline = false;
    });
    users = storedUsers;
}
