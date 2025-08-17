<template>
  <div class="fortune-page">
    <div class="hero">
      <div class="hero-inner">
        <div class="orb" aria-hidden="true"></div>
        <h1 class="title">🔮 오늘의 운세</h1>
        <p class="subtitle">
          생년월일·태어난 시간·성별을 입력하면 맞추머니가 오늘의 흐름을 가볍고
          즐겁게 알려줘요.
        </p>
      </div>
    </div>

    <div class="content">
      <!-- 입력 카드 -->
      <form class="card form-card" @submit.prevent="handleSubmit" novalidate>
        <div class="grid">
          <div class="field">
            <label for="name">이름 (선택)</label>
            <input
              id="name"
              v-model.trim="form.name"
              type="text"
              placeholder="이름을 입력하세요"
            />
          </div>

          <div class="field">
            <label for="birthDate">생년월일 <span class="req">*</span></label>
            <input
              id="birthDate"
              v-model="form.birthDate"
              type="date"
              required
            />
            <p v-if="touched.birthDate && !form.birthDate" class="error">
              생년월일을 입력해 주세요.
            </p>
          </div>

          <div class="field">
            <label for="birthTime">태어난 시간 <small>(선택)</small></label>
            <div class="time-row">
              <input
                id="birthTime"
                v-model="form.birthTime"
                type="time"
                :disabled="form.timeUnknown"
              />
              <label class="chk">
                <input type="checkbox" v-model="form.timeUnknown" />
                시간을 모르겠어요
              </label>
            </div>
          </div>

          <div class="field gender">
            <span class="label">성별 <span class="req">*</span></span>
            <div class="segmented">
              <label :class="['seg', form.gender === 'MALE' && 'active']">
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  v-model="form.gender"
                />남성
              </label>
              <label :class="['seg', form.gender === 'FEMALE' && 'active']">
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  v-model="form.gender"
                />여성
              </label>
              <label :class="['seg', form.gender === 'OTHER' && 'active']">
                <input
                  type="radio"
                  name="gender"
                  value="OTHER"
                  v-model="form.gender"
                />기타
              </label>
            </div>
            <p v-if="touched.gender && !form.gender" class="error">
              성별을 선택해 주세요.
            </p>
          </div>
        </div>

        <div class="actions">
          <button class="btn primary" type="submit" :disabled="isLoading">
            <span v-if="!isLoading">오늘의 운세 보기</span>
            <span v-else class="spinner small"></span>
          </button>
          <button
            class="btn ghost"
            type="button"
            @click="resetForm"
            :disabled="isLoading"
          >
            초기화
          </button>
        </div>
      </form>

      <!-- 결과 카드 -->
      <div v-if="resultText || isLoading" class="card result-card">
        <div class="result-header">
          <img
            class="bot-avatar"
            src="@/assets/chatbot_images/chatbot_cat.png"
            alt="맞추머니"
          />
          <div class="meta">
            <div class="name">맞추머니 챗봇</div>
            <div class="desc">오늘의 운세 리포트</div>
          </div>
        </div>

        <div class="result-body">
          <div v-if="isLoading" class="loading-wrap">
            <div class="spinner"></div>
            <p>운세를 살펴보고 있어요…</p>
          </div>

          <div v-else class="bubble" v-html="formatted(resultText)"></div>
        </div>

        <div class="result-actions" v-if="!isLoading && resultText">
          <button class="btn secondary tiny" @click="copyToClipboard">
            복사하기
          </button>
          <button class="btn tiny" @click="seeAgain">다시 보기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const form = ref({
  name: '',
  birthDate: '', // YYYY-MM-DD
  birthTime: '', // HH:MM
  timeUnknown: false,
  gender: '', // MALE | FEMALE | OTHER
});

const touched = ref({ birthDate: false, gender: false });
const isLoading = ref(false);
const resultText = ref('');

const resetForm = () => {
  form.value = {
    name: '',
    birthDate: '',
    birthTime: '',
    timeUnknown: false,
    gender: '',
  };
  touched.value = { birthDate: false, gender: false };
  resultText.value = '';
};

const handleSubmit = async () => {
  touched.value.birthDate = true;
  touched.value.gender = true;
  if (!form.value.birthDate || !form.value.gender) return;

  const { name, birthDate, birthTime, timeUnknown, gender } = form.value;
  const prettyTime = timeUnknown || !birthTime ? '모름' : birthTime;

  const userLine = [
    name ? `이름: ${name}` : null,
    `생년월일: ${birthDate}`,
    `태어난 시간: ${prettyTime}`,
    `성별: ${gender}`,
  ]
    .filter(Boolean)
    .join(' | ');

  const systemPrompt = `너는 친절한 운세 도우미야. 과장/불안 조장 없이 가볍고 즐겁게 오늘의 흐름을 알려줘. 형식은 다음을 지켜줘:\n1) \u26a1 총평 (한 문장)\n2) \uD83D\uDD25 포인트 3가지 (번호목록)\n3) \uD83D\uDCDD 조언 (짧은 한 문장)\n- 미신을 사실처럼 단정하지 말고, 심리적/실천적 조언 위주로.\n- 존댓말, 6줄 내.`;

  const message = `다음 사용자의 오늘  운세를 간단히 요약해줘.\n${userLine}`;

  try {
    isLoading.value = true;
    resultText.value = '';
    const res = await axios.post('/api/chatbot', { message, systemPrompt });
    resultText.value =
      (res?.data?.reply || '').trim() ||
      '운세를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.';
  } catch (e) {
    console.error(e);
    resultText.value = '서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';
  } finally {
    isLoading.value = false;
  }
};

const formatted = (text) => {
  if (!text) return '';
  if (/<[a-z][\s\S]*>/i.test(text)) return text; // HTML이면 그대로
  return text.replace(/\n/g, '<br />');
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(resultText.value);
    alert('운세 내용을 복사했어요.');
  } catch (_) {
    alert('복사에 실패했어요.');
  }
};

const seeAgain = () => {
  resultText.value = '';
};
</script>

<style scoped>
/* 레이아웃 */
.fortune-page {
  min-height: 100%;
  background: radial-gradient(
      1200px 600px at 80% -10%,
      rgba(175, 199, 255, 0.25),
      transparent 60%
    ),
    radial-gradient(
      1000px 500px at -10% 10%,
      rgba(255, 204, 229, 0.25),
      transparent 55%
    ),
    var(--bg-body, #f7f9fc);
  color: var(--text-primary, #111827);
}

.hero {
  padding: 44px 16px 8px;
  text-align: center;
  position: relative;
}
.hero-inner {
  max-width: 880px;
  margin: 0 auto;
  position: relative;
}
.orb {
  position: absolute;
  inset: -40px auto auto 50%;
  width: 220px;
  height: 220px;
  transform: translateX(-50%);
  border-radius: 50%;
  filter: blur(24px);
  background: conic-gradient(
    from 120deg,
    rgba(91, 140, 255, 0.22),
    rgba(255, 160, 200, 0.22),
    rgba(91, 140, 255, 0.22)
  );
  opacity: 0.9;
  pointer-events: none;
}
.title {
  font-size: 32px;
  font-weight: 900;
  margin: 0;
}
.subtitle {
  margin-top: 10px;
  color: var(--text-secondary, #6b7280);
}

.content {
  max-width: 960px;
  margin: 18px auto 48px;
  padding: 0 16px;
  display: grid;
  gap: 16px;
  grid-template-columns: 1.1fr 1fr;
}
@media (max-width: 980px) {
  .content {
    grid-template-columns: 1fr;
  }
}

.card {
  background: #fff;
  border: 1px solid var(--border-light, #e5e7eb);
  border-radius: 16px;
  box-shadow: 0 10px 26px rgba(16, 24, 40, 0.06);
}

.form-card {
  padding: 20px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 20px;
}
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
}
.field label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary, #6b7280);
  margin-bottom: 8px;
}
.field input[type='text'],
.field input[type='date'],
.field input[type='time'] {
  height: 44px;
  border: 1px solid var(--border-light, #e5e7eb);
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  background: #fff;
}
.field input:focus {
  outline: none;
  border-color: var(--color-accent, #5b8cff);
  box-shadow: 0 0 0 3px rgba(91, 140, 255, 0.15);
}
.req {
  color: #ef4444;
}
.error {
  margin-top: 6px;
  font-size: 12px;
  color: #ef4444;
}

.time-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
}
.chk {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary, #6b7280);
}

.gender .label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary, #6b7280);
  margin-bottom: 8px;
  display: block;
}
.segmented {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.seg {
  border: 1px solid var(--border-light, #e5e7eb);
  border-radius: 12px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #374151;
  background: #fff;
  cursor: pointer;
}
.seg input {
  display: none;
}
.seg.active {
  border-color: var(--color-accent, #5b8cff);
  box-shadow: 0 0 0 3px rgba(91, 140, 255, 0.15);
  color: var(--color-accent, #5b8cff);
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 6px;
}
.btn {
  height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.btn.primary {
  background: var(--color-accent, #5b8cff);
  color: #fff;
  box-shadow: 0 6px 14px rgba(91, 140, 255, 0.25);
}
.btn.ghost {
  background: #fff;
  border-color: var(--border-light, #e5e7eb);
  color: var(--text-primary, #111827);
}
.btn.secondary {
  background: #fff;
  border-color: var(--color-accent, #5b8cff);
  color: var(--color-accent, #5b8cff);
}
.btn.tiny {
  height: 36px;
  padding: 0 12px;
  font-size: 13px;
  border-radius: 8px;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.spinner {
  width: 22px;
  height: 22px;
  border: 3px solid #e5edff;
  border-top: 3px solid var(--color-accent, #5b8cff);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
.spinner.small {
  width: 18px;
  height: 18px;
  border-width: 2px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 결과 카드 */
.result-card {
  padding: 18px;
}
.result-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-light, #e5e7eb);
}
.bot-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #cfe5a2;
  background: #fff;
}
.meta .name {
  font-weight: 900;
}
.meta .desc {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
}

.result-body {
  padding: 12px 2px;
}
.loading-wrap {
  display: grid;
  place-items: center;
  gap: 10px;
  padding: 24px 0;
  color: var(--text-secondary, #6b7280);
}
.bubble {
  background: #f6fbff;
  border: 1px solid #e6f0ff;
  border-radius: 16px;
  padding: 14px 16px;
  color: #111827;
  line-height: 1.6;
}

.result-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 8px;
}
</style>
