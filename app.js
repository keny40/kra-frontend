// app.js — Render 백엔드 전용 완성본

const API_URL = "https://kra-backend.onrender.com";


// ==============================
// 1) 오늘의 경주 불러오기
// ==============================
async function loadRaces() {
    const raceList = document.getElementById("raceList");
    if (!raceList) return;

    raceList.innerHTML = `<p>불러오는 중...</p>`;

    try {
        // ✔ A안 적용: /api/races → /races
        const res = await fetch(`${API_URL}/races`);
        if (!res.ok) throw new Error("API 오류");

        const races = await res.json();

        if (!Array.isArray(races) || races.length === 0) {
            raceList.innerHTML = `<p>경주 목록이 없습니다.</p>`;
            return;
        }

        raceList.innerHTML = races
            .map(
                (r) => `
                <div class="race-card">
                    <h3>${r.race_date} — ${r.race_no}R</h3>
                    <p>${r.title}</p>
                    <button onclick="viewRace('${r.race_date}', '${r.race_no}')">
                        상세 보기
                    </button>
                </div>
            `
            )
            .join("");
    } catch (err) {
        console.error(err);
        raceList.innerHTML = `<p>경주 목록을 불러올 수 없습니다.</p>`;
    }
}


// ==============================
// 2) 경주 상세 페이지 이동
// ==============================
function viewRace(date, no) {
    window.location.href = `race.html?date=${date}&no=${no}`;
}


// ==============================
// 3) 레이스 상세 불러오기
// ==============================
async function loadRaceDetail() {
    const params = new URLSearchParams(window.location.search);
    const date = params.get("date");
    const no = params.get("no");

    const detailBox = document.getElementById("raceDetail");
    if (!detailBox) return;

    detailBox.innerHTML = `<p>불러오는 중...</p>`;

    try {
        // ✔ A안 적용: /api/races → /races
        const res = await fetch(`${API_URL}/races`);
        if (!res.ok) throw new Error("API 오류");

        const races = await res.json();
        const race = races.find((r) => r.race_date === date && r.race_no === no);

        if (!race) {
            detailBox.innerHTML = `<p>해당 경주 정보를 찾을 수 없습니다.</p>`;
            return;
        }

        detailBox.innerHTML = `
            <h2>${race.race_date} — ${race.race_no}R</h2>
            <h3>${race.title}</h3>
            <h4>출전마 정보</h4>
            <pre>${JSON.stringify(race.horses, null, 2)}</pre>
        `;

    } catch (err) {
        console.error(err);
        detailBox.innerHTML = `<p>경주 정보를 불러올 수 없습니다.</p>`;
    }
}


// ==============================
// 4) 페이지 로드 시 자동 실행
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("raceList")) loadRaces();
    if (document.getElementById("raceDetail")) loadRaceDetail();
});
