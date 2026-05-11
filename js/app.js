document.getElementById('message-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = document.getElementById('messageInput').value;
  sendMessage(text);
  document.getElementById('messageInput').value = '';
});

loadMessages();
