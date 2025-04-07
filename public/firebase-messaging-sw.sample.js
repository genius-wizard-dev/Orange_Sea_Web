importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
};

firebase.initializeApp(firebaseConfig);

class CustomPushEvent extends Event {
  constructor(data) {
    super('push');
    Object.assign(this, data);
    this.custom = true;
  }
}

self.addEventListener('push', (e) => {
  if (e.custom) return;

  const oldData = e.data;
  let parsedData;

  if (!oldData) {
    console.warn('No push data received');
    parsedData = { data: { title: 'No title', body: 'No body' } };
  } else {
    try {
      parsedData = oldData.json();
    } catch (error) {
      console.error('Failed to parse push data as JSON:', error);
      const textData = oldData.text();
      parsedData = {
        data: {
          title: textData || 'Tin nhắn mới',
          body: 'Bạn có tin nhắn mới.',
        },
      };
    }
  }

  const newEvent = new CustomPushEvent({
    data: {
      rawData: parsedData,
      json() {
        const newData = parsedData;
        newData.data = {
          ...newData.data,
          ...newData.notification,
        };
        delete newData.notification;
        return newData;
      },
    },
    waitUntil: e.waitUntil.bind(e),
  });

  e.stopImmediatePropagation();
  dispatchEvent(newEvent);
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background push notification received:', payload);

  // Extract data from both notification and data objects for consistency
  const notificationData = payload.notification || {};
  const customData = payload.data || {};

  // Use notification data first, then fall back to custom data
  const title = notificationData.title || customData.title || "Tin nhắn mới";
  const body = notificationData.body || customData.body || "Bạn có tin nhắn mới.";
  const image = notificationData.image || customData.image || "/images/firebase.png";
  const chatId = customData.chatId || "general";
  const link = customData.link || "/";
  const tag = customData.tag || `chat-${chatId}`;

  const notificationOptions = {
    body,
    icon: image,
    tag,
    data: {
      ...customData,
      link,
    },
  };

  // Hiển thị thông báo
  return self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Đóng thông báo sau khi click

  const { link } = event.notification.data || {};
  if (link) {
    event.waitUntil(
      self.clients.openWindow(link) // Mở link dẫn đến cuộc trò chuyện
    );
  } else {
    event.waitUntil(
      self.clients.openWindow('/') // Mở trang mặc định nếu không có link
    );
  }
});
