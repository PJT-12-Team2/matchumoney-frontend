// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Firebase config (클라이언트 공개 값)
const firebaseConfig = {
  apiKey: 'AIzaSyAQvuZj_nOWZ-LZUjHVW-As8l6IdV__5s4',
  authDomain: 'matchumoney-31193.firebaseapp.com',
  projectId: 'matchumoney-31193',
  messagingSenderId: '504778922081',
  appId: '1:504778922081:web:ef1eb4659f968969f23220',
  measurementId: 'G-EZHN3FWLNT',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 백그라운드 메시지 수신 (탭이 비활성/닫힘 상태)
messaging.onBackgroundMessage((payload) => {
  // 로그로 notification 포함 여부를 확인
  const hasNotif = !!(payload && payload.notification && (payload.notification.title || payload.notification.body));
  console.log('[firebase-messaging-sw.js] Background message:', payload, 'hasNotif=', hasNotif);

  // ✅ notification payload가 있으면 브라우저가 자동으로 표시하므로, 여기서 중복 표시 금지
  if (hasNotif) return;

  const id = payload?.data?.id; // ← 서버에서 내려준 msgKey
  // ✅ data-only일 때만 우리가 직접 표시
  const title = (payload && payload.data && payload.data.title) || '알림';

  const body = (payload && payload.data && payload.data.body) || '';

  // 링크 추출 (data 우선)
  const link = (payload && payload.data && (payload.data.link || payload.data.click_action)) || '/';

  const notificationOptions = {
    body,
    // public 폴더 자산 경로 (루트 기준)
    icon: '/AlarmLogo.png',
    data: { link },
    // 동일 링크/내용이면 이전 알림을 대체하여 중복 감소
    tag: link || (title + body).slice(0, 64),
    renotify: false,
  };

  console.log('[SW] data-only push id=', id, 'type=', payload?.data?.type);

  self.registration.showNotification(title, notificationOptions);
});

// 알림 클릭 시 링크 열기/포커스
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // onBackgroundMessage에서 심어둔 data.link를 최우선으로 확인
  let link =
    (event.notification && event.notification.data && event.notification.data.link) ||
    (event.notification.data &&
      event.notification.data.FCM_MSG &&
      event.notification.data.FCM_MSG.notification &&
      event.notification.data.FCM_MSG.notification.click_action) ||
    (event.notification.data && event.notification.data.fcmOptions && event.notification.data.fcmOptions.link);

  // 추가 fallback
  if (!link && event.notification.data) {
    link = event.notification.data.click_action || event.notification.data.link;
  }
  if (!link && event.notification.click_action) {
    link = event.notification.click_action;
  }

  if (link) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        for (const client of windowClients) {
          if (client.url === link && 'focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(link);
      })
    );
  }
});
