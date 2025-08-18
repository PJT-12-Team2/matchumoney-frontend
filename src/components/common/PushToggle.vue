<template>
  <div>
    <div class="push-toggle">
      <div class="left">
        <span class="label">푸쉬 알림</span>
      </div>
      <div class="right">
        <label class="switch" :aria-checked="subscribed" role="switch">
          <input type="checkbox" :checked="subscribed" :disabled="!envReady || loading" @change="onToggle" />
          <span class="slider"></span>
        </label>
        <span class="switch-text" :class="{ on: subscribed, off: !subscribed }">
          {{ subscribed ? 'ON' : 'OFF' }}
        </span>
      </div>
    </div>

    <p v-if="!envReady" class="hint">
      이 브라우저/프로토콜에서는 푸쉬 알림이 지원되지 않습니다. (localhost 또는 HTTPS 필요)
    </p>
    <p v-else-if="permission === 'denied'" class="hint">
      알림 권한이 차단되어 있습니다. 브라우저 설정에서 권한을 허용해 주세요.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getToken, deleteToken } from 'firebase/messaging';
import { getMessagingIfSupported } from '@/firebase/firebaseClient';
import pushApi from '@/api/push';
import { showToast } from '@/util/toast';
import { getMessagingIfSupported } from '@/firebase/firebaseClient';

window.addEventListener('app:login', async () => {
  try {
    const existing = localStorage.getItem('fcmToken');
    if (existing) {
      console.log('[FCM] existing token present (skip auto-subscribe)');
      return;
    }
    if (Notification.permission === 'denied') {
      showToast({
        title: '알림',
        message: '브라우저 알림 권한이 차단되어 있어 자동 활성화를 건너뜁니다.',
        type: 'warning',
      });
      return;
    }
    // Let PushToggle handle UX normally; this is just a safety net to ensure a token exists
    const messaging = await getMessagingIfSupported();
    if (!messaging) return;
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const vapidKey = import.meta.env.VITE_FIREBASE_MESSAGING_VAPID_KEY;
    if (!vapidKey) return;
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: reg });
    if (token) {
      localStorage.setItem('fcmToken', token);
      showToast({ title: '알림', message: '로그인 완료: 푸쉬 알림이 자동 활성화되었습니다.', type: 'success' });
    }
  } catch (e) {
    console.log('[FCM] auto-subscribe failed', e);
  }
});

const loading = ref(false);
const subscribed = ref(!!localStorage.getItem('fcmToken'));
const permission = ref(Notification?.permission || 'default');
const envReady = ref(false);
let messagingInstance = null;

const statusText = computed(() => {
  if (!envReady.value) return '미지원';
  if (permission.value === 'denied') return '권한 차단';
  return subscribed.value ? '구독 중' : '미구독';
});

const badgeClass = computed(() => {
  if (!envReady.value) return 'badge-error';
  if (permission.value === 'denied') return 'badge-warning';
  return subscribed.value ? 'badge-success' : 'badge-accent';
});

onMounted(async () => {
  const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const isHttps = location.protocol === 'https:';
  envReady.value = (isLocalhost || isHttps) && 'serviceWorker' in navigator;
  if (!envReady.value) return;

  messagingInstance = await getMessagingIfSupported();
  permission.value = Notification.permission;
});

async function ensureSW() {
  return await navigator.serviceWorker.register('/firebase-messaging-sw.js');
}

async function subscribe() {
  if (!envReady.value) return;
  try {
    loading.value = true;
    const swReg = await ensureSW();
    console.log('[PushToggle] SW registered', swReg);

    const perm = await Notification.requestPermission();
    permission.value = perm;
    console.log('[PushToggle] permission =', perm);
    if (perm !== 'granted') {
      showToast({ title: '알림', message: '알림 권한이 허용되지 않았습니다.', type: 'warning' });
      return;
    }

    if (!messagingInstance) {
      messagingInstance = await getMessagingIfSupported();
      if (!messagingInstance) {
        showToast({ title: '알림', message: '이 환경에서는 메시징이 지원되지 않습니다.', type: 'danger' });
        return;
      }
    }
    console.log('[PushToggle] messaging ready =', !!messagingInstance);

    const vapidKey = import.meta.env.VITE_FIREBASE_MESSAGING_VAPID_KEY;
    console.log('[PushToggle] has vapidKey =', !!vapidKey);
    if (!vapidKey) {
      showToast({ title: '설정 필요', message: 'VAPID 공개키가 설정되지 않았습니다.', type: 'warning' });
      return;
    }

    const token = await getToken(messagingInstance, {
      vapidKey,
      serviceWorkerRegistration: swReg,
    });
    console.log('[PushToggle] issued token =', token ? token.slice(0, 16) + '...' : null);

    if (!token) {
      showToast({ title: '실패', message: 'FCM 토큰 발급에 실패했습니다.', type: 'danger' });
      return;
    }

    const cached = localStorage.getItem('fcmToken');
    if (cached !== token) {
      await pushApi.registerToken(token);
      localStorage.setItem('fcmToken', token);
    }
    if (cached === token) {
      console.log('[PushToggle] token unchanged; already subscribed');
    }

    subscribed.value = true;
    toastSuccess('푸쉬 알림이 활성화되었습니다.');
  } catch (e) {
    console.error('[PushToggle] subscribe error:', e);
    showToast({ title: '오류', message: '구독 중 오류가 발생했습니다.', type: 'danger' });
  } finally {
    loading.value = false;
  }
}

async function unsubscribe() {
  if (!envReady.value) return;
  try {
    loading.value = true;
    if (!messagingInstance) {
      messagingInstance = await getMessagingIfSupported();
    }
    const token = localStorage.getItem('fcmToken');

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
    console.log('[PushToggle] token removed (client/server/local)');

    subscribed.value = false;
    toastInfo('푸쉬 알림을 해제했습니다.');
  } catch (e) {
    console.error('[PushToggle] unsubscribe error:', e);
    showToast({ title: '오류', message: '해제 중 오류가 발생했습니다.', type: 'danger' });
  } finally {
    loading.value = false;
  }
}

function toastInfo(msg) {
  try {
    showToast({ title: '알림', message: msg, type: 'info' });
  } catch (_) {
    console.log('[Toast/info]', msg);
  }
}
function toastSuccess(msg) {
  try {
    showToast({ title: '완료', message: msg, type: 'success' });
  } catch (_) {
    console.log('[Toast/success]', msg);
  }
}

function onToggle(e) {
  console.log(
    '[PushToggle] onToggle change=',
    e?.target?.checked,
    'subscribed=',
    subscribed.value,
    'envReady=',
    envReady.value
  );
  const next = e?.target?.checked;
  if (!envReady.value) {
    toastInfo('이 환경에서는 푸쉬 알림이 지원되지 않아요. (HTTPS/localhost 필요)');
    return;
  }
  if (next === undefined || !envReady.value) return;
  if (next && !subscribed.value) {
    subscribe();
  } else if (!next && subscribed.value) {
    unsubscribe();
  }
}
</script>

<style scoped>
.push-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-card);
}
.left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.right {
  display: flex;
  align-items: center;
}
.label {
  color: var(--text-primary);
}

/* Badges (use app palette) */
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
}
.badge-success {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
}
.badge-warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning-dark);
}
.badge-error {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
}
.badge-accent {
  background-color: var(--color-accent-20);
  color: var(--color-dark);
}

/* ===== Toggle Switch ===== */
.switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 30px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--color-gray-300);
  border-radius: 999px;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  box-shadow: inset 0 0 0 2px var(--color-gray-400);
}
.slider::before {
  content: '';
  position: absolute;
  height: 24px;
  width: 24px;
  left: 3px;
  top: 3px;
  background: var(--color-white);
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.slider::after {
  content: '🔕';
  position: absolute;
  top: 50%;
  left: 8px;
  transform: translateY(-50%);
  font-size: 14px;
  transition: opacity 0.2s ease;
}
.switch input:checked + .slider {
  background: var(--color-accent);
  box-shadow: inset 0 0 0 2px var(--color-accent);
}
.switch input:checked + .slider::before {
  transform: translateX(22px);
}
.switch input:checked + .slider::after {
  content: '🔔';
  left: auto;
  right: 8px;
}
.switch input:disabled + .slider {
  opacity: 0.6;
  cursor: not-allowed;
}
.switch-text {
  margin-left: var(--spacing-sm);
  font-weight: 600;
  color: var(--text-secondary);
}
.switch-text.on {
  color: var(--color-accent);
}
.switch-text.off {
  color: var(--color-gray-500);
}

.hint {
  margin-top: var(--spacing-sm);
  font-size: 0.9rem;
  color: var(--text-secondary);
}
</style>
