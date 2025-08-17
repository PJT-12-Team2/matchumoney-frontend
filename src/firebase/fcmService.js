// src/firebase/fcmService.js
// Encapsulates all FCM (Web Push) logic so main.js stays clean

import { getToken, deleteToken, onMessage } from 'firebase/messaging';
import { getMessagingIfSupported } from '@/firebase/firebaseClient';
import pushApi from '@/api/push';
import { showToast } from '@/util/toast';

// --- duplicate-guard flags (module scope) ---
let initStarted = false; // 초기화 시도 중 (진행 중 재호출 방지)
let initDone = false; // 초기화 완료 (완료 후 재호출 방지)
let onMessageBound = false; // onMessage 핸들러 중복 바인딩 방지
let cachedMessaging = null; // 필요 시 재사용

// --- helper: 포그라운드 핸들러 바인딩(단 1회) ---
function bindOnMessageOnce(messaging) {
  if (onMessageBound) {
    console.log('[FCM] onMessage already bound — skip');
    return;
  }
  if (!messaging) {
    console.warn('[FCM] bindOnMessageOnce called without messaging instance');
    return;
  }
  console.log('[FCM] binding onMessage');
  onMessage(messaging, (payload) => {
    console.log('[FCM] 포그라운드 메시지 수신:', payload);
    const n = payload?.notification;
    const d = payload?.data || {};
    const title = n?.title || d.title || '알림';
    const body = n?.body || d.body || '';
    const link = d.link || n?.click_action || '/';

    showToast({
      title,
      message: body,
      type: 'info',
      onClick: () => {
        if (link) window.open(link, '_blank');
      },
    });
  });
  onMessageBound = true;
}

export async function initFCM() {
  // 중복 초기화/경쟁 상태 방지
  if (initDone) {
    console.log('[FCM] init skipped — already done');
    return;
  }
  if (initStarted) {
    console.log('[FCM] init already in progress — skip this call');
    return;
  }
  initStarted = true;

  try {
    console.log('[FCM] initFCM(): start');

    // Run only on localhost or HTTPS
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const isHttps = location.protocol === 'https:';
    console.log('[FCM] env check:', { host: location.hostname, protocol: location.protocol, isLocalhost, isHttps });
    if (!isLocalhost && !isHttps) {
      console.warn('[FCM] not localhost/https — abort init');
      initStarted = false;
      return;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('[FCM] serviceWorker not supported — abort init');
      initStarted = false;
      return;
    }

    // 1) messaging 먼저 확보하고 onMessage 즉시 바인딩(가장 중요)
    const messaging = await getMessagingIfSupported();
    console.log('[FCM] getMessagingIfSupported() =>', !!messaging);
    if (!messaging) {
      console.warn('[FCM] messaging not supported — abort init');
      initStarted = false;
      return;
    }
    cachedMessaging = messaging;
    bindOnMessageOnce(messaging);

    // 2) SW 등록/권한/토큰 발급은 그 다음
    console.log('[FCM] registering service worker...');
    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('[FCM] service worker registered:', swReg?.scope);

    const permission = await Notification.requestPermission();
    console.log('[FCM] notification permission =', permission);
    if (permission !== 'granted') {
      console.warn('[FCM] permission not granted — abort init');
      initStarted = false;
      return;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_MESSAGING_VAPID_KEY;
    if (!vapidKey) {
      console.warn('[FCM] VAPID key missing (VITE_FIREBASE_MESSAGING_VAPID_KEY)');
      initStarted = false;
      return;
    }

    console.log('[FCM] requesting FCM token...');
    const fcmToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swReg,
    });
    console.log('[FCM] getToken() =>', !!fcmToken);

    if (!fcmToken) {
      console.warn('[FCM] token not issued — abort init');
      initStarted = false;
      return;
    }

    // Send to server only if changed
    const cachedToken = localStorage.getItem('fcmToken');
    if (cachedToken !== fcmToken) {
      try {
        console.log('[FCM] registering token to server...');
        await pushApi.registerToken(fcmToken);
        localStorage.setItem('fcmToken', fcmToken);
        console.log('[FCM] 서버에 토큰 등록 완료');
      } catch (e) {
        console.error('[FCM] 서버에 토큰 등록 실패', e);
        // 서버 장애 시에도 onMessage는 동작해야 하므로 초기화는 완료 처리
      }
    } else {
      console.log('[FCM] token unchanged (cached)');
    }

    initDone = true;
    initStarted = false;
    console.log('[FCM] initFCM(): done');

    // --- Token rotation check & sync ---
    async function checkAndSyncFcmToken() {
      try {
        if (Notification.permission !== 'granted') return;
        const vapidKey = import.meta.env.VITE_FIREBASE_MESSAGING_VAPID_KEY;
        if (!vapidKey) return;

        const latestToken = await getToken(cachedMessaging || messaging, {
          vapidKey,
          serviceWorkerRegistration: swReg,
        });
        if (!latestToken) return;

        const cached = localStorage.getItem('fcmToken');
        if (cached !== latestToken) {
          try {
            await pushApi.registerToken(latestToken);
            localStorage.setItem('fcmToken', latestToken);
            console.log('[FCM] 토큰 로테이션 감지 → 서버 갱신 완료');
          } catch (e) {
            console.error('[FCM] 토큰 로테이션 서버 갱신 실패', e);
          }
        }
      } catch (e) {
        console.warn('[FCM] 토큰 로테이션 체크 실패', e);
      }
    }

    // 1) Tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkAndSyncFcmToken();
      }
    });

    // 2) Service worker controller changes (update/replace)
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        checkAndSyncFcmToken();
      });
    }

    // 3) Logout cleanup (client delete + server delete + local cache)
    async function cleanupFcmOnLogout() {
      try {
        const token = localStorage.getItem('fcmToken');
        const messagingInstance = cachedMessaging || (await getMessagingIfSupported());

        if (messagingInstance && token) {
          try {
            await deleteToken(messagingInstance);
          } catch (_) {}
        }

        if (token) {
          try {
            await pushApi.deleteToken(token);
          } catch (_) {}
          localStorage.removeItem('fcmToken');
        }
        console.log('[FCM] 로그아웃 처리: 토큰 정리 완료');
      } catch (err) {
        console.warn('[FCM] 로그아웃 처리 중 오류', err);
      }
    }

    // Global event hook
    window.addEventListener('app:logout', () => {
      cleanupFcmOnLogout();
    });
  } catch (e) {
    initStarted = false;
    console.error('[FCM] 초기화 실패:', e);
  }
}
