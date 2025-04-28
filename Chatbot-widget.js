/**
 * Chatbot Odborníčka Widget
 * Verzia 1.0.0
 * 
 * Tento skript vytvorí interaktívny chatbot widget pre web najlacnejsie-altanky.sk
 */

(function() {
  // Konfigurácia
  let config = {
    apiUrl: 'https://chatbot-odbornicka-api-altankyorava.replit.app/',
    language: 'sk',
    autoOpenDelay: 30000, // 30 sekúnd
    notificationDelay: 15000 // 15 sekúnd
  };
  
  // Stav chatbota
  let state = {
    isOpen: false,
    isMinimized: false,
    hasNewMessages: false,
    conversationId: null,
    messages: [],
    currentAudio: null,
    sessionId: generateSessionId()
  };
  
  // DOM elementy
  let elements = {
    container: null,
    window: null,
    messagesContainer: null,
    input: null,
    button: null,
    minimized: null,
    notification: null
  };
  
  // Jazykové preklady
  const translations = {
    sk: {
      title: 'Chatbot odborníčka',
      placeholder: 'Napíšte správu...',
      welcomeMessage: 'Dobrý deň! Som AI asistentka pre najlacnejsie-altanky.sk. Ako Vám môžem pomôcť s výberom záhradných altánkov, prístreškov alebo domčekov?',
      minimizedText: 'Kliknite pre obnovenie chatu',
      notificationText: 'Dobrý deň! Môžem Vám pomôcť s výberom altánku alebo záhradného domčeka?',
      notificationButton: 'Áno, pomôžte mi'
    },
    cs: {
      title: 'Chatbot odbornice',
      placeholder: 'Napište zprávu...',
      welcomeMessage: 'Dobrý den! Jsem AI asistentka pro najlacnejsie-altanky.sk. Jak Vám mohu pomoci s výběrem zahradních altánků, přístřešků nebo domků?',
      minimizedText: 'Klikněte pro obnovení chatu',
      notificationText: 'Dobrý den! Mohu Vám pomoci s výběrem altánku nebo zahradního domku?',
      notificationButton: 'Ano, pomozte mi'
    },
    hu: {
      title: 'Chatbot szakértő',
      placeholder: 'Írjon üzenetet...',
      welcomeMessage: 'Jó napot! A najlacnejsie-altanky.sk AI asszisztense vagyok. Hogyan segíthetek a kerti pavilonok, menedékek vagy házak kiválasztásában?',
      minimizedText: 'Kattintson a chat folytatásához',
      notificationText: 'Jó napot! Segíthetek a kerti pavilon vagy ház kiválasztásában?',
      notificationButton: 'Igen, segítsen nekem'
    },
    pl: {
      title: 'Chatbot ekspertka',
      placeholder: 'Napisz wiadomość...',
      welcomeMessage: 'Dzień dobry! Jestem asystentką AI dla najlacnejsie-altanky.sk. Jak mogę pomóc w wyborze altanek ogrodowych, wiat lub domków?',
      minimizedText: 'Kliknij, aby wznowić czat',
      notificationText: 'Dzień dobry! Czy mogę pomóc w wyborze altanki lub domku ogrodowego?',
      notificationButton: 'Tak, pomóż mi'
    },
    de: {
      title: 'Chatbot Expertin',
      placeholder: 'Nachricht schreiben...',
      welcomeMessage: 'Guten Tag! Ich bin die KI-Assistentin für najlacnejsie-altanky.sk. Wie kann ich Ihnen bei der Auswahl von Gartenlauben, Unterständen oder Häuschen helfen?',
      minimizedText: 'Klicken Sie, um den Chat fortzusetzen',
      notificationText: 'Guten Tag! Kann ich Ihnen bei der Auswahl einer Gartenlaube oder eines Gartenhauses helfen?',
      notificationButton: 'Ja, helfen Sie mir'
    },
    en: {
      title: 'Chatbot expert',
      placeholder: 'Type a message...',
      welcomeMessage: 'Hello! I am the AI assistant for najlacnejsie-altanky.sk. How can I help you with selecting garden gazebos, shelters, or houses?',
      minimizedText: 'Click to resume chat',
      notificationText: 'Hello! Can I help you with selecting a gazebo or garden house?',
      notificationButton: 'Yes, help me'
    }
  };
  
  /**
   * Inicializácia chatbota
   */
  function initChatbotOdbornicka(userConfig) {
    // Zlúčenie konfigurácie
    config = { ...config, ...userConfig };
    
    // Vytvorenie HTML štruktúry
    createHTMLStructure();
    
    // Pridanie udalostí
    attachEvents();
    
    // Kontrola nastavenia automatického otvorenia
    setupAutoOpen();
    
    // Pridanie welcome správy
    addMessage('bot', getText('welcomeMessage'));
    
    // Vytvorenie novej konverzácie
    createConversation();
    
    console.log('Chatbot Odborníčka iniciovaný:', config);
  }
  
  /**
   * Vytvorenie HTML štruktúry
   */
  function createHTMLStructure() {
    // Vytvorenie hlavného kontajnera
    elements.container = document.createElement('div');
    elements.container.id = 'chatbot-odbornicka-container';
    elements.container.style.position = 'fixed';
    elements.container.style.bottom = '20px';
    elements.container.style.right = '20px';
    elements.container.style.zIndex = '9999';
    elements.container.style.display = 'flex';
    elements.container.style.flexDirection = 'column';
    elements.container.style.alignItems = 'flex-end';
    
    // Vytvorenie chatového okna
    const windowHTML = `
      <div class="chatbot-window">
        <div class="chatbot-header">
          <div class="chatbot-title">
            <div class="chatbot-avatar">O</div>
            <h3>${getText('title')}</h3>
          </div>
          <div class="chatbot-controls">
            <button class="minimize-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button class="close-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="chatbot-messages"></div>
        <div class="chatbot-input">
          <input type="text" placeholder="${getText('placeholder')}" />
          <button class="send-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    // Vytvorenie minimalizovaného okna
    const minimizedHTML = `
      <div class="chatbot-minimized">
        <div class="mini-avatar">O</div>
        <div class="mini-content">
          <h4>${getText('title')}</h4>
          <p>${getText('minimizedText')}</p>
        </div>
        <button class="mini-close">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
    
    // Vytvorenie notifikácie
    const notificationHTML = `
      <div class="chatbot-notification">
        <div class="notification-header">
          <div class="notification-avatar">O</div>
          <div class="notification-title">${getText('title')}</div>
          <button class="notification-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="notification-content">
          ${getText('notificationText')}
        </div>
        <div class="notification-action">
          <button class="notification-button">${getText('notificationButton')}</button>
        </div>
      </div>
    `;
    
    // Vytvorenie tlačidla
    const buttonHTML = `
      <button class="chatbot-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    `;
    
    // Pridanie štýlov
    const stylesHTML = `
      <style>
        /* Chatbot kontajner */
        #chatbot-odbornicka-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        /* Chatbot hlavné okno */
        .chatbot-window {
          width: 350px;
          height: 500px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          margin-bottom: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.3s;
          opacity: 0;
          transform: translateY(10px) scale(0.95);
          pointer-events: none;
        }
        
        .chatbot-window.active {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
        }
        
        /* Hlavička chatbota */
        .chatbot-header {
          background-color: #4caf50;
          color: white;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .chatbot-header h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }
        
        .chatbot-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #388e3c;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          color: white;
          font-weight: bold;
        }
        
        .chatbot-title {
          display: flex;
          align-items: center;
        }
        
        .chatbot-controls button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 6px;
          opacity: 0.8;
          transition: opacity 0.2s;
          padding: 0;
        }
        
        .chatbot-controls button:hover {
          opacity: 1;
        }
        
        .chatbot-controls {
          display: flex;
        }
        
        /* Obsah chatbota */
        .chatbot-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .message {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px;
          position: relative;
          word-wrap: break-word;
        }
        
        .message.bot {
          background-color: #f1f1f1;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }
        
        .message.user {
          background-color: #4caf50;
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }
        
        /* Audio prehrávač */
        .audio-player {
          display: flex;
          align-items: center;
          margin-top: 8px;
        }
        
        .play-button {
          background-color: #4caf50;
          border: none;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-right: 8px;
          padding: 0;
        }
        
        .audio-progress {
          height: 4px;
          background-color: #e0e0e0;
          flex: 1;
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }
        
        .audio-progress-bar {
          height: 100%;
          background-color: #4caf50;
          width: 0%;
          transition: width 0.1s linear;
        }
        
        /* Vstupné pole */
        .chatbot-input {
          padding: 10px 16px;
          border-top: 1px solid #eaeaea;
          display: flex;
          align-items: center;
        }
        
        .chatbot-input input {
          flex: 1;
          border: 1px solid #e0e0e0;
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        
        .chatbot-input input:focus {
          border-color: #4caf50;
        }
        
        .send-button {
          background-color: #4caf50;
          color: white;
          border: none;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          margin-left: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
          padding: 0;
        }
        
        .send-button:hover {
          background-color: #388e3c;
        }
        
        /* Tlačidlo na otvorenie chatbota */
        .chatbot-button {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background-color: #4caf50;
          color: white;
          border: none;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s, transform 0.2s;
          padding: 0;
        }
        
        .chatbot-button:hover {
          background-color: #388e3c;
        }
        
        .chatbot-button svg {
          width: 24px;
          height: 24px;
        }
        
        /* Minimalizované chatové okno */
        .chatbot-minimized {
          display: flex;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 8px 12px;
          margin-bottom: 16px;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
          opacity: 0;
          transform: translateY(10px);
          pointer-events: none;
        }
        
        .chatbot-minimized.active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }
        
        .mini-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #4caf50;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          margin-right: 12px;
        }
        
        .mini-content {
          flex: 1;
        }
        
        .mini-content h4 {
          font-size: 14px;
          margin: 0 0 2px 0;
        }
        
        .mini-content p {
          font-size: 12px;
          color: #757575;
          margin: 0;
        }
        
        .mini-close {
          background: none;
          border: none;
          width: 24px;
          height: 24px;
          cursor: pointer;
          color: #9e9e9e;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 8px;
          padding: 0;
        }
        
        .mini-close:hover {
          color: #757575;
        }
        
        /* Notifikácia */
        .chatbot-notification {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
          width: 280px;
          margin-bottom: 16px;
          overflow: hidden;
          transition: all 0.3s;
          opacity: 0;
          transform: translateY(10px);
          pointer-events: none;
        }
        
        .chatbot-notification.active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }
        
        .notification-header {
          padding: 8px 12px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .notification-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #4caf50;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          margin-right: 8px;
        }
        
        .notification-title {
          font-size: 14px;
          font-weight: 600;
          flex: 1;
        }
        
        .notification-close {
          background: none;
          border: none;
          width: 20px;
          height: 20px;
          cursor: pointer;
          color: #9e9e9e;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        
        .notification-content {
          padding: 12px;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .notification-action {
          padding: 0 12px 12px;
        }
        
        .notification-button {
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
          width: 100%;
        }
        
        .notification-button:hover {
          background-color: #388e3c;
        }
        
        /* Responzívny dizajn pre mobilné zariadenia */
        @media (max-width: 600px) {
          .chatbot-window {
            width: 100%;
            height: 100%;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: 0;
            border-radius: 0;
            z-index: 10000;
          }
          
          .chatbot-notification {
            width: calc(100% - 24px);
            max-width: 350px;
          }
        }
      </style>
    `;
    
    // Pridanie prvkov do DOM
    elements.container.innerHTML = windowHTML + minimizedHTML + notificationHTML + buttonHTML + stylesHTML;
    document.body.appendChild(elements.container);
    
    // Uloženie referencií na DOM elementy
    elements.window = elements.container.querySelector('.chatbot-window');
    elements.messagesContainer = elements.container.querySelector('.chatbot-messages');
    elements.input = elements.container.querySelector('.chatbot-input input');
    elements.button = elements.container.querySelector('.chatbot-button');
    elements.minimized = elements.container.querySelector('.chatbot-minimized');
    elements.notification = elements.container.querySelector('.chatbot-notification');
  }
  
  /**
   * Pridanie udalostí
   */
  function attachEvents() {
    // Otvorenie chatbota po kliknutí na tlačidlo
    elements.button.addEventListener('click', toggleChat);
    
    // Odoslanie správy po kliknutí na tlačidlo odoslať
    elements.container.querySelector('.send-button').addEventListener('click', sendMessage);
    
    // Odoslanie správy po stlačení Enter
    elements.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
    
    // Zatvorenie chatbota
    elements.container.querySelector('.close-button').addEventListener('click', closeChat);
    
    // Minimalizácia chatbota
    elements.container.querySelector('.minimize-button').addEventListener('click', minimizeChat);
    
    // Maximalizácia chatbota
    elements.minimized.addEventListener('click', (e) => {
      if (!e.target.classList.contains('mini-close')) {
        maximizeChat();
      }
    });
    
    // Zatvorenie minimalizovaného chatbota
    elements.container.querySelector('.mini-close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeChat();
    });
    
    // Notifikácia - zatvorenie
    elements.container.querySelector('.notification-close').addEventListener('click', hideNotification);
    
    // Notifikácia - otvorenie chatu
    elements.container.querySelector('.notification-button').addEventListener('click', openChat);
    
    // Ukončenie konverzácie pri zatvorení stránky
    window.addEventListener('beforeunload', () => {
      if (state.conversationId) {
        navigator.sendBeacon(`${config.apiUrl}/chatbot/end-conversation/${state.conversationId}`, JSON.stringify({}));
      }
    });
  }
  
  /**
   * Nastavenie automatického otvorenia
   */
  function setupAutoOpen() {
    // Automatické otvorenie po časovom intervale
    if (config.autoOpen && config.autoOpenDelay > 0) {
      setTimeout(() => {
        if (!state.isOpen && !state.isMinimized) {
          showNotification();
        }
      }, config.autoOpenDelay);
    }
  }
  
  /**
   * Otvorenie chatového okna
   */
  function openChat() {
    hideNotification();
    
    state.isOpen = true;
    state.isMinimized = false;
    
    elements.window.classList.add('active');
    elements.minimized.classList.remove('active');
    
    elements.input.focus();
    scrollToBottom();
  }
  
  /**
   * Zatvorenie chatového okna
   */
  function closeChat() {
    state.isOpen = false;
    state.isMinimized = false;
    
    elements.window.classList.remove('active');
    elements.minimized.classList.remove('active');
    hideNotification();
    
    // Zastavenie prehrávania audia, ak hrá
    if (state.currentAudio && state.currentAudio.audio) {
      state.currentAudio.audio.pause();
      state.currentAudio = null;
    }
  }
  
  /**
   * Minimalizácia chatového okna
   */
  function minimizeChat() {
    state.isOpen = false;
    state.isMinimized = true;
    
    elements.window.classList.remove('active');
    elements.minimized.classList.add('active');
    
    // Zastavenie prehrávania audia, ak hrá
    if (state.currentAudio && state.currentAudio.audio) {
      state.currentAudio.audio.pause();
      state.currentAudio = null;
    }
  }
  
  /**
   * Maximalizácia chatového okna
   */
  function maximizeChat() {
    state.isOpen = true;
    state.isMinimized = false;
    
    elements.window.classList.add('active');
    elements.minimized.classList.remove('active');
    
    elements.input.focus();
    scrollToBottom();
  }
  
  /**
   * Prepínanie stavu chatového okna
   */
  function toggleChat() {
    if (state.isOpen) {
      minimizeChat();
    } else if (state.isMinimized) {
      maximizeChat();
    } else {
      openChat();
    }
  }
  
  /**
   * Zobrazenie notifikácie
   */
  function showNotification() {
    if (!state.isOpen && !state.isMinimized) {
      elements.notification.classList.add('active');
    }
  }
  
  /**
   * Skrytie notifikácie
   */
  function hideNotification() {
    elements.notification.classList.remove('active');
  }
  
  /**
   * Odoslanie správy
   */
  function sendMessage() {
    const text = elements.input.value.trim();
    
    if (text === '') {
      return;
    }
    
    // Pridanie správy do rozhrania
    addMessage('user', text);
    
    // Vyčistenie vstupného poľa
    elements.input.value = '';
    
    // Odoslanie správy na server
    sendToServer(text);
  }
  
  /**
   * Pridanie správy do rozhrania
   */
  function addMessage(sender, text, audio = null) {
    // Vytvorenie prvku správy
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.innerText = text;
    
    // Pridanie audio prehrávača, ak je audio dostupné
    if (audio && sender === 'bot') {
      const audioPlayer = createAudioPlayer(audio);
      messageElement.appendChild(audioPlayer);
    }
    
    // Pridanie správy do kontajnera
    elements.messagesContainer.appendChild(messageElement);
    
    // Scrollovanie na koniec správ
    scrollToBottom();
    
    return messageElement;
  }
  
  /**
   * Vytvorenie prehrávača audia
   */
  function createAudioPlayer(audioUrl) {
    const audioContainer = document.createElement('div');
    audioContainer.className = 'audio-player';
    
    const playButton = document.createElement('button');
    playButton.className = 'play-button';
    playButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    `;
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'audio-progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'audio-progress-bar';
    
    progressContainer.appendChild(progressBar);
    audioContainer.appendChild(playButton);
    audioContainer.appendChild(progressContainer);
    
    // Vytvorenie audio elementu
    const audio = new Audio(audioUrl);
    
    // Zastavenie aktuálneho audia, ak nejaké hrá
    playButton.addEventListener('click', () => {
      if (state.currentAudio && state.currentAudio.audio) {
        // Zastavenie predchádzajúceho audia
        state.currentAudio.audio.pause();
        state.currentAudio.button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        `;
        state.currentAudio.progressBar.style.width = '0%';
      }
      
      if (!state.currentAudio || state.currentAudio.audio !== audio) {
        // Spustenie nového audia
        audio.currentTime = 0;
        audio.play();
        playButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        `;
        
        state.currentAudio = {
          audio: audio,
          button: playButton,
          progressBar: progressBar
        };
        
        // Informovanie API, že audio bolo prehrané
        if (state.lastMessageId) {
          fetch(`${config.apiUrl}/chatbot/voice-played/${state.lastMessageId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          }).catch(error => console.error('Chyba pri zaznamenaní prehratia:', error));
        }
      } else {
        // Pauzovanie audia, ak je to isté audio
        audio.pause();
        playButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        `;
        state.currentAudio = null;
      }
    });
    
    // Aktualizácia progress baru
    audio.addEventListener('timeupdate', () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = `${percent}%`;
    });
    
    // Reset po skončení prehrávania
    audio.addEventListener('ended', () => {
      playButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      `;
      progressBar.style.width = '0%';
      state.currentAudio = null;
    });
    
    return audioContainer;
  }
  
  /**
   * Scrollovanie na koniec správ
   */
  function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
  }
  
  /**
   * Odoslanie správy na server
   */
  function sendToServer(message) {
    // Kontrola, či máme vytvorenú konverzáciu
    const sendRequest = () => {
      fetch(`${config.apiUrl}/chatbot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          conversationId: state.conversationId,
          sessionId: state.sessionId,
          language: config.language || 'sk'
        })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Chyba pri komunikácii so serverom');
          }
          return response.json();
        })
        .then(data => {
          // Pridanie odpovede od chatbota
          addMessage('bot', data.message, data.audio);
          state.lastMessageId = data.messageId;
        })
        .catch(error => {
          console.error('Error sending message:', error);
          addMessage('bot', 'Ospravedlňujem sa, ale nastala chyba pri spracovaní vašej správy. Prosím, skúste to znova neskôr.');
        });
    };
    
    if (!state.conversationId) {
      createConversation().then(sendRequest);
    } else {
      sendRequest();
    }
  }
  
  /**
   * Vytvorenie novej konverzácie
   */
  function createConversation() {
    return fetch(`${config.apiUrl}/chatbot/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: state.sessionId,
        language: config.language || 'sk'
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Chyba pri vytváraní konverzácie');
        }
        return response.json();
      })
      .then(data => {
        state.conversationId = data.conversationId;
        return data;
      })
      .catch(error => {
        console.error('Chyba pri vytváraní konverzácie:', error);
        return null;
      });
  }
  
  /**
   * Ukončenie konverzácie pri zatvorení stránky
   */
  window.addEventListener('beforeunload', () => {
    if (state.conversationId) {
      navigator.sendBeacon(`${config.apiUrl}/chatbot/end-conversation/${state.conversationId}`, JSON.stringify({}));
    }
  });
  
  function getText(key) {
    const lang = config.language || 'sk';
    return translations[lang]?.[key] || translations.sk[key];
  }
  
  function generateSessionId() {
    return 'chatbot-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  // Exporácia inicializačnej funkcie
  window.initChatbotOdbornicka = initChatbotOdbornicka;
})();
