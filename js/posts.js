// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    setupPostsEventListeners();
    loadPosts();
});

function setupPostsEventListeners() {
    // Обработчик создания поста
    document.getElementById('createPostBtn')?.addEventListener('click', createPost);

    // Обработчик нажатия Enter в поле создания поста (без Shift)
    document.getElementById('postContent')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            createPost();
        }
    });

    // Обработчик выбора файлов
    document.getElementById('fileInput')?.addEventListener('change', handleFileSelect);

    // Обработчик кнопки репоста
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('repost-btn')) {
            const postId = e.target.dataset.postId;
            repost(postId);
        }
    });
}

// Обработка выбора файлов
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 3) {
        showError('Можно загрузить не более 3 файлов');
        return;
    }

    const fileList = document.getElementById('selectedFiles');
    fileList.innerHTML = '';

    Array.from(files).forEach(file => {
        const li = document.createElement('li');
        li.textContent = file.name;
        fileList.appendChild(li);
    });
}

// Функция создания поста
function createPost() {
    const textarea = document.getElementById('postContent');
    const content = textarea.value.trim();
    const fileInput = document.getElementById('fileInput');
    const files = fileInput?.files || [];

    if (!content && files.length === 0) {
        showError('Введите текст поста или добавьте вложения!');
        return;
    }

    // Извлекаем хештеги
    const hashtags = extractHashtags(content);

    // Создаём объект поста
    const post = {
        id: Date.now(),
        author: currentUser.username,
        content: content,
        timestamp: Date.now(),
        likes: 0,
        likedBy: [],
        comments: [],
        hashtags: hashtags,
        attachments: [],
        isRepost: false,
        originalPostId: null
    };

    // Обрабатываем вложения
    if (files.length > 0) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();

            reader.onload = function(e) {
                post.attachments.push({
                    type: file.type.startsWith('image/') ? 'image' : 'file',
                    name: file.name,
                    data: e.target.result,
                    size: file.size
                });
            };

            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file); // Для текстовых файлов
            }
        });
    }

    posts.push(post);
    savePosts();

    // Очищаем поля ввода
    textarea.value = '';
    if (fileInput) fileInput.value = '';
    document.getElementById('selectedFiles').innerHTML = '';

    // Обновляем список постов
    loadPosts();
}

// Извлечение хештегов из текста
function extractHashtags(text) {
    const regex = /#\w+/g;
    const matches = text.match(regex);
    return matches ? matches.map(tag => tag.toLowerCase()) : [];
}

// Создание элемента поста
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = `post-card ${post.isRepost ? 'repost' : ''}`;
    postDiv.dataset.postId = post.id;

    const isLikedByCurrentUser = post.likedBy.includes(currentUser.username);
    const displayAuthor = post.isRepost ?
        `Репост от ${post.author} (оригинал от ${getOriginalAuthor(post.originalPostId)})` :
        post.author;

    let attachmentsHTML = '';
    if (post.attachments && post.attachments.length > 0) {
        attachmentsHTML = `
            <div class="post-attachments">
                ${post.attachments.map(attach => {
                    if (attach.type === 'image') {
                return `
                    <img src="${attach.data}" alt="${attach.name}" class="attachment-image">
                `;
            } else {
                return `
                    <div class="attachment-file">
                        <span>📄 ${attach.name}</span>
                        <span class="file-size">(${formatFileSize(attach.size)})</span>
                    </div>
                `;
            }
        }).join('')}
            </div>
        `;
    }

    let hashtagsHTML = '';
    if (post.hashtags && post.hashtags.length > 0) {
        hashtagsHTML = `
            <div class="post-hashtags">
                ${post.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join(' ')}
            </div>
        `;
    }

    postDiv.innerHTML = `
        <div class="post-header">
            <div class="post-avatar">${displayAuthor.charAt(0).toUpperCase()}</div>
            <div class="post-author">${displayAuthor}</div>
            <div class="post-time">${formatTime(post.timestamp)}</div>
        </div>
        <div class="post-content">${escapeHtml(post.content)}</div>
        ${hashtagsHTML}
        ${attachmentsHTML}
        <div class="post-actions">
            <button class="like-btn ${isLikedByCurrentUser ? 'liked' : ''}" data-id="${post.id}">
                ❤️ ${post.likes}
            </button>
            <button class="repost-btn" data-post-id="${post.id}">🔁 Репост</button>
            <span class="comments-count">${post.comments.length} комментариев</span>
        </div>
        <div class="comments-section">
            ${post.comments.map(comment => `
                <div class="comment">
                    <strong>${comment.author}:</strong> ${escapeHtml(comment.text)}
                </div>
            `).join('')}
            <div class="add-comment">
                <input type="text" class="comment-input" data-post-id="${post.id}" placeholder="Добавить комментарий...">
                <button class="add-comment-btn" data-post-id="${post.id}">Отправить</button>
            </div>
        </div>
    `;

    return postDiv;
}

// Функция репоста
function repost(postId) {
    const originalPost = posts.find(p => p.id === postId);
    if (!originalPost) return;

    // Проверяем, не является ли это уже репостом
    const repostSourceId = originalPost.isRepost ? originalPost.originalPostId : postId;

    const repost = {
        id: Date.now(),
        author: currentUser.username,
        content: `Репост поста от @${originalPost.author}`,
        timestamp: Date.now(),
        likes: 0,
        likedBy: [],
        comments: [],
        hashtags: originalPost.hashtags,
        attachments: originalPost.attachments,
        isRepost: true,
        originalPostId: repostSourceId
    };

    posts.push(repost);
    savePosts();
    loadPosts();
}

// Получение автора оригинального поста
function getOriginalAuthor(originalPostId) {
    const original = posts.find(p => p.id === originalPostId);
    return original ? original.author : 'Неизвестный автор';
}

// Форматирование размера файла
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Обработка лайков
function likePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const userIndex = post.likedBy.indexOf(currentUser.username);
    const isLiked = userIndex !== -1;

    if (isLiked) {
        // Убираем лайк
        post.likedBy.splice(userIndex, 1);
        post.likes--;
    } else {
        // Добавляем лайк
        post.likedBy.push(currentUser.username);
        post.likes++;
    }

    savePosts();
    loadPosts(); // Обновляем отображение
}

// Добавление комментария
function addComment(postId) {
    const input = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
    const text = input.value.trim();
    if (!text) return;

    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments.push({
            id: Date.now(),
            author: currentUser.username,
            text: text,
            timestamp: Date.now()
        });
        savePosts();
        input.value = ''; // Очищаем поле ввода
        loadPosts(); // Обновляем отображение
    }
}

// Показать сообщение об ошибке
function showError(message) {
    alert(message); // В реальном приложении лучше использовать более изящное уведомление
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
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

// Вспомогательные функции для работы с постами
function savePosts() {
    localStorage.setItem('posts', JSON.stringify(posts));
}

function loadPostsData() {
    posts = JSON.parse(localStorage.getItem('posts')) || [];
}

// Загрузка и отображение постов
function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');

    if (!postsContainer) return;

    postsContainer.innerHTML = '';

    // Сортируем посты по времени (новые сверху)
    const sortedPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp);

    sortedPosts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Экспорт функций для использования в других модулях
window.postsUtils = {
    loadPosts,
    createPost,
    likePost,
    addComment,
    repost,
    formatFileSize
};
