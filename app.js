// app.js — Render 백엔드 전용 완성본
const API_URL = "https://kra-backend.onrender.com";

// =========================
// 1) 오늘의 경주 불러오기
// =========================
async function loadRaces() {
    const raceList = document.getElementById("raceList");
    if (!raceList) return;

    raceList.innerHTML = `<p>불러오는 중...</p>`;

    try {
        const res = await fetch(`${API_URL}/api/races`);
        if (!res.ok) throw new Error("API 오류");

        const races = await res.json();

        if (!Array.isArray(races) || races.length === 0) {
            raceList.innerHTML = `<p>경주 목록이 없습니다.</p>`;
            return;
        }

        raceList.innerHTML = "";

        races.forEach(race => {
            const item = document.createElement("div");
            item.classList.add("race-item");
            item.innerHTML = `
                <h3>${race.title}</h3>
                <p>시간: ${race.time}</p>
                <button onclick="viewRace(${race.raceId})">자세히 보기</button>
            `;
            raceList.appendChild(item);
        });
    } catch (err) {
        raceList.innerHTML = `<p>경주 목록을 불러올 수 없습니다.</p>`;
        console.error(err);
    }
}

// =========================
// 2) 경주 상세 보기
// =========================
async function viewRace(raceId) {
    window.location.href = `race.html?raceId=${raceId}`;
}

async function loadRaceDetail() {
    const params = new URLSearchParams(window.location.search);
    const raceId = params.get("raceId");

    const detailBox = document.getElementById("raceDetail");
    if (!detailBox) return;

    detailBox.innerHTML = "불러오는 중...";

    try {
        const res = await fetch(`${API_URL}/api/races/${raceId}`);
        const data = await res.json();

        detailBox.innerHTML = `
            <h2>${data.title}</h2>
            <p>시간: ${data.time}</p>

            <h3>출전마</h3>
            ${data.horses
                .map(h => `<p>${h.number}. ${h.name} (${h.jockey})</p>`)
                .join("")}

            <button onclick="predict(${raceId})">AI 예측 보기</button>
        `;
    } catch (err) {
        detailBox.innerHTML = "불러올 수 없습니다.";
    }
}

// =========================
// 3) AI 예측 보기
// =========================
async function predict(raceId) {
    const resultBox = document.getElementById("predictionResult");
    if (!resultBox) return;

    resultBox.innerHTML = "AI 분석 중...";

    try {
        const res = await fetch(`${API_URL}/api/races/${raceId}/predict`);
        const data = await res.json();

        resultBox.innerHTML = `
            <h3>AI 예측 결과</h3>
            <p>승리 예상 마번: <strong>${data.result}</strong></p>
            <p>신뢰도: ${data.confidence}%</p>
        `;
    } catch (err) {
        resultBox.innerHTML = "예측 실패";
    }
}

// =========================
// 4) 초기 실행
// =========================
document.addEventListener("DOMContentLoaded", () => {
    loadRaces();
    loadRaceDetail();
});
