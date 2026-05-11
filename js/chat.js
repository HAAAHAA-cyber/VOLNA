import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';

const db = getFirestore();

export function sendMessage(text) {
  addDoc(collection(db, 'messages'), {
    text,
    timestamp: Date.now()
  });
}

export function loadMessages() {
  onSnapshot(collection(db, 'messages'), (snapshot) => {
    const messages = snapshot.docs.map(doc => doc.data());
    const chatContainer = document.getElementById('chat');
    chatContainer.innerHTML = '';
    messages.forEach(msg => {
      const div = document.createElement('div');
      div.textContent = msg.text;
      chatContainer.appendChild(div);
    });
  });
}
