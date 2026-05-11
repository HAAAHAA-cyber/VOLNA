/**
 * Утилиты для работы с данными в социальной сети
 */

// === STRING UTILS ===

/**
 * Экранирование HTML для безопасности
 * @param {string} text - текст для экранирования
 * @returns {string} экранированный текст
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Извлечение хештегов из текста
 * @param {string} text - текст поста
 * @returns {string[]} массив хештегов в нижнем регистре
 */
function extractHashtags(text) {
    const regex = /#\w+/g;
    const matches = text.match(regex);
    return matches ? matches.map(tag => tag.toLowerCase()) : [];
}

/**
 * Капитализация первой буквы строки
 * @param {string} str - входная строка
 * @returns {string} строка с заглавной первой буквой
 */
function capitalize(str) {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// === DATE UTILS ===

/**
 * Форматирование времени в формате ЧЧ:ММ ДД.ММ
 * @param {number} timestamp - UNIX timestamp
 * @returns {string} отформатированное время
 */
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

/**
 * Получение времени в формате «X минут/часов/дней назад»
 * @param {number} timestamp - UNIX timestamp
 * @returns {string} время в формате «5 минут назад» и т. д.
 */
function timeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} минут назад`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} часов назад`;
    return `${Math.floor(minutes / 1440)} дней назад`;
}

// === FILE UTILS ===

/**
 * Форматирование размера файла
 * @param {number} bytes - размер в байтах
 * @returns {string} отформатированный размер (например, «2.5 MB»)
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Проверка типа файла по MIME‑типу
 * @param {string} mimeType - MIME‑тип файла
 * @returns {boolean} true, если это изображение
 */
function isImageFile(mimeType) {
    return mimeType.startsWith('image/');
}

// === ARRAY UTILS ===


/**
 * Удаление дубликатов из массива
 * @param {Array} arr - входной массив
 * @returns {Array} массив без дубликатов
 */
function unique(arr) {
    return [...new Set(arr)];
}

/**
 * Разбиение массива на чанки
 * @param {Array} arr - массив для разбиения
 * @param {number} size - размер чанка
 * @returns {Array[]} массив чанков
 */
function chunk(arr, size) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

// === OBJECT UTILS ===

/**
 * Глубокое клонирование объекта
 * @param {Object} obj - объект для клонирования
 * @returns {Object} глубокая копия объекта
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Слияние объектов
 * @param {...Object} objs - объекты для слияния
 * @returns {Object} объединённый объект
 */
function mergeObjects(...objs) {
    return Object.assign({}, ...objs);
}

// === DOM UTILS ===

/**
 * Создание HTML‑элемента с атрибутами
 * @param {string} tag - тег элемента
 * @param {Object} attrs - атрибуты элемента
 * @returns {HTMLElement} созданный элемент
 */
function createElement(tag, attrs = {}) {
    const element = document.createElement(tag);
    Object.keys(attrs).forEach(key => {
        if (key === 'className') {
            element.className = attrs[key];
        } else if (key === 'innerHTML') {
            element.innerHTML = attrs[key];
        } else {
            element.setAttribute(key, attrs[key]);
        }
    });
    return element;
}

/**
 * Показать сообщение об ошибке
 * @param {string} message - текст ошибки
 */
function showError(message) {
    // В реальном приложении лучше использовать кастомное уведомление
    alert(message);
}

/**
 * Показать уведомление об успехе
 * @param {string} message - текст уведомления
 */
function showSuccess(message) {
    alert(`✅ ${message}`);
}

// === STORAGE UTILS ===

/**
 * Сохранение данных в localStorage
 * @param {string} key - ключ
 * @param {*} value - значение
 */
function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Загрузка данных из localStorage
 * @param {string} key - ключ
 * @param {*} defaultValue - значение по умолчанию
 * @returns {*} сохранённые данные или значение по умолчанию
 */
function loadFromStorage(key, defaultValue = null) {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
}

/**
 * Очистка данных из localStorage по ключу
 * @param {string} key - ключ для очистки
 */
function clearStorage(key) {
    localStorage.removeItem(key);
}

// === API UTILS (заготовка для будущей интеграции) ===

/**
 * Базовый запрос к API
 * @param {string} url - URL API
 * @param {Object} options - опции запроса
 * @returns {Promise} результат запроса
 */
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

// Экспорт всех утилит
window.utils = {
    escapeHtml,
    extractHashtags,
    capitalize,
    formatTime,
    timeAgo,
    formatFileSize,
    isImageFile,
    unique,
    chunk,
    deepClone,
    mergeObjects,
    createElement,
    showError,
    showSuccess,
    saveToStorage,
    loadFromStorage,
    clearStorage,
    apiRequest
};
