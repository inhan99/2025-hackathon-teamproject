// 챗봇 채팅기록 관리 유틸리티

const CHAT_HISTORY_KEY = 'refit_chat_history';

// 채팅기록 저장
export const saveChatHistory = (messages) => {
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('채팅기록 저장 실패:', error);
  }
};

// 채팅기록 불러오기
export const loadChatHistory = () => {
  try {
    const history = localStorage.getItem(CHAT_HISTORY_KEY);
    if (history) {
      const messages = JSON.parse(history);
      // timestamp를 Date 객체로 변환
      return messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    return [];
  } catch (error) {
    console.error('채팅기록 불러오기 실패:', error);
    return [];
  }
};

// 채팅기록 삭제
export const clearChatHistory = () => {
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  } catch (error) {
    console.error('채팅기록 삭제 실패:', error);
  }
};

// 새 메시지 추가
export const addChatMessage = (message) => {
  try {
    const currentHistory = loadChatHistory();
    const updatedHistory = [...currentHistory, message];
    saveChatHistory(updatedHistory);
    return updatedHistory;
  } catch (error) {
    console.error('메시지 추가 실패:', error);
    return [];
  }
};

// 채팅기록이 있는지 확인
export const hasChatHistory = () => {
  try {
    const history = localStorage.getItem(CHAT_HISTORY_KEY);
    if (history) {
      const messages = JSON.parse(history);
      return messages.length > 0;
    }
    return false;
  } catch (error) {
    console.error('채팅기록 확인 실패:', error);
    return false;
  }
}; 