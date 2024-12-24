// 읽기 목록 변경 감지
chrome.readingList.onEntryAdded.addListener((entry) => {
  console.log("새 항목 추가됨:", entry);
  updateBadge();
});

chrome.readingList.onEntryRemoved.addListener((entry) => {
  console.log("항목 삭제됨:", entry);
  updateBadge();
});

// 읽기 목록 수 뱃지 업데이트
async function updateBadge() {
  try {
    const items = await chrome.readingList.query({});
    const count = items.length.toString();
    chrome.action.setBadgeText({ text: count });
    chrome.action.setBadgeBackgroundColor({ color: "#4285f4" });
  } catch (error) {
    console.error("뱃지 업데이트 실패:", error);
  }
}

// 초기 뱃지 업데이트
updateBadge();
