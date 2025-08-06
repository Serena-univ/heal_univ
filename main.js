// main.js
const GAS_URL = "https://script.google.com/macros/s/AKfycbwdrG0hu8TLSJuwf2C1u6J-7TyVRaS8jZxt3b7JlreJzga1f27GHboxba7G6yLSsl_0/exec";

let selectedTeam = "";
let startTime = null, timerInterval;
let totalLogs = 0, stopCount = 0, findCount = 0;
let participant = "";

function selectTeam(team) {
  selectedTeam = team;
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`team${i}`).classList.remove('active-team');
  }
  document.getElementById(`team${team}`).classList.add('active-team');
}

function startTimer() {
  participant = document.getElementById("participantInput").value;
  if (!participant) {
    alert("활동자 이름을 입력해주세요.");
    return;
  }
  startTime = new Date();
  totalLogs = stopCount = findCount = 0;
  clearInterval(timerInterval);
  document.getElementById("startButton").classList.add("active");
  document.getElementById("liveStats").style.display = "block";
  document.getElementById("dataSection").style.display = "block";
  document.getElementById("initialSection").style.display = "none";
  document.getElementById("participantName").innerText = participant;
  document.getElementById("startTimeText").innerText = `시작시간: ${startTime.toLocaleTimeString()}`;
  updateLiveReport();

  timerInterval = setInterval(() => {
    const now = new Date();
    const elapsedMs = now - startTime;
    const minutes = Math.floor((elapsedMs / 60000) % 60);
    const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
    document.getElementById('timerDisplay').innerText = `⏱ 소요 시간: ${hours}시간 ${minutes}분`;
  }, 1000);
}

function updateLiveReport() {
  document.getElementById("liveTalk").innerText = totalLogs;
  document.getElementById("liveStop").innerText = stopCount;
  document.getElementById("liveFind").innerText = findCount;
}

function endTimer() {
  clearInterval(timerInterval);
  const endTime = new Date();
  const durationMin = Math.floor((endTime - startTime) / 60000);
  const startText = startTime.toLocaleTimeString();
  const endText = endTime.toLocaleTimeString();
  const today = new Date();
  const dateText = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  const gu = document.getElementById("mainCategory").value.trim();
  const isCustom = document.getElementById("customMiddleCheck").checked;
  const station = (isCustom ? document.getElementById("customMiddleInput").value : document.getElementById("middleCategory").value).trim();
  const detail = document.getElementById("subCategory").value.trim();
  const locationText = station ? `${station}역 ${detail}` : "";

  const summary = `${dateText}\n${startText}~${endText}, ${Math.floor(durationMin / 60)}시간 ${durationMin % 60}분\n${locationText}\n▫️활동자 : ${participant}\n▫️말걸기 : ${totalLogs}\n▫️스탑 : ${stopCount}\n▫️찾기 : ${findCount}`;

  document.getElementById("reportContent").innerText = summary;
  document.getElementById("reportPopup").style.display = "block";
}

function updateLocation() {
  const gu = document.getElementById("mainCategory").value;
  if (!gu) return;

  fetch(`${GAS_URL}?action=getStationHeaders&gu=${gu}`)
    .then(res => res.json())
    .then(headers => {
      const middleSelect = document.getElementById("middleCategory");
      middleSelect.innerHTML = '<option value="">역 선택</option>';
      headers.forEach(header => {
        const option = document.createElement("option");
        option.value = header;
        option.textContent = header;
        middleSelect.appendChild(option);
      });
    });
}

function loadDetailList() {
  const gu = document.getElementById("mainCategory").value;
  const station = document.getElementById("middleCategory").value;
  if (!gu || !station) return;

  fetch(`${GAS_URL}?action=getDetailList&gu=${gu}&station=${encodeURIComponent(station)}`)
    .then(res => res.json())
    .then(detailList => {
      const dataList = document.getElementById("detailList");
      dataList.innerHTML = "";
      const uniqueDetails = [...new Set(detailList.map(d => d.trim()).filter(Boolean))];
      uniqueDetails.forEach(detail => {
        const option = document.createElement("option");
        option.value = detail;
        dataList.appendChild(option);
      });
    })
    .catch(console.error);
}

function showAgeInput() {
  document.getElementById("age-input").style.display = "block";
  document.getElementById("reason-options").style.display = "none";
}

function showReasonOptions() {
  document.getElementById("reason-options").style.display = "block";
  document.getElementById("age-input").style.display = "none";
}

function selectResult(result) {
  document.getElementById("sub-options").style.display = result === "O" ? "block" : "none";
}

function toggleMiddleInput() {
  const isChecked = document.getElementById("customMiddleCheck").checked;
  document.getElementById("customMiddleInput").style.display = isChecked ? "inline-block" : "none";
  document.getElementById("middleCategory").disabled = isChecked;
}

function submitDetailIfNeeded() {
  const gu = document.getElementById("mainCategory").value.trim();
  const isCustom = document.getElementById("customMiddleCheck").checked;
  const station = (isCustom ? document.getElementById("customMiddleInput").value : document.getElementById("middleCategory").value).trim();
  const detail = document.getElementById("subCategory").value.trim();
  if (!gu || !station || !detail) return;

  fetch(`${GAS_URL}?action=saveDetail&gu=${gu}&station=${encodeURIComponent(station)}&detail=${encodeURIComponent(detail)}`)
    .then(res => res.text())
    .then(console.log)
    .catch(console.error);
}

function submitData(result, subResult = "", reason = "") {
  const gu = document.getElementById("mainCategory").value.trim();
  const isCustom = document.getElementById("customMiddleCheck").checked;
  const station = (isCustom ? document.getElementById("customMiddleInput").value : document.getElementById("middleCategory").value).trim();
  const detail = document.getElementById("subCategory").value.trim();
  const age = document.getElementById("age")?.value || "";

  if (!gu || !station || !detail) {
    alert("장소(구/역/상세위치)를 모두 입력해주세요.");
    return;
  }

  const payload = new URLSearchParams({
    team: selectedTeam,
    main: gu,
    middle: station,
    sub: detail,
    result: result,
  });

  if (result === "O") stopCount++;
  if (subResult === "찾기") {
    payload.append("sub_result", "찾기");
    payload.append("age", age);
    findCount++;
  } else if (subResult === "비합") {
    payload.append("sub_result", "비합");
    payload.append("reason", reason);
  } else if (subResult === "스탑만") {
  payload.append("sub_result", "스탑만");
  }

  totalLogs++;
  updateLiveReport();
  submitDetailIfNeeded();

  fetch(GAS_URL + "?" + payload.toString())
    .then(res => res.text())
    .then(console.log)
    .catch(console.error);

  document.getElementById("age").value = "";
  document.getElementById("sub-options").style.display = "none";
  document.getElementById("age-input").style.display = "none";
  document.getElementById("reason-options").style.display = "none";
}

function copyReport() {
  const content = document.getElementById("reportContent").innerText;
  const feedback = document.getElementById("feedbackText").value;
  const fullText = `${content}\n▫️활동피드백: ${feedback}`;
  navigator.clipboard.writeText(fullText).then(() => {
    alert("복사 완료!");
    resetToInitialPage();
  });
}

function resetToInitialPage() {
  clearInterval(timerInterval);
  document.getElementById("timerDisplay").innerText = "⏱ 소요 시간: 0시간 0분";
  totalLogs = stopCount = findCount = 0;
  for (let i = 1; i <= 4; i++) document.getElementById(`team${i}`).classList.remove('active-team');
  selectedTeam = "";
  document.getElementById("participantInput").value = "";
  document.getElementById("subCategory").value = "";
  document.getElementById("customMiddleInput").value = "";
  document.getElementById("middleCategory").value = "";
  document.getElementById("mainCategory").value = "";
  document.getElementById("age").value = "";
  document.getElementById("feedbackText").value = "";
  document.getElementById("liveStats").style.display = "none";
  document.getElementById("dataSection").style.display = "none";
  document.getElementById("initialSection").style.display = "block";
  document.getElementById("reportPopup").style.display = "none";
}

function closePopup() {
  document.getElementById("reportPopup").style.display = "none";
}
