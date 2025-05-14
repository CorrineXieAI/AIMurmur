// 對話歷史記錄
let conversationHistory = []; // 改為單一陣列，所有衛教項目共用

// 當前選擇的衛教項目
let currentEducationType = null;

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
    
    // 添加輸入區域
    const inputArea = document.createElement('div');
    inputArea.className = 'input-area';
    inputArea.innerHTML = `
        <input type="text" id="userInput" placeholder="請輸入您的問題...">
        <button type="button" onclick="toggleVoiceInput()" class="voice-input-btn" id="voiceInputBtn">
            <i class="fas fa-microphone"></i>
        </button>
    `;
    educationContentDiv.appendChild(inputArea);
    
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
    const text = document.getElementById('educationText')?.textContent;
    if (!text) return;
    
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
    } else {
        speakText(text);
    }
}

function speakText(text) {
    if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-TW';
        utterance.rate = 1;
        utterance.pitch = 1;
        
        utterance.onstart = () => {
            isSpeaking = true;
        };
        
        utterance.onend = () => {
            isSpeaking = false;
        };
        
        window.speechSynthesis.speak(utterance);
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
        recognition.lang = 'zh-TW';

        recognition.onresult = function(event) {
            const text = event.results[0][0].transcript;
            // 直接處理語音識別結果，不顯示在輸入框中
            processUserInput(text);
        };

        recognition.onend = function() {
            isRecording = false;
            const voiceInputBtn = document.getElementById('voiceInputBtn');
            if (voiceInputBtn) {
                voiceInputBtn.classList.remove('recording');
            }
            // 清空輸入框
            const userInput = document.getElementById('userInput');
            if (userInput) {
                userInput.value = '';
            }
        };

        recognition.onerror = function(event) {
            console.error('語音識別錯誤:', event.error);
            isRecording = false;
            const voiceInputBtn = document.getElementById('voiceInputBtn');
            if (voiceInputBtn) {
                voiceInputBtn.classList.remove('recording');
            }
            // 顯示錯誤提示
            const errorMessage = '語音識別出現問題，請重試或使用文字輸入。';
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

// 處理用戶輸入
function processUserInput(input) {
    if (!currentEducationType) return;

    // 如果是錯誤消息，直接顯示AI回應
    if (input.includes('語音識別出現問題')) {
        const aiResponse = document.createElement('div');
        aiResponse.className = 'ai-response';
        aiResponse.innerHTML = `
            <div class="ai-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>${input}</p>
            </div>
        `;
        
        const educationContent = document.getElementById('educationContent');
        const inputArea = educationContent?.querySelector('.input-area');
        if (educationContent && inputArea) {
            educationContent.insertBefore(aiResponse, inputArea);
        }
        
        // 保存到歷史記錄
        conversationHistory.push({
            type: 'ai',
            content: input,
            educationType: currentEducationType
        });
        return;
    }

    // 保存用戶輸入到歷史記錄
    conversationHistory.push({
        type: 'user',
        content: input,
        educationType: currentEducationType
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
    const inputArea = educationContent?.querySelector('.input-area');
    if (educationContent && inputArea) {
        educationContent.insertBefore(userResponse, inputArea);
    }

    // 這裡可以添加更複雜的AI對話邏輯
    const responses = {
        '手術': '手術是一個嚴謹的醫療程序，我們會確保您的安全。您想了解手術的哪些具體方面？例如：手術時間、恢復期、注意事項等。',
        '麻醉': '麻醉是手術的重要環節，我們會根據您的情況選擇最適合的麻醉方式。您對麻醉有什麼特別的疑慮嗎？例如：麻醉風險、術後恢復等。',
        '風險': '每個手術都有其特定的風險，我們會詳細為您說明。您想了解哪些具體的風險？例如：出血、感染、併發症等。',
        '費用': '費用會根據手術類型和使用的材料而有所不同。您想了解具體的費用明細嗎？我們可以為您詳細說明健保給付和自費項目。',
        '恢復': '手術後的恢復期很重要，我們會提供完整的術後照護指導。您想了解哪些具體的恢復注意事項？',
        '時間': '手術時間會根據手術類型和複雜度而有所不同。您想了解具體的手術時間安排嗎？',
        '準備': '手術前的準備工作很重要，包括禁食、停藥等事項。您需要了解具體的準備事項嗎？',
        '併發症': '每個手術都可能出現併發症，我們會詳細說明可能的併發症和預防措施。您想了解哪些具體的併發症？'
    };

    let response = '抱歉，我沒有完全理解您的問題。請您換個方式提問，或直接詢問醫護人員。您也可以詢問關於手術、麻醉、風險、費用、恢復期等具體問題。';
    
    for (let key in responses) {
        if (input.includes(key)) {
            response = responses[key];
            break;
        }
    }

    // 保存AI回應到歷史記錄
    conversationHistory.push({
        type: 'ai',
        content: response,
        educationType: currentEducationType
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
    
    if (educationContent && inputArea) {
        educationContent.insertBefore(aiResponse, inputArea);
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