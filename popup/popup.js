let readingList = [];

// 읽기 목록 데이터 가져오기
async function fetchReadingList() {
  try {
    // chrome.readingList API를 사용하여 모든 항목 조회
    const items = await chrome.readingList.query({});

    // 데이터 형식 변환
    readingList = items.map((item) => ({
      id: item.url,
      title: item.title,
      url: item.url,
      dateAdded: new Date(item.creationTime),
      hasBeenRead: item.hasBeenRead,
    }));

    console.log("가져온 읽기 목록:", readingList);
    return readingList;
  } catch (error) {
    console.error("읽기 목록 가져오기 실패:", error);
    throw error;
  }
}

// UI 업데이트 함수
function updateUI(items) {
  const container = document.getElementById("reading-list");
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>읽기 목록이 비어있습니다.</p>
        <p class="help-text">크롬 브라우저의 '읽기 목록' 기능을 사용하여 항목을 추가해주세요.</p>
        <p class="help-text">브라우저 주소창 오른쪽의 ⭐️ 버튼을 클릭하고 '읽기 목록에 추가'를 선택하면 됩니다.</p>
      </div>`;
    return;
  }

  const listElement = document.createElement("div");
  listElement.className = "reading-list-container";

  items.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.className = "reading-list-item";
    itemElement.innerHTML = `
      <div class="item-content">
        <a href="${
          item.url
        }" target="_blank" rel="noopener noreferrer" class="item-title">
          ${item.title}
        </a>
        <div class="item-meta">
          <span class="date">추가일: ${item.dateAdded.toLocaleDateString()}</span>
          <a href="${item.url}" class="domain">${new URL(item.url).hostname}</a>
        </div>
      </div>
      <button class="delete-btn" data-id="${item.id}" title="삭제">
        <span class="delete-icon">×</span>
      </button>
    `;
    listElement.appendChild(itemElement);
  });

  container.appendChild(listElement);
}

// 이벤트 리스너 설정
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const items = await fetchReadingList();
    console.log("가져온 읽기 목록:", items);
    updateUI(items);

    // 내보내기 버튼
    document.getElementById("export-btn").addEventListener("click", () => {
      const exportData = JSON.stringify(readingList, null, 2);
      const blob = new Blob([exportData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "reading-list-export.json";
      a.click();

      URL.revokeObjectURL(url);
    });

    // 새로고침 버튼
    document
      .getElementById("refresh-btn")
      .addEventListener("click", async () => {
        try {
          const items = await fetchReadingList();
          updateUI(items);
        } catch (error) {
          console.error("새로고침 실패:", error);
          alert("데이터를 새로고침하는데 실패했습니다.");
        }
      });
  } catch (error) {
    console.error("초기 데이터 로딩 실패:", error);
    document.getElementById("reading-list").innerHTML = `
      <div class="error">
        데이터를 불러오는데 실패했습니다.<br>
        에러: ${error.message}
      </div>`;
  }
});

const style = document.createElement("style");
style.textContent = `
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #666;
  }

  .help-text {
    font-size: 0.9rem;
    color: #888;
    margin: 0.5rem 0;
  }

  .reading-list-container {
    max-height: 500px;
    overflow-y: auto;
  }

  .reading-list-item {
    display: flex;
    align-items: start;
    padding: 12px;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s;
  }

  .reading-list-item:hover {
    background-color: #f8f9fa;
  }

  .item-content {
    flex: 1;
    min-width: 0;
  }

  .item-title {
    display: block;
    color: #1a73e8;
    text-decoration: none;
    font-weight: 500;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-meta {
    display: flex;
    gap: 8px;
    font-size: 0.8rem;
    color: #666;
  }

  .domain {
    color: #666;
    text-decoration: none;
  }

  .delete-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 4px 8px;
    font-size: 1.2rem;
    opacity: 0.5;
    transition: opacity 0.2s;
  }

  .delete-btn:hover {
    opacity: 1;
    color: #d93025;
  }
`;

document.head.appendChild(style);
