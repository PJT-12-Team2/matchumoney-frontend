<template>
    <div class="chatbot-container">
      <button class="chat-toggle" @click="toggleChat" :class="{blurred: isOpen}">
        <img src="@/assets/chatbot_images/chatbot.png" alt="챗봇 버튼" />
        <div class="chat-label">챗봇</div>
      </button>
      <transition name="chat-fade">
        <div class="chat-window" v-if="isOpen">
          <div class="chat-header">
            <span class="chat-title">
              <img src="@/assets/chatbot_images/mini-chatbot.png" class="icon" />
              맞추머니 챗봇
            </span>
          </div>
  
          <div class="chat-body">
            <transition name="fade-up">
              <div v-if="showGreeting" class="message bot">
                안녕하세요. 맞추머니 AI 챗봇이에요.<br />
                무엇을 도와드릴까요?
              </div>
            </transition>
  
            <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
              <span v-if="msg.role === 'loading'" class="dots">
                <span>.</span><span>.</span><span>.</span>
              </span>
              <span v-else>
                {{ msg.content }}
              </span>
            </div>
  
            <div class="quick-buttons">
              <transition-group name="fade-up" tag="div">
                <button
                v-for="(btn, i) in visibleButtons"
                :key="btn"
                class="quick-btn"
                @click="handleQuickButtonClick(i)"
                >
                  {{ btn }}
                </button>
              </transition-group>
            </div>
          </div>
  
          <div class="chat-input">
            <input
              v-model="input"
              @keyup.enter="sendMessage"
              placeholder="궁금한 내용을 입력해주세요."
            />
            <button @click="sendMessage">
              <img src="@/assets/chatbot_images/send-button.png" alt="전송" />
            </button>
          </div>
        </div>
      </transition>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import axios from 'axios'
  
  const isOpen = ref(false)
  const input = ref('')
  const showGreeting = ref(false)
  const allButtons = [
    '서비스 이용방법',
    '금융 용어 물어보기',
    '페르소나 유형 설명',
    '카드 추천받기',
    '예적금 추천받기',
  ]
  const visibleButtons = ref([])
  const messages = ref([])
  const isLoading = ref(false)
  
  const toggleChat = () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      showGreeting.value = false
      visibleButtons.value = []
      messages.value = []
  
      setTimeout(() => {
        showGreeting.value = true
      }, 500)
  
      allButtons.forEach((btn, i) => {
        setTimeout(() => {
          visibleButtons.value.push(btn)
        }, 1500 + i * 300)
      })
    }
  }
  
  const sendToGPT = async (text) => {
    try {
      const res = await axios.post('/api/chatbot', {
        message: text,
      })
      return res.data.reply
    } catch (err) {
      console.error(err)
      return '⚠️ 서버 오류가 발생했습니다.'
    }
  }
  
  const typeMessage = async (text, role = 'bot') => {
    const delay = 30 // typing speed (ms)
    let typedText = ''
    for (let i = 0; i < text.length; i++) {
      typedText += text[i]
      messages.value[messages.value.length - 1].content = typedText
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  const sendMessage = async () => {
    if (!input.value.trim()) return
    const userText = input.value
    messages.value.push({ role: 'user', content: userText })
    input.value = ''
  
    isLoading.value = true
    messages.value.push({ role: 'loading', content: '...' })
    const botReply = await sendToGPT(userText)
    messages.value.pop() // remove loading
    messages.value.push({ role: 'bot', content: '' })
    await typeMessage(botReply)
    isLoading.value = false
  }
  
  const handleQuickButtonClick = async (index) => {
    const selectedText = visibleButtons.value[index]
    messages.value.push({ role: 'user', content: selectedText })
  
    isLoading.value = true
    messages.value.push({ role: 'loading', content: '...' })
    const botReply = await sendToGPT(selectedText)
    messages.value.pop()
    messages.value.push({ role: 'bot', content: '' })
    await typeMessage(botReply)
    isLoading.value = false
  }
  </script>
  
  <style scoped>
  .chatbot-container {
    position: fixed;
    bottom: 35px;
    right: 35px;
    z-index: 10000;
  }
  
  .chat-toggle {
    background: #A0C28D;
    color: white;
    border: none;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: transform 0.3s ease;
    padding: 0;
  }
  
  .chat-toggle:hover {
    transform: scale(1.1);
  }
  
  .chat-toggle img {
    width: 40px;
    height: 40px;
    display: block;
    margin: 0 auto;
  }
  
  .chat-label {
    font-size: 12px;
    color: white;
    text-align: center;
  }

  /* Responsive styles for chatbot toggle button */
  @media (max-width: 768px) {
    .chat-toggle {
      width: 64px;
      height: 64px;
    }

    .chat-toggle img {
      width: 30px;
      height: 30px;
    }

    .chat-label {
      font-size: 11px;
    }
  }

  @media (max-width: 480px) {
    .chat-toggle {
      width: 56px;
      height: 56px;
    }

    .chat-toggle img {
      width: 26px;
      height: 26px;
    }

    .chat-label {
      font-size: 10px;
    }
  }
  
  .chat-window {
    width: 360px;
    height: 550px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: absolute;
    bottom: calc(80px + 20px);
    right: 20px;
    font-family: 'Pretendard', sans-serif;
    animation: slideUp 0.4s ease;
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .fade-up-enter-active,
  .fade-up-leave-active {
    transition: all 0.4s ease;
  }
  .fade-up-enter-from {
    opacity: 0;
    transform: translateY(20px);
  }
  .fade-up-enter-to {
    opacity: 1;
    transform: translateY(0);
  }
  
  .chat-header {
    background: #fff;
    padding: 12px;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
    text-align: center;
  }
  
  .chat-title {
    font-size: 18px;
  }
  
  .chat-title .icon {
    width: 18px;
    height: 18px;
    vertical-align: middle;
    margin-right: 4px;
  }
  
  .chat-body {
    padding: 12px;
    flex: 1;
    overflow-y: auto;
  }
  
  .message.bot {
    position: relative;
    background: #E0F2C2;
    padding: 8px 12px;
    border-radius: 16px;
    border-bottom-left-radius: 4px;
    margin-bottom: 12px;
    width: fit-content;
    max-width: 80%;
    font-size: 14px;
    color: #000;
    text-align: left;
  }
  
  .message.user {
    margin-left: auto;
    background: #E3E8EB;
    padding: 8px 12px;
    border-radius: 16px;
    border-bottom-right-radius: 4px;
    margin-bottom: 12px;
    width: fit-content;
    max-width: 80%;
    font-size: 14px;
    color: #000;
    text-align: left;
  }

  .message.loading {
    background: #E0F2C2;
    padding: 8px 12px;
    border-radius: 16px;
    border-bottom-left-radius: 4px;
    margin-bottom: 12px;
    width: fit-content;
    max-width: 80%;
    font-size: 14px;
    color: #000;
    text-align: left;
  }

  .dots span {
    animation: blink 1.5s infinite;
    animation-delay: calc(var(--i) * 0.2s);
    font-weight: bold;
    font-size: 16px;
    display: inline-block;
  }

  .dots span:nth-child(1) { --i: 0; }
  .dots span:nth-child(2) { --i: 1; }
  .dots span:nth-child(3) { --i: 2; }

  @keyframes blink {
    0%, 80%, 100% { opacity: 0; }
    40% { opacity: 1; }
  }
  
  .quick-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .quick-btn {
    padding: 5px 12px;
    border: 1px solid #A0C28D;
    border-radius: 16px;
    background: white;
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
  }
  
  .quick-btn.selected {
    background: #A0C28D;
    color: white;
    border-color: #A0C28D;
  }
  
  .chat-input {
    display: flex;
    align-items: center;
    border-top: 1px solid #eee;
    padding: 12px;
    background-color: #fff;
  }
  
  .chat-input input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #ccc;
    border-radius: 25px;
    font-size: 14px;
    outline: none;
    margin-right: 8px;
    margin-left: 4px;
  }
  
  .chat-input input::placeholder {
    color: #888;
  }
  
  .chat-input input:focus {
    border-color: #A0C28D;
  }
  
  .chat-input button {
    background: none;
    border: none;
    margin-left: 0px;
    cursor: pointer;
    padding: 0;
  }
  
  .chat-input button img {
    width: 20px;
    height: 20px;
  }
  
  .blurred {
    opacity: 0.5;
  }
  .quick-btn:active {
  background: #A0C28D;
  color: white;
  border-color: #A0C28D;
}
  </style>