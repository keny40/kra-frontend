// ===========================
// Cloudflare Worker Proxy (단일 API)
// ===========================
const API_URL = "https://kra-proxy.keny4000.workers.dev";

// 실제 호출 URL
function api(path) {
    return `${API_URL}${path}`;
}

// ===========================
// 1) 경주 목록
// ===========================
async function loadRaces() {
    const raceList = document.getElementById("raceList");
    if (!raceList) return;

    try {
        const res = await fetch(api("/races"));
        if (!res.ok) throw new Error("API 오류");

        const races = await res.json();
        raceList.innerHTML = "";

        races.forEach(r => raceList.append(raceCard(r)));
    } catch (e) {
        raceList.innerHTML = "<p>경주 목록을 불러올 수 없습니다.</p>";
    }
}

// ===========================
// 2) 경주 상세 + 예측 결과
// ===========================
async function loadRaceDetail() {
    const tbody = document.getElementById("horseRows");
    const titleEl = document.getElementById("raceTitle");
    if (!tbody || !titleEl) return;

    const params = new URLSearchParams(window.location.search);
    const raceId = params.get("id");

    // raceId가 null일 경우 방지
    if (!raceId) {
        titleEl.innerText = "경주 정보가 없습니다.";
        return;
    }

    // 경주 정보 가져오기
    try {
        const raceRes = await fetch(api(`/races/${raceId}`));
        if (raceRes.ok) {
            const r = await raceRes.json();
            titleEl.innerText = `${r.title} — 예측 결과`;
        } else {
            titleEl.innerText = `경주 #${raceId} — 예측 결과`;
        }
    } catch {
        titleEl.innerText = `경주 #${raceId} — 예측 결과`;
    }

    // 예측 결과
    try {
        const predRes = await fetch(api(`/predict/${raceId}`));
        const predData = await predRes.json();

        tbody.innerHTML = "";
        predData.horses.forEach(h => tbody.append(horseRow(h)));
    } catch (e) {
        tbody.innerHTML = "<tr><td colspan='5'>예측 결과를 불러올 수 없습니다.</td></tr>";
    }
}

// ===========================
// 3) 회원가입
// ===========================
async function signup() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(api("/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const result = await res.json();
    alert(result.message || "회원가입 완료 (관리자 승인 대기)");
}

// ===========================
// 4) 로그인
// ===========================
async function login() {
    const email = document.getElementById("email").value;
    const pw = document.getElementById("password").value;

    const res = await fetch(api("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw })
    });

    const result = await res.json();

    if (res.ok) {
        localStorage.setItem("access_token", result.access_token);
        localStorage.setItem("user_name", result.user.name);
        alert("로그인 성공");
        window.location.href = "index.html";
    } else {
        alert(result.detail || "로그인 실패");
    }
}

// ===========================
// 5) 관리자 — 승인 대기 유저 목록
// ===========================
async function loadPendingUsers() {
    const tbody = document.getElementById("pendingUsers");
    if (!tbody) return;

    try {
        const res = await fetch(api("/admin/pending"));
        const users = await res.json();

        tbody.innerHTML = "";

        users.forEach(u => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td><button data-id="${u.id}">승인</button></td>
            `;
            tr.querySelector("button").onclick = () => approveUser(u.id);
            tbody.append(tr);
        });
    } catch (e) {
        tbody.innerHTML = "<tr><td colspan='4'>승인 대기 목록을 불러올 수 없습니다.</td></tr>";
    }
}

// ===========================
// 6) 관리자 — 유저 승인
// ===========================
async function approveUser(userId) {
    const res = await fetch(api("/admin/approve"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
    });

    const result = await res.json();
    alert(result.message || "승인 처리 완료");
    loadPendingUsers();
}

// ===========================
// 7) 경주 카드 생성 — 상세 페이지로 id 전달
// ===========================
function raceCard(r) {
    const div = document.createElement("div");
    div.className = "race-card";

    div.innerHTML = `
        <a href="race.html?id=${r.id}" class="race-link">
            <div class="race-item">
                <h3>${r.title}</h3>
                <p>${r.date}</p>
            </div>
        </a>
    `;

    return div;
}

// ===========================
// 8) 말 정보 표시
// ===========================
function horseRow(h) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${h.number}</td>
        <td>${h.name}</td>
        <td>${h.jockey}</td>
        <td>${h.win_rate}%</td>
        <td>${h.place_rate}%</td>
    `;
    return tr;
}
