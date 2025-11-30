const API_URL = "https://kra-proxy.keny4000.workers.dev";


// ===========================
// 1) 경주 목록
// ===========================
async function loadRaces() {
    const raceList = document.getElementById("raceList");
    if (!raceList) return;

    const res = await fetch(`${API_URL}/races/`);
    const races = await res.json();

    raceList.innerHTML = "";

    races.forEach(r => {
        raceList.append(raceCard(r));
    });
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

    // 경주 정보
    try {
        const raceRes = await fetch(`${API_URL}/races/${raceId}`);
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
    const predRes = await fetch(`${API_URL}/predict/${raceId}`);
    const predData = await predRes.json();
    const horses = predData.horses;

    tbody.innerHTML = "";
    horses.forEach(h => {
        tbody.append(horseRow(h));
    });
}


// ===========================
// 3) 회원가입
// ===========================
async function signup() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const result = await res.json();
    alert(result.message || "회원가입 완료 (관리자 승인 대기)");

    // 가입 후 로그인 화면으로 이동하는 정도는 선택
    // window.location.href = "login.html";
}


// ===========================
// 4) 로그인
// ===========================
async function login() {
    const email = document.getElementById("email").value;
    const pw = document.getElementById("password").value;

    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw })
    });

    const result = await res.json();

    if (res.ok) {
        // 백엔드 구조에 맞추어 access_token 저장
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

    const res = await fetch(`${API_URL}/admin/pending`);
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
        const btn = tr.querySelector("button");
        btn.onclick = () => approveUser(u.id);
        tbody.append(tr);
    });
}


// ===========================
// 6) 관리자 — 유저 승인
// ===========================
async function approveUser(userId) {
    const res = await fetch(`${API_URL}/admin/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
    });

    const result = await res.json();
    alert(result.message || "승인 처리");

    loadPendingUsers();
}
