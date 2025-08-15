<template>
  <div>
    <div class="push-toggle">
      <div class="left">
        <span class="label">푸시 알림</span>
      </div>
      <div class="right">
        <button
          :class="['btn btn-outline-accent', { selected: subscribed }]"
          :disabled="!envReady || loading || subscribed"
          @click="subscribe">
          {{ loading && !subscribed ? 'ON' : 'ON' }}
        </button>
        <button
          :class="['btn btn-outline-secondary ms-2', { selected: !subscribed && envReady && permission !== 'denied' }]"
          :disabled="!envReady || loading || !subscribed"
          @click="unsubscribe">
          {{ loading && subscribed ? 'OFF' : 'OFF' }}
        </button>
      </div>
    </div>

    <p v-if="!envReady" class="hint">
      이 브라우저/프로토콜에서는 푸시 알림이 지원되지 않습니다. (localhost 또는 HTTPS 필요)
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

    const perm = await Notification.requestPermission();
    permission.value = perm;
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

    const vapidKey = import.meta.env.VITE_FIREBASE_MESSAGING_VAPID_KEY;
    if (!vapidKey) {
      showToast({ title: '설정 필요', message: 'VAPID 공개키가 설정되지 않았습니다.', type: 'warning' });
      return;
    }

    const token = await getToken(messagingInstance, {
      vapidKey,
      serviceWorkerRegistration: swReg,
    });

    if (!token) {
      showToast({ title: '실패', message: 'FCM 토큰 발급에 실패했습니다.', type: 'danger' });
      return;
    }

    const cached = localStorage.getItem('fcmToken');
    if (cached !== token) {
      await pushApi.registerToken(token);
      localStorage.setItem('fcmToken', token);
    }

    subscribed.value = true;
    showToast({ title: '완료', message: '웹 푸시 알림이 활성화되었습니다.', type: 'success' });
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

    subscribed.value = false;
    showToast({ title: '완료', message: '웹 푸시 알림을 해제했습니다.', type: 'info' });
  } catch (e) {
    console.error('[PushToggle] unsubscribe error:', e);
    showToast({ title: '오류', message: '해제 중 오류가 발생했습니다.', type: 'danger' });
  } finally {
    loading.value = false;
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

/* Button variant to match brand accent */
.btn-outline-accent {
  background-color: transparent;
  color: var(--color-accent);
  border: 2px solid var(--color-accent);
}
.btn-outline-accent:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-outline-accent:hover:not(:disabled) {
  background-color: var(--color-accent);
  color: var(--color-white);
}

.btn.selected {
  background-color: var(--color-accent);
  color: var(--color-white);
  border-color: var(--color-accent);
}
.btn-outline-secondary.selected {
  background-color: var(--color-secondary);
  color: var(--color-white);
  border-color: var(--color-secondary);
}

.hint {
  margin-top: var(--spacing-sm);
  font-size: 0.9rem;
  color: var(--text-secondary);
}
</style>
