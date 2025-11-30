// ==========================================
// Cloudflare Worker Proxy URL
// ==========================================
const PROXY = "https://kra-proxy.keny4000.workers.dev";
const BACKEND = "https://kra-render-backend.onrender.com";

// Helper: 실제 호출 URL 구성
function api(path) {
    return `${PROXY}/?url=${encodeURIComponent(BACKEND + path)}`;
}

// ==========================================
// 1) 경주 목록 로드
// ==========================================
async function loadRaces() {
    const raceList = document.getElementById("raceList");
    if (!raceList) return;

    try {
        const res = await fetch(api("/races/"));
        const races = await res.json();

        raceList.innerHTML = "";

        races.forEach(r => {
            raceList.append(raceCard(r));
        });
    } catch (e) {
        console.error("경주 목록 오류:", e);
        raceList.innerHTML = "<div class='error'>경주 목록을 불러올 수 없습니다.</div>";
    }
}

// 경주 카드 렌더링
function raceCard(r) {
    const div = document.createElement("div");
    div.className = "race-card";
    div.innerHTML = `
        <div class="race-title">${r.name}</div>
        <div class="race-info">거리: ${r.distance}m</div>
        <div class="race-info">출전: ${r.horses.length}마</div>
        <button class="race-btn" onclick="openRace(${r.id})">상세보기</button>
    `;
    return div;
}

// 상세 페이지로 이동
function openRace(id) {
    window.location.href = `race.html?id=${id}`;
}

// ==========================================
// 2) 경주 상세 + 예측 결과 로드
// ==========================================
async function loadRaceDetail() {
    const tbody = document.getElementById("horseRows");
    const titleEl = document.getElementById("raceTitle");
    const predEl = document.getElementById("predictionResult");

    if (!tbody || !titleEl) return;

    const params = new URLSearchParams(window.location.search);
    const raceId = params.get("id");

    try {
        const res = await fetch(api(`/races/${raceId}`));
        const data = await res.json();

        // 제목
        titleEl.innerText = `${data.name} (거리 ${data.distance}m)`;

        // 말 목록
        tbody.innerHTML = "";
        data.horses.forEach(h => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${h.number}</td>
                <td>${h.name}</td>
                <td>${h.jockey}</td>
                <td>${h.weight}</td>
                <td>${h.record}</td>
            `;
            tbody.appendChild(tr);
        });

        // 예측
        if (predEl) {
            predEl.innerHTML = `
                <div class="pred-title">AI 예측 결과</div>
                <div class="pred-top">${data.prediction.top.join(", ")}</div>
                <div class="pred-bottom">(상위 예상 순위)</div>
            `;
        }

    } catch (e) {
        console.error("상세 오류:", e);
        tbody.innerHTML = "<tr><td colspan='5'>상세 불러오기 실패</td></tr>";
    }
}

// ==========================================
// 공통: 페이지 진입 시 실행
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("raceList")) loadRaces();
    if (document.getElementById("horseRows")) loadRaceDetail();
});
