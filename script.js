let currentDate = new Date();
let selectedDate = null; // 선택된 날짜 저장
const calendar = document.getElementById('calendar');
const currentMonthElement = document.getElementById('currentMonth');
const selectedDateHeader = document.getElementById('selectedDateHeader');

// 항목 리스트
const items = [
  "공통사항", "수란씨네", "보용씨네", "주공 201동", "주공 301동",
  "주공 303동", "주공 308동", "황전 103동", "황전 104동",
  "덕산 103동", "덕산 104동", "전일 야간 인계 - 1", "전일 야간 인계 - 2"
];

// 작성자 리스트
const authors = ["정명자", "유숙재", "박지예", "문일지", "김성혁", "김도경", "윤진", "노해진", "표세흠"];

// 업무 인수인계 데이터 저장
const handoverData = {};

// 현재 월 업데이트
function updateMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  currentMonthElement.innerText = `${year}년 ${month}월`;
}

// 달력 생성
function generateCalendar() {
  calendar.innerHTML = ""; // 기존 달력 초기화

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 요일 표시
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  days.forEach((day, index) => {
    const header = document.createElement("div");
    header.innerText = day;
    header.className = "calendar-header";
    if (index === 0) header.style.color = "red";
    if (index === 6) header.style.color = "blue";
    calendar.appendChild(header);
  });

  // 빈 칸 추가
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  // 날짜 생성
  for (let i = 1; i <= lastDate; i++) {
    const day = document.createElement("div");
    day.innerText = i;
    day.className = "day";
    day.addEventListener("click", () => selectDate(year, month + 1, i, day));
    calendar.appendChild(day);
  }
}

// 날짜 선택
function selectDate(year, month, day, dayElement) {
    selectedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // 선택된 날짜 표시 수정
    selectedDateHeader.innerText = `${selectedDate} / 업무인수인계`;
  
    document.querySelectorAll('.day').forEach(day => day.classList.remove('selected'));
    dayElement.classList.add('selected');
  
    generateTable();
  }

// 테이블 데이터 생성
function generateTable() {
  const tableBody = document.getElementById('handoverTable');
  tableBody.innerHTML = ""; // 기존 테이블 초기화

  if (!selectedDate) return;

  const dateData = handoverData[selectedDate] || {};

  items.forEach(item => {
    const row = document.createElement("tr");

    // 항목
    const itemCell = document.createElement("td");
    itemCell.innerText = item;
    row.appendChild(itemCell);

    // 인계 내용
    const contentCell = document.createElement("td");
    const textarea = document.createElement("textarea");
    textarea.placeholder = "인계내용을 작성해주세요"; // 플레이스홀더 추가
    textarea.value = dateData[item]?.content || "";
    textarea.addEventListener("input", (event) => {
      if (!handoverData[selectedDate]) handoverData[selectedDate] = {};
      handoverData[selectedDate][item] = {
        content: event.target.value,
        author: dateData[item]?.author || ""
      };
      autoResizeTextarea(event.target); // 입력 중에도 높이 조정
    });

    // 초기화 시 높이 조정
    autoResizeTextarea(textarea);

    contentCell.appendChild(textarea);
    row.appendChild(contentCell);

    // 작성자 선택
    const authorCell = document.createElement("td");
    const select = document.createElement("select");
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.innerText = "작성자 선택";
    select.appendChild(defaultOption);

    authors.forEach(author => {
      const option = document.createElement("option");
      option.value = author;
      option.innerText = author;
      if (author === dateData[item]?.author) option.selected = true;
      select.appendChild(option);
    });

    select.addEventListener("change", (event) => {
      if (!handoverData[selectedDate]) handoverData[selectedDate] = {};
      handoverData[selectedDate][item] = {
        content: dateData[item]?.content || "",
        author: event.target.value
      };
    });
    authorCell.appendChild(select);
    row.appendChild(authorCell);

    tableBody.appendChild(row);
  });

  // 텍스트 높이 동기화
  syncTextareaHeights();
}

// 모든 텍스트 높이 동기화
function syncTextareaHeights() {
  const textareas = document.querySelectorAll('#handoverTable textarea');
  textareas.forEach(autoResizeTextarea);
}

// 텍스트 영역 자동 높이 조정
function autoResizeTextarea(textarea) {
  textarea.style.height = "auto"; // 높이 초기화
  textarea.style.height = `${textarea.scrollHeight}px`; // 내용에 맞게 높이 설정
}

// 엑셀 다운로드
document.getElementById('downloadExcel').addEventListener("click", () => {
  if (!selectedDate) {
    alert("먼저 날짜를 선택해주세요.");
    return;
  }

  const workbook = XLSX.utils.book_new();
  const worksheetData = [];

  // 제목
  worksheetData.push(["업무 인수인계"]);
  worksheetData.push([`날짜: ${selectedDate}`]);
  worksheetData.push([]);
  worksheetData.push(["항목", "인계 내용", "작성자"]);

  // 데이터 추가
  items.forEach((item) => {
    const content = handoverData[selectedDate]?.[item]?.content || "";
    const author = handoverData[selectedDate]?.[item]?.author || "";
    worksheetData.push([item, content, author]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "업무인수인계");

  const filename = `${selectedDate}_업무인수인계.xlsx`;
  XLSX.writeFile(workbook, filename); // 엑셀 파일 저장
});

// 프린트 기능
document.getElementById('printPage').addEventListener("click", () => {
  const calendarElement = document.getElementById('calendar');

  // 달력 숨기기
  calendarElement.style.display = "none";

  window.print();

  // 프린트 후 달력 다시 보이기
  calendarElement.style.display = "grid";
});

// 초기 실행
updateMonth();
generateCalendar();

// 이전/다음 월 버튼
document.getElementById('prevMonth').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateMonth();
  generateCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateMonth();
  generateCalendar();
});