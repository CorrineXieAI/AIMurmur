// 對話歷史記錄
let conversationHistory = []; // 改為單一陣列，所有衛教項目共用

// 當前選擇的衛教項目
let currentEducationType = null;

// 當前語言設定
let currentLanguage = 'zh';

// 多語言回應內容
const multilingualResponses = {
    surgery: {
        zh: '手術是一個嚴謹的醫療程序，我們會確保您的安全。您想了解手術的哪些具體方面？例如：手術時間、恢復期、注意事項等。',
        en: 'Surgery is a rigorous medical procedure, and we will ensure your safety. What specific aspects of the surgery would you like to know about? For example: surgery duration, recovery period, precautions, etc.',
        tw: '手術是一個真嚴謹的醫療程序，阮會確保您的安全。您想欲了解手術的啥物具體方面？親像：手術時間、恢復期、注意事項等等。'
    },
    anesthesia: {
        zh: '麻醉是手術的重要環節，我們會根據您的情況選擇最適合的麻醉方式。您對麻醉有什麼特別的疑慮嗎？例如：麻醉風險、術後恢復等。',
        en: 'Anesthesia is a crucial part of the surgery. We will choose the most suitable anesthesia method based on your condition. Do you have any specific concerns about anesthesia? For example: anesthesia risks, post-operative recovery, etc.',
        tw: '麻醉是手術的重要環節，阮會根據您的情況選擇上適合的麻醉方式。您對麻醉有啥物特別的疑慮？親像：麻醉風險、術後恢復等等。'
    },
    risk: {
        zh: '每個手術都有其特定的風險，我們會詳細為您說明。您想了解哪些具體的風險？例如：出血、感染、併發症等。',
        en: 'Each surgery has its specific risks, which we will explain in detail. What specific risks would you like to know about? For example: bleeding, infection, complications, etc.',
        tw: '逐個手術攏有伊特定的風險，阮會詳細為您說明。您想欲了解啥物具體的風險？親像：出血、感染、併發症等等。'
    },
    cost: {
        zh: '費用會根據手術類型和使用的材料而有所不同。您想了解具體的費用明細嗎？我們可以為您詳細說明健保給付和自費項目。',
        en: 'The cost varies depending on the type of surgery and materials used. Would you like to know the specific cost details? We can explain the NHI coverage and self-pay items in detail.',
        tw: '費用會根據手術類型和使用的材料而有所不同。您想欲了解具體的費用明細？阮會為您詳細說明健保給付和自費項目。'
    }
};

// 身分證驗證函數
function verifyIdentity() {
    const idNumber = document.getElementById('idNumber').value;
    
    // 簡單的身分證字號驗證（實際應用中應該使用更嚴格的驗證）
    const idPattern = /^[A-Z][12]\d{8}$/;
    
    if (!idPattern.test(idNumber)) {
        alert('請輸入有效的身分證字號');
        return;
    }
    
    // 切換到主要功能區域
    document.getElementById('loginSection').classList.remove('active');
    document.getElementById('mainSection').classList.add('active');
}

// 衛教內容資料
const educationContent = {
    surgery: {
        title: '手術同意書說明',
        content: '親愛的病患您好，我是您的AI衛教助手。手術同意書是重要的醫療文件，它說明了手術的風險、預期效果和可能的併發症。在簽署之前，請確保您完全理解手術的內容和風險。如果您有任何疑問，請隨時向醫護人員詢問。'
    },
    selfPay: {
        title: '自費同意書說明',
        content: '自費同意書說明了您需要自費的醫療項目和費用。這些項目可能包括特殊材料、新技術或不在健保給付範圍內的治療。請仔細閱讀費用明細，如有任何疑問，我們的醫療團隊很樂意為您解答。'
    },
    anesthesia: {
        title: '麻醉同意書說明',
        content: '麻醉同意書詳細說明了麻醉的方式、風險和注意事項。麻醉是手術過程中的重要環節，我們會根據您的情況選擇最適合的麻醉方式。請告知我們您的過敏史和特殊病史，以確保麻醉安全。'
    },
    precautions: {
        title: '手術注意事項',
        content: '手術前請注意：1. 手術前8小時禁食 2. 請勿化妝或塗抹指甲油 3. 請移除所有飾品 4. 穿著寬鬆衣物 5. 請準時到達醫院。手術後請注意：1. 按時服用藥物 2. 保持傷口清潔 3. 避免劇烈運動 4. 定期回診追蹤。'
    }
};

// 顯示衛教內容
function showEducation(type) {
    console.log('showEducation called with type:', type);
    
    const modal = document.getElementById('educationModal');
    if (!modal) {
        console.error('Modal element not found!');
        return;
    }
    
    const content = educationContent[type];
    if (!content) {
        console.error('Content not found for type:', type);
        return;
    }
    
    currentEducationType = type;
    
    // 清空對話框內容
    const educationContentDiv = document.getElementById('educationContent');
    if (!educationContentDiv) {
        console.error('Education content div not found!');
        return;
    }
    
    educationContentDiv.innerHTML = '';
    
    // 設置對話框標題
    const modalTitle = document.createElement('h3');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = content.title;
    educationContentDiv.appendChild(modalTitle);
    
    // 如果是第一次顯示該衛教項目，添加初始AI回應並保存到歷史記錄
    const hasInitialMessage = conversationHistory.some(msg => 
        msg.type === 'ai' && msg.content === content.content
    );
    
    if (!hasInitialMessage) {
        conversationHistory.push({
            type: 'ai',
            content: content.content,
            educationType: type
        });
    }
    
    // 顯示所有歷史對話
    conversationHistory.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = msg.type === 'user' ? 'user-response' : 'ai-response';
        messageDiv.innerHTML = `
            <div class="${msg.type === 'user' ? 'user-avatar' : 'ai-avatar'}">
                <i class="fas fa-${msg.type === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="${msg.type === 'user' ? 'user-message' : 'message-content'}">
                <p>${msg.content}</p>
            </div>
        `;
        educationContentDiv.appendChild(messageDiv);
    });
    
    // 顯示對話框
    modal.style.display = 'block';
    console.log('Modal display set to block');
    
    // 自動播放最新消息
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    if (lastMessage) {
        speakText(lastMessage.content);
    }
    
    // 滾動到最新消息
    educationContentDiv.scrollTop = educationContentDiv.scrollHeight;

    // 重新綁定輸入框事件
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                const input = this.value;
                this.value = ''; // 清空輸入框
                processUserInput(input);
            }
        });
    }
}

// 關閉對話框
function closeModal() {
    console.log('closeModal called'); // 調試日誌
    const modal = document.getElementById('educationModal');
    if (modal) {
        modal.style.display = 'none';
        // 停止語音播放
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }
}

// 語音播放功能
let isSpeaking = false;

function toggleVoice() {
    const educationContent = document.getElementById('educationContent');
    if (!educationContent) return;

    // 獲取最後一條AI回應
    const lastAiResponse = educationContent.querySelector('.ai-response:last-child');
    if (!lastAiResponse) return;

    const text = lastAiResponse.querySelector('.message-content p')?.textContent;
    if (!text) return;

    if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
    } else {
        // 只在中文或英文模式下播放語音
        if (currentLanguage === 'zh' || currentLanguage === 'en') {
            speakText(text);
        }
    }
}

// 語音輸入功能
let recognition = null;
let isRecording = false;

function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = currentLanguage === 'en' ? 'en-US' : 'zh-TW';

        recognition.onresult = function(event) {
            const text = event.results[0][0].transcript;
            processUserInput(text);
        };

        recognition.onend = function() {
            isRecording = false;
            const voiceInputBtn = document.getElementById('voiceInputBtn');
            if (voiceInputBtn) {
                voiceInputBtn.classList.remove('recording');
            }
            const userInput = document.getElementById('userInput');
            if (userInput) {
                userInput.value = '';
            }
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            isRecording = false;
            const voiceInputBtn = document.getElementById('voiceInputBtn');
            if (voiceInputBtn) {
                voiceInputBtn.classList.remove('recording');
            }
            const errorMessage = currentLanguage === 'en' 
                ? 'Speech recognition error. Please try again or use text input.'
                : '語音識別出現問題，請重試或使用文字輸入。';
            processUserInput(errorMessage);
        };
    }
}

function toggleVoiceInput() {
    if (!recognition) {
        initSpeechRecognition();
    }

    if (isRecording) {
        recognition.stop();
    } else {
        try {
            recognition.start();
            isRecording = true;
            const voiceInputBtn = document.getElementById('voiceInputBtn');
            if (voiceInputBtn) {
                voiceInputBtn.classList.add('recording');
            }
            // 清空輸入框
            const userInput = document.getElementById('userInput');
            if (userInput) {
                userInput.value = '';
            }
        } catch (error) {
            console.error('啟動語音識別失敗:', error);
            alert('無法啟動語音識別，請檢查麥克風權限或使用文字輸入。');
        }
    }
}

// 切換語言
function changeLanguage(lang) {
    currentLanguage = lang;
    
    // 更新按鈕狀態
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(lang)) {
            btn.classList.add('active');
        }
    });
    
    // 更新語音識別語言
    if (recognition) {
        recognition.lang = lang === 'en' ? 'en-US' : 'zh-TW';
    }
    
    // 停止當前播放的語音
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    
    // 重新顯示當前對話
    if (currentEducationType) {
        showEducation(currentEducationType);
    }
}

// 修改語音合成函數
function speakText(text) {
    if (!window.speechSynthesis) {
        console.log('Speech synthesis not supported');
        return;
    }

    // 停止當前正在播放的語音
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // 根據當前語言設置語音參數
    if (currentLanguage === 'en') {
        utterance.lang = 'en-US';
        // 嘗試使用英文語音
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => voice.lang === 'en-US');
        if (englishVoice) {
            utterance.voice = englishVoice;
        }
    } else {
        utterance.lang = 'zh-TW';
        // 嘗試使用中文語音
        const voices = window.speechSynthesis.getVoices();
        const chineseVoice = voices.find(voice => voice.lang === 'zh-TW');
        if (chineseVoice) {
            utterance.voice = chineseVoice;
        }
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => {
        isSpeaking = true;
        console.log('Speech started');
    };
    
    utterance.onend = () => {
        isSpeaking = false;
        console.log('Speech ended');
    };

    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        isSpeaking = false;
    };
    
    window.speechSynthesis.speak(utterance);
}

// 修改處理用戶輸入函數
function processUserInput(input) {
    if (!currentEducationType) return;

    // 保存用戶輸入到歷史記錄
    conversationHistory.push({
        type: 'user',
        content: input,
        educationType: currentEducationType,
        language: currentLanguage
    });

    // 顯示用戶輸入
    const userResponse = document.createElement('div');
    userResponse.className = 'user-response';
    userResponse.innerHTML = `
        <div class="user-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="user-message">
            <p>${input}</p>
        </div>
    `;
    
    const educationContent = document.getElementById('educationContent');
    if (educationContent) {
        educationContent.appendChild(userResponse);
    }

    // 根據當前語言選擇回應
    let response = '';
    for (let key in multilingualResponses) {
        if (input.toLowerCase().includes(key)) {
            response = multilingualResponses[key][currentLanguage];
            break;
        }
    }

    if (!response) {
        response = currentLanguage === 'en' 
            ? "I'm sorry, I didn't fully understand your question. Please try asking in a different way or consult with medical staff. You can ask about surgery, anesthesia, risks, costs, recovery period, etc."
            : currentLanguage === 'tw'
            ? "歹勢，阮無完全了解您的問題。請您換一個方式問，抑是直接問醫護人員。您會當問手術、麻醉、風險、費用、恢復期等等。"
            : "抱歉，我沒有完全理解您的問題。請您換個方式提問，或直接詢問醫護人員。您也可以詢問關於手術、麻醉、風險、費用、恢復期等具體問題。";
    }

    // 保存AI回應到歷史記錄
    conversationHistory.push({
        type: 'ai',
        content: response,
        educationType: currentEducationType,
        language: currentLanguage
    });

    // 更新AI回應
    const aiResponse = document.createElement('div');
    aiResponse.className = 'ai-response';
    aiResponse.innerHTML = `
        <div class="ai-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p>${response}</p>
        </div>
    `;
    
    if (educationContent) {
        educationContent.appendChild(aiResponse);
    }

    // 自動播放回應
    speakText(response);

    // 滾動到最新消息
    if (educationContent) {
        educationContent.scrollTop = educationContent.scrollHeight;
    }
}

// 點擊對話框外部關閉
window.onclick = function(event) {
    const modal = document.getElementById('educationModal');
    if (event.target == modal) {
        closeModal();
    }
} 