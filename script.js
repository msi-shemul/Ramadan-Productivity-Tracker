/* Ramadan Productivity Tracker — script.js */

"use strict";

/* ── Data ── */
const PRAYERS = [
    { id: "fajr", name: "Fajr", arabic: "الفجر", time: "5:10 AM", done: false },
    { id: "dhuhr", name: "Dhuhr", arabic: "الظهر", time: "1:30 PM", done: false },
    { id: "asr", name: "Asr", arabic: "العصر", time: "5:00 PM", done: false },
    { id: "maghrib", name: "Maghrib", arabic: "المغرب", time: "6:31 PM", done: false },
    { id: "isha", name: "Isha", arabic: "العشاء", time: "8:00 PM", done: false },
    { id: "taraweeh", name: "Taraweeh", arabic: "التراويح", time: "8:15 PM", done: false },
];

const DEEDS = [
    { id: "sadaqah", name: "Sadaqah", icon: "💰", done: false },
    { id: "dua", name: "Dua", icon: "🤲", done: false },
    { id: "family", name: "Family Time", icon: "👨‍👩‍👧", done: false },
    { id: "qiyam", name: "Qiyam al-Layl", icon: "🌌", done: false },
];

const DHIKR = [
    { arabic: "سُبْحَانَ اللَّهِ", label: "SubhanAllah" },
    { arabic: "الْحَمْدُ لِلَّهِ", label: "Alhamdulillah" },
    { arabic: "اللَّهُ أَكْبَرُ", label: "Allahu Akbar" },
];

const WEEK_DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
const JS_TO_IDX = [1, 2, 3, 4, 5, 6, 0];
const TODAY_IDX = JS_TO_IDX[new Date().getDay()]; // auto-detects today
const PAGE_GOAL = 20;
const DHIKR_GOAL = 100;

let pages = 0;
let dhikrCounts = [0, 0, 0];
let totalDhikr = 0;
let currentDhikr = 0;


/* RENDER PRAYERS */
function renderPrayers() {
    const grid = document.getElementById("prayerGrid");
    grid.innerHTML = PRAYERS.map((p, i) => `
    <div class="prayer-row ${p.done ? "done" : ""}" onclick="togglePrayer(${i})">
      <div class="prayer-left">
        <div class="check-circle">
          <svg viewBox="0 0 12 10">
            <polyline points="1,5 4,8 11,1"/>
          </svg>
        </div>
        <div class="prayer-info">
          <p class="name">${p.name}</p>
          <p class="time">${p.arabic} · ${p.time}</p>
        </div>
      </div>
      <span class="prayer-status">${p.done ? "Done ✓" : "Pending"}</span>
    </div>
  `).join("");
}

function togglePrayer(i) {
    PRAYERS[i].done = !PRAYERS[i].done;
    renderPrayers();
    updateScore();
}


/* RENDER DEEDS */
function renderDeeds() {
    const grid = document.getElementById("deedsGrid");
    grid.innerHTML = DEEDS.map((d, i) => `
    <div class="deed-card ${d.done ? "done" : ""}" onclick="toggleDeed(${i})">
      <div class="d-icon">${d.icon}</div>
      <div class="d-name">${d.name}</div>
      <div class="d-check">${d.done ? "✓ Completed" : "Tap to mark"}</div>
    </div>
  `).join("");
}

function toggleDeed(i) {
    DEEDS[i].done = !DEEDS[i].done;
    renderDeeds();
    updateScore();
}


/* RENDER WEEKLY STREAK */
function renderWeek() {
    const row = document.getElementById("weekRow");
    row.innerHTML = WEEK_DAYS.map((d, i) => {
        const isPast = i < TODAY_IDX;
        const isToday = i === TODAY_IDX;
        let cls = "";
        if (isPast) cls = "past";
        if (isToday) cls = "today";
        const symbol = isPast ? "✓" : isToday ? "🌙" : "·";
        return `
      <div class="day-pill ${cls}">
        <div class="day-dot">${symbol}</div>
        <span class="day-name">${d}</span>
      </div>
    `;
    }).join("");
}


/* QURAN PAGES */
function changePages(delta) {
    pages = Math.max(0, pages + delta);
    const pct = Math.min(100, (pages / PAGE_GOAL) * 100);

    document.getElementById("pagesNum").textContent = pages;
    document.getElementById("pagesBar").style.width = pct + "%";
    document.getElementById("pagesPct").textContent = Math.round(pct) + "%";
    document.getElementById("juzDone").textContent = (pages / 20).toFixed(1);
    document.getElementById("pagesLeft").textContent = Math.max(0, PAGE_GOAL - pages);
    document.getElementById("totalPagesNum").textContent = pages;

    updateScore();
}


/* DHIKR / TASBIH */
function selectDhikr(idx) {
    currentDhikr = idx;
    document.getElementById("dhikrArabic").textContent = DHIKR[idx].arabic;
    document.getElementById("tasbihNum").textContent = dhikrCounts[idx];

    document.querySelectorAll(".dtab").forEach((btn, j) => {
        btn.classList.toggle("active", j === idx);
    });
}

function tapTasbih() {
    dhikrCounts[currentDhikr]++;
    totalDhikr++;
    document.getElementById("tasbihNum").textContent = dhikrCounts[currentDhikr];

    const pct = Math.min(100, (totalDhikr / DHIKR_GOAL) * 100);
    document.getElementById("dhikrBarFull").style.width = pct + "%";
    document.getElementById("dhikrTotal").textContent = `${totalDhikr} / ${DHIKR_GOAL}`;

    const btn = document.getElementById("tasbihBtnEl");
    btn.style.transform = "scale(0.88)";
    setTimeout(() => (btn.style.transform = ""), 130);

    updateScore();
}

function resetTasbih() {
    dhikrCounts[currentDhikr] = 0;
    document.getElementById("tasbihNum").textContent = 0;
}


/* SCORE UPDATE */
function updateScore() {
    const prayerDone = PRAYERS.filter(p => p.done).length;
    const prayerTotal = PRAYERS.length;
    const pPct = (prayerDone / prayerTotal) * 100;
    const qPct = Math.min(100, (pages / PAGE_GOAL) * 100);
    const dPct = Math.min(100, (totalDhikr / DHIKR_GOAL) * 100);
    const fasting = document.getElementById("fastingToggle").checked ? 10 : 0;

    const overall = Math.min(100, Math.round(pPct * 0.5 + qPct * 0.25 + dPct * 0.15 + fasting));

    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (overall / 100) * circumference;
    document.getElementById("scoreRing").style.strokeDashoffset = offset;
    document.getElementById("scorePct").textContent = overall + "%";

    document.getElementById("prayerBarMini").style.width = pPct + "%";
    document.getElementById("quranBarMini").style.width = qPct + "%";
    document.getElementById("dhikrBarMini").style.width = dPct + "%";

    document.getElementById("prayerLbl").textContent = `${prayerDone}/${prayerTotal}`;
    document.getElementById("quranLbl").textContent = `${pages} pg`;
    document.getElementById("dhikrLbl").textContent = `${totalDhikr}/${DHIKR_GOAL}`;
}


/* ════════════════════════════════
   LOCATION & PRAYER TIME
════════════════════════════════ */

let iftarHour = null, iftarMin = null;
let sehriHour = null, sehriMin = null;
let _selectedDiv = "";
let _selectedDist = "";

/* Dropdown — move to body on first open to escape all overflow:hidden parents */
function toggleLocDropdown() {
    const dd  = document.getElementById("locDropdown");
    const btn = document.getElementById("areaBtn");

    if (dd.classList.contains("open")) {
        dd.classList.remove("open");
        return;
    }

    // Move dropdown to body if not already there
    if (dd.parentElement !== document.body) {
        document.body.appendChild(dd);
    }

    // Position below button
    positionDropdown();
    dd.classList.add("open");
}

function positionDropdown() {
    const dd  = document.getElementById("locDropdown");
    const btn = document.getElementById("areaBtn");
    if (!btn || !dd) return;

    const rect = btn.getBoundingClientRect();
    const dropW = 230;

    const top = rect.bottom + 6;
    let left = rect.right - dropW;
    if (left < 8) left = 8;

    dd.style.position = "fixed";
    dd.style.top      = top + "px";
    dd.style.left     = left + "px";
    dd.style.right    = "auto";
    dd.style.width    = dropW + "px";
}

window.addEventListener("resize", positionDropdown);

function closeDropdown() {
    document.getElementById("locDropdown").classList.remove("open");
}

document.addEventListener("click", function (e) {
    const dd  = document.getElementById("locDropdown");
    const btn = document.getElementById("areaBtn");
    if (!btn.contains(e.target) && !dd.contains(e.target)) {
        closeDropdown();
    }
});

/* Back navigation */
function goBackTo(step) {
    if (step === "division") {
        document.getElementById("stepDistrict").classList.add("hidden");
        document.getElementById("stepUpazila").classList.add("hidden");
        document.getElementById("stepDivision").classList.remove("hidden");
    } else if (step === "district") {
        document.getElementById("stepUpazila").classList.add("hidden");
        document.getElementById("stepDistrict").classList.remove("hidden");
    }
}

/* Populate divisions on page load */
function populateDivisions() {
    const container = document.getElementById("divisionOptions");
    Object.keys(BD_DATA).sort().forEach(div => {
        const btn = document.createElement("button");
        btn.className = "loc-option";
        btn.textContent = div;
        btn.onclick = () => selectDivision(div);
        container.appendChild(btn);
    });
}

function selectDivision(div) {
    _selectedDiv = div;
    const container = document.getElementById("districtOptions");
    container.innerHTML = "";
    Object.keys(BD_DATA[div].districts).sort().forEach(dist => {
        const btn = document.createElement("button");
        btn.className = "loc-option";
        btn.textContent = dist;
        btn.onclick = () => selectDistrict(dist);
        container.appendChild(btn);
    });
    document.getElementById("districtStepLabel").textContent = `Select District — ${div}`;
    document.getElementById("stepDivision").classList.add("hidden");
    document.getElementById("stepUpazila").classList.add("hidden");
    document.getElementById("stepDistrict").classList.remove("hidden");
}

function selectDistrict(dist) {
    _selectedDist = dist;
    const container = document.getElementById("upazilaOptions");
    container.innerHTML = "";
    Object.keys(BD_DATA[_selectedDiv].districts[dist].upazilas).sort().forEach(upa => {
        const btn = document.createElement("button");
        btn.className = "loc-option";
        btn.textContent = upa;
        btn.onclick = () => selectUpazila(upa);
        container.appendChild(btn);
    });
    document.getElementById("upazilaStepLabel").textContent = `Select Upazila — ${dist}`;
    document.getElementById("stepDistrict").classList.add("hidden");
    document.getElementById("stepUpazila").classList.remove("hidden");
}

function selectUpazila(upazila) {
    const { lat, lng } = BD_DATA[_selectedDiv].districts[_selectedDist].upazilas[upazila];
    fetchPrayerTimes(lat, lng, upazila, _selectedDist);
}

/* AlAdhan API call */
async function fetchPrayerTimes(lat, lng, upazilaName, districtName) {
    const statusEl = document.getElementById("locStatus");
    statusEl.textContent = "⏳ Loading...";
    statusEl.className = "loc-status loading";

    try {
        const d = new Date();
        const url = `https://api.aladhan.com/v1/timings/${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}?latitude=${lat}&longitude=${lng}&method=1`;
        const res  = await fetch(url);
        const data = await res.json();
        if (data.code !== 200) throw new Error("API error");

        const t = data.data.timings;

        PRAYERS[0].time = fmt12(t.Fajr);
        PRAYERS[1].time = fmt12(t.Dhuhr);
        PRAYERS[2].time = fmt12(t.Asr);
        PRAYERS[3].time = fmt12(t.Maghrib);
        PRAYERS[4].time = fmt12(t.Isha);
        PRAYERS[5].time = fmt12(t.Isha);

        const [fH, fM] = t.Fajr.split(":").map(Number);
        const [mH, mM] = t.Maghrib.split(":").map(Number);
        sehriHour = fH; sehriMin = fM;
        iftarHour = mH; iftarMin = mM;

        document.getElementById("sehriTime").textContent = fmt12(t.Fajr);
        document.getElementById("iftarTime").textContent = fmt12(t.Maghrib);

        renderPrayers();
        updateIftarCountdown();

        document.getElementById("areaBtnLabel").textContent = `${upazilaName}, ${districtName}`;
        document.getElementById("areaBtn").classList.add("has-location");

        statusEl.textContent = `✅ ${upazilaName} Time Loaded.`;
        statusEl.className = "loc-status success";

        setTimeout(() => closeDropdown(), 900);

    } catch (err) {
        statusEl.textContent = "❌ Not Loaded. Check Your Internet.";
        statusEl.className = "loc-status error";
    }
}

/* "13:45" → "1:45 PM" */
function fmt12(time24) {
    const [h, m] = time24.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12  = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}


/* BANGLADESH LOCATION DATA */
const BD_DATA = {
    "Barisal": {
        districts: {
            "Barisal": {
                upazilas: {
                    "Barisal Sadar": { lat: 22.7010, lng: 90.3535 },
                    "Agailjhara":    { lat: 22.8513, lng: 90.2215 },
                    "Babuganj":      { lat: 22.7744, lng: 90.2977 },
                    "Bakerganj":     { lat: 22.5972, lng: 90.3091 },
                    "Banaripara":    { lat: 22.8447, lng: 90.2671 },
                    "Gaurnadi":      { lat: 22.8319, lng: 90.2893 },
                    "Hizla":         { lat: 22.5438, lng: 90.4474 },
                    "Mehendiganj":   { lat: 22.5011, lng: 90.5202 },
                    "Muladi":        { lat: 22.5848, lng: 90.3811 },
                    "Ujirpur":       { lat: 22.7651, lng: 90.2308 },
                    "Wazirpur":      { lat: 22.7887, lng: 90.1498 },
                }
            },
            "Bhola": {
                upazilas: {
                    "Bhola Sadar":  { lat: 22.6893, lng: 90.6483 },
                    "Borhanuddin":  { lat: 22.8682, lng: 90.7246 },
                    "Charfasson":   { lat: 22.3087, lng: 90.7285 },
                    "Daulatkhan":   { lat: 22.7781, lng: 90.7138 },
                    "Lalmohan":     { lat: 22.5498, lng: 90.6793 },
                    "Manpura":      { lat: 22.3778, lng: 90.8095 },
                    "Tazumuddin":   { lat: 22.6460, lng: 90.7540 },
                }
            },
            "Jhalokati": {
                upazilas: {
                    "Jhalokati Sadar": { lat: 22.6373, lng: 90.1982 },
                    "Kathalia":        { lat: 22.5046, lng: 90.0960 },
                    "Nalchity":        { lat: 22.6921, lng: 90.1620 },
                    "Rajapur":         { lat: 22.5635, lng: 90.0399 },
                }
            },
            "Patuakhali": {
                upazilas: {
                    "Patuakhali Sadar": { lat: 22.3596, lng: 90.3294 },
                    "Bauphal":          { lat: 22.4690, lng: 90.4618 },
                    "Dashmina":         { lat: 22.3126, lng: 90.4862 },
                    "Dumki":            { lat: 22.4261, lng: 90.3338 },
                    "Galachipa":        { lat: 22.1534, lng: 90.4255 },
                    "Kalapara":         { lat: 21.9996, lng: 90.3159 },
                    "Mirzaganj":        { lat: 22.4954, lng: 90.2993 },
                    "Rangabali":        { lat: 22.0424, lng: 90.5429 },
                }
            },
            "Barguna": {
                upazilas: {
                    "Barguna Sadar": { lat: 22.1504, lng: 90.1120 },
                    "Amtali":        { lat: 22.0724, lng: 90.2263 },
                    "Bamna":         { lat: 22.2889, lng: 89.9835 },
                    "Betagi":        { lat: 22.2270, lng: 90.0705 },
                    "Patharghata":   { lat: 21.9889, lng: 90.0131 },
                    "Taltali":       { lat: 21.8942, lng: 90.1597 },
                }
            },
            "Pirojpur": {
                upazilas: {
                    "Pirojpur Sadar": { lat: 22.5824, lng: 89.9758 },
                    "Bhandaria":      { lat: 22.4701, lng: 90.0674 },
                    "Kawkhali":       { lat: 22.5932, lng: 90.0398 },
                    "Mathbaria":      { lat: 22.3427, lng: 89.9917 },
                    "Nazirpur":       { lat: 22.6833, lng: 89.9119 },
                    "Nesarabad":      { lat: 22.5254, lng: 89.9454 },
                    "Zianagar":       { lat: 22.4488, lng: 89.9306 },
                }
            },
        }
    },
    "Chattogram": {
        districts: {
            "Chattogram": {
                upazilas: {
                    "Chattogram Sadar": { lat: 22.3569, lng: 91.7832 },
                    "Anwara":           { lat: 22.2255, lng: 91.8818 },
                    "Banshkhali":       { lat: 22.0313, lng: 92.0100 },
                    "Boalkhali":        { lat: 22.3509, lng: 92.0463 },
                    "Chandanaish":      { lat: 22.2007, lng: 91.9839 },
                    "Fatikchhari":      { lat: 22.6755, lng: 91.7829 },
                    "Hathazari":        { lat: 22.5024, lng: 91.8155 },
                    "Lohagara":         { lat: 22.0484, lng: 92.0742 },
                    "Mirsharai":        { lat: 22.8427, lng: 91.5763 },
                    "Patiya":           { lat: 22.2970, lng: 91.9919 },
                    "Rangunia":         { lat: 22.4753, lng: 92.0752 },
                    "Raozan":           { lat: 22.4521, lng: 91.9216 },
                    "Sandwip":          { lat: 22.4849, lng: 91.6511 },
                    "Satkania":         { lat: 22.1017, lng: 92.0749 },
                    "Sitakunda":        { lat: 22.6210, lng: 91.6602 },
                }
            },
            "Bandarban": {
                upazilas: {
                    "Bandarban Sadar": { lat: 22.1953, lng: 92.2184 },
                    "Alikadam":        { lat: 21.7894, lng: 92.3549 },
                    "Lama":            { lat: 21.9748, lng: 92.2977 },
                    "Naikhongchhari":  { lat: 21.6478, lng: 92.3024 },
                    "Rowangchhari":    { lat: 22.0530, lng: 92.3739 },
                    "Ruma":            { lat: 21.9830, lng: 92.4612 },
                    "Thanchi":         { lat: 21.7615, lng: 92.4843 },
                }
            },
            "Brahmanbaria": {
                upazilas: {
                    "Brahmanbaria Sadar": { lat: 23.9608, lng: 91.1115 },
                    "Akhaura":            { lat: 23.8724, lng: 91.1972 },
                    "Ashuganj":           { lat: 24.0289, lng: 91.0117 },
                    "Bancharampur":       { lat: 23.7341, lng: 90.9692 },
                    "Bijoynagar":         { lat: 23.8905, lng: 91.2764 },
                    "Kasba":              { lat: 23.8021, lng: 91.1256 },
                    "Nabinagar":          { lat: 23.8871, lng: 90.9505 },
                    "Nasirnagar":         { lat: 24.0820, lng: 91.1917 },
                    "Sarail":             { lat: 24.0371, lng: 91.1564 },
                }
            },
            "Chandpur": {
                upazilas: {
                    "Chandpur Sadar": { lat: 23.2313, lng: 90.6517 },
                    "Faridganj":      { lat: 23.1018, lng: 90.7278 },
                    "Haimchar":       { lat: 23.3028, lng: 90.7126 },
                    "Haziganj":       { lat: 23.2466, lng: 90.7794 },
                    "Kachua":         { lat: 23.3953, lng: 90.7905 },
                    "Matlab Dakshin": { lat: 23.3586, lng: 90.6557 },
                    "Matlab Uttar":   { lat: 23.4355, lng: 90.6814 },
                    "Shahrasti":      { lat: 23.1547, lng: 90.8484 },
                }
            },
            "Cumilla": {
                upazilas: {
                    "Cumilla Sadar": { lat: 23.4607, lng: 91.1809 },
                    "Barura":        { lat: 23.3419, lng: 91.1009 },
                    "Brahmanpara":   { lat: 23.6282, lng: 91.1108 },
                    "Burichang":     { lat: 23.5602, lng: 91.1294 },
                    "Chandina":      { lat: 23.4552, lng: 91.0520 },
                    "Chauddagram":   { lat: 23.2828, lng: 91.1762 },
                    "Daudkandi":     { lat: 23.5336, lng: 90.7989 },
                    "Debidwar":      { lat: 23.6489, lng: 90.9913 },
                    "Homna":         { lat: 23.5887, lng: 90.8930 },
                    "Laksam":        { lat: 23.2375, lng: 91.1275 },
                    "Meghna":        { lat: 23.6106, lng: 90.8491 },
                    "Muradnagar":    { lat: 23.6264, lng: 90.9260 },
                    "Nangalkot":     { lat: 23.2576, lng: 91.2580 },
                    "Titas":         { lat: 23.5700, lng: 90.8622 },
                }
            },
            "Cox's Bazar": {
                upazilas: {
                    "Cox's Bazar Sadar": { lat: 21.4272, lng: 92.0058 },
                    "Chakaria":          { lat: 21.7355, lng: 92.0728 },
                    "Kutubdia":          { lat: 21.8240, lng: 91.8546 },
                    "Maheshkhali":       { lat: 21.6418, lng: 91.9685 },
                    "Pekua":             { lat: 21.6791, lng: 91.8836 },
                    "Ramu":              { lat: 21.3942, lng: 92.0885 },
                    "Teknaf":            { lat: 20.8622, lng: 92.2925 },
                    "Ukhia":             { lat: 21.2003, lng: 92.1022 },
                }
            },
            "Feni": {
                upazilas: {
                    "Feni Sadar":   { lat: 23.0159, lng: 91.3976 },
                    "Chhagalnaiya": { lat: 23.1002, lng: 91.4688 },
                    "Daganbhuiyan": { lat: 23.1844, lng: 91.4956 },
                    "Fulgazi":      { lat: 23.0702, lng: 91.4706 },
                    "Parshuram":    { lat: 23.1361, lng: 91.4199 },
                    "Sonagazi":     { lat: 22.9121, lng: 91.3999 },
                }
            },
            "Khagrachhari": {
                upazilas: {
                    "Khagrachhari Sadar": { lat: 23.1193, lng: 91.9847 },
                    "Dighinala":          { lat: 23.2561, lng: 92.0720 },
                    "Lakshmichhari":      { lat: 22.9362, lng: 92.1124 },
                    "Mahalchhari":        { lat: 23.0979, lng: 92.0913 },
                    "Manikchhari":        { lat: 22.8670, lng: 91.8705 },
                    "Matiranga":          { lat: 22.9632, lng: 91.8605 },
                    "Panchhari":          { lat: 23.2783, lng: 92.2073 },
                    "Ramgarh":            { lat: 22.9754, lng: 91.9543 },
                }
            },
            "Lakshmipur": {
                upazilas: {
                    "Lakshmipur Sadar": { lat: 22.9449, lng: 90.8416 },
                    "Kamalnagar":       { lat: 22.7552, lng: 90.8509 },
                    "Raipur":           { lat: 23.0625, lng: 90.8348 },
                    "Ramganj":          { lat: 23.0625, lng: 90.9710 },
                    "Ramgati":          { lat: 22.7087, lng: 90.8786 },
                }
            },
            "Noakhali": {
                upazilas: {
                    "Noakhali Sadar": { lat: 22.8696, lng: 91.0997 },
                    "Begumganj":      { lat: 22.9978, lng: 91.0349 },
                    "Chatkhil":       { lat: 22.9588, lng: 91.2005 },
                    "Companiganj":    { lat: 22.6892, lng: 91.0756 },
                    "Hatiya":         { lat: 22.4500, lng: 91.1000 },
                    "Kabirhat":       { lat: 22.8484, lng: 91.2012 },
                    "Senbagh":        { lat: 22.9903, lng: 91.1514 },
                    "Subarnachar":    { lat: 22.7202, lng: 91.2094 },
                }
            },
            "Rangamati": {
                upazilas: {
                    "Rangamati Sadar": { lat: 22.6374, lng: 92.2021 },
                    "Baghaichhari":    { lat: 22.9956, lng: 92.3239 },
                    "Barkal":          { lat: 22.7179, lng: 92.5649 },
                    "Belaichhari":     { lat: 22.4636, lng: 92.3460 },
                    "Juraichhari":     { lat: 22.5432, lng: 92.3786 },
                    "Kaptai":          { lat: 22.4988, lng: 92.2816 },
                    "Kawkhali":        { lat: 22.5339, lng: 92.1582 },
                    "Langadu":         { lat: 22.9449, lng: 92.4684 },
                    "Naniarchar":      { lat: 22.7559, lng: 92.3367 },
                    "Rajasthali":      { lat: 22.4568, lng: 92.4351 },
                }
            },
        }
    },
    "Dhaka": {
        districts: {
            "Dhaka": {
                upazilas: {
                    "Dhanmondi":   { lat: 23.7461, lng: 90.3742 },
                    "Gulshan":     { lat: 23.7925, lng: 90.4078 },
                    "Mirpur":      { lat: 23.8223, lng: 90.3654 },
                    "Mohammadpur": { lat: 23.7643, lng: 90.3573 },
                    "Uttara":      { lat: 23.8759, lng: 90.3795 },
                    "Motijheel":   { lat: 23.7330, lng: 90.4182 },
                    "Tejgaon":     { lat: 23.7716, lng: 90.3889 },
                    "Demra":       { lat: 23.7204, lng: 90.4718 },
                    "Jatrabari":   { lat: 23.7097, lng: 90.4372 },
                    "Keraniganj":  { lat: 23.6860, lng: 90.3830 },
                    "Nawabganj":   { lat: 23.6202, lng: 90.2626 },
                    "Dohar":       { lat: 23.5812, lng: 90.2650 },
                    "Savar":       { lat: 23.8580, lng: 90.2660 },
                }
            },
            "Faridpur": {
                upazilas: {
                    "Faridpur Sadar": { lat: 23.6070, lng: 89.8429 },
                    "Alfadanga":      { lat: 23.4666, lng: 89.7014 },
                    "Bhanga":         { lat: 23.4089, lng: 89.9788 },
                    "Boalmari":       { lat: 23.4742, lng: 89.7859 },
                    "Charbhadrasan":  { lat: 23.4165, lng: 89.8524 },
                    "Madhukhali":     { lat: 23.5326, lng: 89.7009 },
                    "Nagarkanda":     { lat: 23.4811, lng: 89.9052 },
                    "Sadarpur":       { lat: 23.5516, lng: 89.8024 },
                    "Saltha":         { lat: 23.3838, lng: 89.9295 },
                }
            },
            "Gazipur": {
                upazilas: {
                    "Gazipur Sadar": { lat: 23.9999, lng: 90.4203 },
                    "Kaliakair":     { lat: 24.0741, lng: 90.2613 },
                    "Kaliganj":      { lat: 23.9938, lng: 90.5100 },
                    "Kapasia":       { lat: 24.1224, lng: 90.5980 },
                    "Sreepur":       { lat: 24.1887, lng: 90.4692 },
                }
            },
            "Gopalganj": {
                upazilas: {
                    "Gopalganj Sadar": { lat: 23.0058, lng: 89.8267 },
                    "Kashiani":        { lat: 23.0916, lng: 89.9091 },
                    "Kotalipara":      { lat: 22.9737, lng: 89.9737 },
                    "Muksudpur":       { lat: 23.0881, lng: 89.7521 },
                    "Tungipara":       { lat: 23.0558, lng: 89.8920 },
                }
            },
            "Kishoreganj": {
                upazilas: {
                    "Kishoreganj Sadar": { lat: 24.4449, lng: 90.7765 },
                    "Bajitpur":          { lat: 24.2218, lng: 90.9534 },
                    "Bhairab":           { lat: 24.0523, lng: 90.9778 },
                    "Hossainpur":        { lat: 24.3264, lng: 90.7163 },
                    "Itna":              { lat: 24.5459, lng: 91.0046 },
                    "Karimganj":         { lat: 24.4728, lng: 90.9720 },
                    "Katiadi":           { lat: 24.3651, lng: 90.7821 },
                    "Kuliarchar":        { lat: 24.2785, lng: 90.8677 },
                    "Mithamain":         { lat: 24.6181, lng: 90.9092 },
                    "Nikli":             { lat: 24.5007, lng: 90.9099 },
                    "Pakundia":          { lat: 24.3622, lng: 90.6588 },
                    "Tarail":            { lat: 24.2781, lng: 90.6788 },
                }
            },
            "Madaripur": {
                upazilas: {
                    "Madaripur Sadar": { lat: 23.1640, lng: 90.2015 },
                    "Kalkini":         { lat: 23.0603, lng: 90.3172 },
                    "Rajoir":          { lat: 23.1073, lng: 90.1084 },
                    "Shibchar":        { lat: 23.2339, lng: 90.0275 },
                }
            },
            "Manikganj": {
                upazilas: {
                    "Manikganj Sadar": { lat: 23.8624, lng: 90.0021 },
                    "Daulatpur":       { lat: 23.8983, lng: 89.8731 },
                    "Ghior":           { lat: 23.7895, lng: 89.9285 },
                    "Harirampur":      { lat: 23.6685, lng: 89.8336 },
                    "Saturia":         { lat: 23.9260, lng: 90.0799 },
                    "Shivalaya":       { lat: 23.7535, lng: 89.9437 },
                    "Singair":         { lat: 23.8181, lng: 90.1119 },
                }
            },
            "Munshiganj": {
                upazilas: {
                    "Munshiganj Sadar": { lat: 23.5422, lng: 90.5307 },
                    "Gazaria":          { lat: 23.5087, lng: 90.6139 },
                    "Louhajang":        { lat: 23.4681, lng: 90.4542 },
                    "Sirajdikhan":      { lat: 23.4820, lng: 90.4028 },
                    "Sreenagar":        { lat: 23.5234, lng: 90.4006 },
                    "Tongibari":        { lat: 23.4490, lng: 90.5591 },
                }
            },
            "Narayanganj": {
                upazilas: {
                    "Narayanganj Sadar": { lat: 23.6238, lng: 90.4996 },
                    "Araihazar":         { lat: 23.7020, lng: 90.6041 },
                    "Bandar":            { lat: 23.5773, lng: 90.5307 },
                    "Rupganj":           { lat: 23.7452, lng: 90.5697 },
                    "Sonargaon":         { lat: 23.6511, lng: 90.5979 },
                }
            },
            "Narsingdi": {
                upazilas: {
                    "Narsingdi Sadar": { lat: 23.9224, lng: 90.7151 },
                    "Belabo":          { lat: 24.0930, lng: 90.7469 },
                    "Monohardi":       { lat: 24.0375, lng: 90.6609 },
                    "Palash":          { lat: 23.9588, lng: 90.6748 },
                    "Raipura":         { lat: 24.0037, lng: 90.8058 },
                    "Shibpur":         { lat: 23.9743, lng: 90.6369 },
                }
            },
            "Rajbari": {
                upazilas: {
                    "Rajbari Sadar": { lat: 23.7574, lng: 89.6440 },
                    "Baliakandi":    { lat: 23.6452, lng: 89.7568 },
                    "Goalandaghat":  { lat: 23.5735, lng: 89.8194 },
                    "Kalukhali":     { lat: 23.6806, lng: 89.5649 },
                    "Pangsha":       { lat: 23.7286, lng: 89.7559 },
                }
            },
            "Shariatpur": {
                upazilas: {
                    "Shariatpur Sadar": { lat: 23.2423, lng: 90.4384 },
                    "Bhedarganj":       { lat: 23.2063, lng: 90.5274 },
                    "Damudya":          { lat: 23.2940, lng: 90.4058 },
                    "Gosairhat":        { lat: 23.1499, lng: 90.4464 },
                    "Naria":            { lat: 23.3047, lng: 90.4865 },
                    "Zanjira":          { lat: 23.3558, lng: 90.5046 },
                }
            },
            "Tangail": {
                upazilas: {
                    "Tangail Sadar": { lat: 24.2513, lng: 89.9167 },
                    "Basail":        { lat: 24.1654, lng: 90.1234 },
                    "Bhuapur":       { lat: 24.5279, lng: 89.9234 },
                    "Delduar":       { lat: 24.1600, lng: 89.9700 },
                    "Ghatail":       { lat: 24.4442, lng: 90.0019 },
                    "Gopalpur":      { lat: 24.5351, lng: 90.1232 },
                    "Madhupur":      { lat: 24.6390, lng: 90.1133 },
                    "Mirzapur":      { lat: 24.0884, lng: 90.0531 },
                    "Nagarpur":      { lat: 24.0301, lng: 89.8040 },
                    "Sakhipur":      { lat: 24.3143, lng: 90.1791 },
                }
            },
        }
    },
    "Khulna": {
        districts: {
            "Bagerhat": {
                upazilas: {
                    "Bagerhat Sadar": { lat: 22.6600, lng: 89.7854 },
                    "Chitalmari":     { lat: 22.7601, lng: 89.6793 },
                    "Fakirhat":       { lat: 22.7701, lng: 89.8656 },
                    "Kachua":         { lat: 22.6095, lng: 89.6430 },
                    "Mollahat":       { lat: 22.8153, lng: 89.8137 },
                    "Mongla":         { lat: 22.4831, lng: 89.5955 },
                    "Morrelganj":     { lat: 22.5195, lng: 89.8631 },
                    "Rampal":         { lat: 22.5729, lng: 89.7157 },
                    "Sarankhola":     { lat: 22.3459, lng: 89.7836 },
                }
            },
            "Chuadanga": {
                upazilas: {
                    "Chuadanga Sadar": { lat: 23.6401, lng: 88.8417 },
                    "Alamdanga":       { lat: 23.7261, lng: 88.9619 },
                    "Damurhuda":       { lat: 23.5485, lng: 88.9245 },
                    "Jibannagar":      { lat: 23.5286, lng: 88.8189 },
                }
            },
            "Jashore": {
                upazilas: {
                    "Jashore Sadar": { lat: 23.1634, lng: 89.2182 },
                    "Abhaynagar":    { lat: 23.0305, lng: 89.3781 },
                    "Bagherpara":    { lat: 23.2546, lng: 89.0500 },
                    "Chaugachha":    { lat: 23.3023, lng: 89.1476 },
                    "Jhikargachha":  { lat: 23.1170, lng: 89.1544 },
                    "Keshabpur":     { lat: 22.9229, lng: 89.2048 },
                    "Manirampur":    { lat: 23.0436, lng: 89.1013 },
                    "Sharsha":       { lat: 23.2736, lng: 88.9879 },
                }
            },
            "Jhenaidah": {
                upazilas: {
                    "Jhenaidah Sadar": { lat: 23.5448, lng: 89.1528 },
                    "Harinakunda":     { lat: 23.5707, lng: 89.0451 },
                    "Kaliganj":        { lat: 23.3694, lng: 89.1189 },
                    "Kotchandpur":     { lat: 23.4211, lng: 89.0306 },
                    "Maheshpur":       { lat: 23.4512, lng: 88.9745 },
                    "Shailkupa":       { lat: 23.6480, lng: 89.0527 },
                }
            },
            "Khulna": {
                upazilas: {
                    "Khulna Sadar": { lat: 22.8456, lng: 89.5403 },
                    "Batiaghata":   { lat: 22.8063, lng: 89.4072 },
                    "Dacope":       { lat: 22.6253, lng: 89.5039 },
                    "Dighalia":     { lat: 22.9522, lng: 89.5783 },
                    "Dumuria":      { lat: 22.9013, lng: 89.3858 },
                    "Koyra":        { lat: 22.4343, lng: 89.3120 },
                    "Paikgachha":   { lat: 22.5885, lng: 89.3305 },
                    "Phultala":     { lat: 22.8868, lng: 89.5008 },
                    "Rupsa":        { lat: 22.8167, lng: 89.5620 },
                    "Terokhada":    { lat: 22.9574, lng: 89.5120 },
                }
            },
            "Kushtia": {
                upazilas: {
                    "Kushtia Sadar": { lat: 23.9013, lng: 89.1202 },
                    "Bheramara":     { lat: 23.9991, lng: 89.0257 },
                    "Daulatpur":     { lat: 23.8282, lng: 88.9779 },
                    "Khoksa":        { lat: 23.7276, lng: 89.1978 },
                    "Kumarkhali":    { lat: 23.8648, lng: 89.1968 },
                    "Mirpur":        { lat: 23.9731, lng: 89.0572 },
                }
            },
            "Magura": {
                upazilas: {
                    "Magura Sadar": { lat: 23.4887, lng: 89.4196 },
                    "Mohammadpur":  { lat: 23.3737, lng: 89.4366 },
                    "Shalikha":     { lat: 23.3938, lng: 89.3573 },
                    "Sreepur":      { lat: 23.5619, lng: 89.3504 },
                }
            },
            "Meherpur": {
                upazilas: {
                    "Meherpur Sadar": { lat: 23.7622, lng: 88.6318 },
                    "Gangni":         { lat: 23.8473, lng: 88.7309 },
                    "Mujibnagar":     { lat: 23.7983, lng: 88.6783 },
                }
            },
            "Narail": {
                upazilas: {
                    "Narail Sadar": { lat: 23.1726, lng: 89.5123 },
                    "Kalia":        { lat: 23.0069, lng: 89.5695 },
                    "Lohagara":     { lat: 23.0869, lng: 89.4410 },
                }
            },
            "Satkhira": {
                upazilas: {
                    "Satkhira Sadar": { lat: 22.7185, lng: 89.0705 },
                    "Assasuni":       { lat: 22.5735, lng: 89.1548 },
                    "Debhata":        { lat: 22.5519, lng: 89.0021 },
                    "Kalaroa":        { lat: 22.8571, lng: 89.1255 },
                    "Kaliganj":       { lat: 22.4697, lng: 89.1178 },
                    "Shyamnagar":     { lat: 22.2885, lng: 89.0883 },
                    "Tala":           { lat: 22.7798, lng: 89.2085 },
                }
            },
        }
    },
    "Mymensingh": {
        districts: {
            "Mymensingh": {
                upazilas: {
                    "Mymensingh Sadar": { lat: 24.7471, lng: 90.4203 },
                    "Bhaluka":          { lat: 24.3680, lng: 90.3580 },
                    "Dhobaura":         { lat: 25.0404, lng: 90.6120 },
                    "Fulbaria":         { lat: 24.5854, lng: 90.3033 },
                    "Gaffargaon":       { lat: 24.4607, lng: 90.5519 },
                    "Gauripur":         { lat: 24.7480, lng: 90.5649 },
                    "Haluaghat":        { lat: 24.9964, lng: 90.5052 },
                    "Ishwarganj":       { lat: 24.5474, lng: 90.6508 },
                    "Muktagachha":      { lat: 24.7703, lng: 90.2578 },
                    "Nandail":          { lat: 24.5140, lng: 90.7473 },
                    "Phulpur":          { lat: 24.8714, lng: 90.5609 },
                    "Trishal":          { lat: 24.5688, lng: 90.3519 },
                }
            },
            "Jamalpur": {
                upazilas: {
                    "Jamalpur Sadar": { lat: 24.9375, lng: 89.9456 },
                    "Baksiganj":      { lat: 25.0615, lng: 89.9736 },
                    "Dewanganj":      { lat: 25.1649, lng: 89.8616 },
                    "Islampur":       { lat: 24.8291, lng: 89.8600 },
                    "Madarganj":      { lat: 24.8640, lng: 89.7870 },
                    "Melandaha":      { lat: 24.9684, lng: 90.0718 },
                    "Sarishabari":    { lat: 24.7609, lng: 89.9390 },
                }
            },
            "Netrokona": {
                upazilas: {
                    "Netrokona Sadar": { lat: 24.8703, lng: 90.7244 },
                    "Atpara":          { lat: 24.9479, lng: 90.8430 },
                    "Barhatta":        { lat: 24.9956, lng: 90.6641 },
                    "Durgapur":        { lat: 25.1164, lng: 90.6830 },
                    "Kalmakanda":      { lat: 25.0590, lng: 90.5591 },
                    "Kendua":          { lat: 24.7567, lng: 90.6883 },
                    "Khaliajuri":      { lat: 24.6680, lng: 90.8788 },
                    "Madan":           { lat: 24.6930, lng: 90.8280 },
                    "Mohanganj":       { lat: 24.6506, lng: 90.9882 },
                    "Purbadhala":      { lat: 24.7812, lng: 90.5774 },
                }
            },
            "Sherpur": {
                upazilas: {
                    "Sherpur Sadar": { lat: 25.0193, lng: 90.0163 },
                    "Jhenaigati":    { lat: 25.1115, lng: 90.2033 },
                    "Nakla":         { lat: 24.9109, lng: 90.1729 },
                    "Nalitabari":    { lat: 25.1163, lng: 90.1273 },
                    "Sreebardi":     { lat: 25.0560, lng: 90.0985 },
                }
            },
        }
    },
    "Rajshahi": {
        districts: {
            "Bogura": {
                upazilas: {
                    "Bogura Sadar": { lat: 24.8465, lng: 89.3773 },
                    "Adamdighi":    { lat: 24.9430, lng: 89.2051 },
                    "Dhunat":       { lat: 24.6945, lng: 89.4090 },
                    "Dupchanchia":  { lat: 24.9121, lng: 89.2525 },
                    "Gabtali":      { lat: 24.8665, lng: 89.4672 },
                    "Kahaloo":      { lat: 24.9784, lng: 89.1668 },
                    "Nandigram":    { lat: 24.7729, lng: 89.4671 },
                    "Sariakandi":   { lat: 25.0094, lng: 89.5423 },
                    "Shajahanpur":  { lat: 24.8099, lng: 89.3428 },
                    "Sherpur":      { lat: 24.7459, lng: 89.2879 },
                    "Shibganj":     { lat: 25.0558, lng: 89.2803 },
                    "Sonatala":     { lat: 25.0752, lng: 89.4568 },
                }
            },
            "Chapainawabganj": {
                upazilas: {
                    "Chapainawabganj Sadar": { lat: 24.5969, lng: 88.2773 },
                    "Bholahat":              { lat: 24.7114, lng: 88.2361 },
                    "Gomastapur":            { lat: 24.6854, lng: 88.1628 },
                    "Nachole":               { lat: 24.7699, lng: 88.3229 },
                    "Shibganj":              { lat: 24.6749, lng: 88.3194 },
                }
            },
            "Joypurhat": {
                upazilas: {
                    "Joypurhat Sadar": { lat: 25.1006, lng: 89.0197 },
                    "Akkelpur":        { lat: 25.0099, lng: 89.0476 },
                    "Kalai":           { lat: 24.9758, lng: 88.9868 },
                    "Khetlal":         { lat: 25.0632, lng: 89.1088 },
                    "Panchbibi":       { lat: 25.1606, lng: 89.0985 },
                }
            },
            "Naogaon": {
                upazilas: {
                    "Naogaon Sadar": { lat: 24.8103, lng: 88.9419 },
                    "Atrai":         { lat: 24.6200, lng: 88.9100 },
                    "Badalgachhi":   { lat: 24.9430, lng: 88.8510 },
                    "Dhamoirhat":    { lat: 25.0662, lng: 88.9667 },
                    "Manda":         { lat: 24.6908, lng: 88.8649 },
                    "Niamatpur":     { lat: 24.9166, lng: 88.8006 },
                    "Patnitala":     { lat: 25.0195, lng: 88.8833 },
                    "Porsha":        { lat: 25.1390, lng: 88.9240 },
                    "Raninagar":     { lat: 24.6668, lng: 88.7980 },
                    "Sapahar":       { lat: 25.1660, lng: 88.8450 },
                }
            },
            "Natore": {
                upazilas: {
                    "Natore Sadar": { lat: 24.4204, lng: 88.9906 },
                    "Baraigram":    { lat: 24.4884, lng: 89.1448 },
                    "Bagatipara":   { lat: 24.3370, lng: 89.0558 },
                    "Gurudaspur":   { lat: 24.2867, lng: 88.9871 },
                    "Lalpur":       { lat: 24.2291, lng: 88.9428 },
                    "Singra":       { lat: 24.4724, lng: 89.0766 },
                }
            },
            "Pabna": {
                upazilas: {
                    "Pabna Sadar":  { lat: 24.0064, lng: 89.2372 },
                    "Atgharia":     { lat: 24.0551, lng: 89.3621 },
                    "Bera":         { lat: 24.0786, lng: 89.6388 },
                    "Bhangura":     { lat: 24.2219, lng: 89.4956 },
                    "Chatmohar":    { lat: 24.2461, lng: 89.3176 },
                    "Faridpur":     { lat: 24.1386, lng: 89.1296 },
                    "Ishwardi":     { lat: 24.1257, lng: 89.0684 },
                    "Santhia":      { lat: 23.9511, lng: 89.3803 },
                    "Sujanagar":    { lat: 23.8980, lng: 89.5110 },
                }
            },
            "Rajshahi": {
                upazilas: {
                    "Rajshahi Sadar": { lat: 24.3745, lng: 88.6042 },
                    "Bagha":          { lat: 24.3924, lng: 88.8823 },
                    "Bagmara":        { lat: 24.4658, lng: 88.7604 },
                    "Charghat":       { lat: 24.2694, lng: 88.7817 },
                    "Durgapur":       { lat: 24.6167, lng: 88.7372 },
                    "Godagari":       { lat: 24.5194, lng: 88.4004 },
                    "Mohanpur":       { lat: 24.3451, lng: 88.5390 },
                    "Paba":           { lat: 24.3638, lng: 88.6840 },
                    "Puthia":         { lat: 24.3541, lng: 88.7448 },
                    "Tanore":         { lat: 24.6108, lng: 88.5583 },
                }
            },
            "Sirajganj": {
                upazilas: {
                    "Sirajganj Sadar": { lat: 24.4534, lng: 89.7007 },
                    "Belkuchi":        { lat: 24.3527, lng: 89.7516 },
                    "Chauhali":        { lat: 24.5474, lng: 89.8261 },
                    "Kamarkhand":      { lat: 24.3225, lng: 89.6649 },
                    "Kazipur":         { lat: 24.6373, lng: 89.6861 },
                    "Raiganj":         { lat: 24.5552, lng: 89.6319 },
                    "Shahjadpur":      { lat: 24.2098, lng: 89.7146 },
                    "Tarash":          { lat: 24.2095, lng: 89.5628 },
                    "Ullahpara":       { lat: 24.2887, lng: 89.5820 },
                }
            },
        }
    },
    "Rangpur": {
        districts: {
            "Dinajpur": {
                upazilas: {
                    "Dinajpur Sadar": { lat: 25.6279, lng: 88.6330 },
                    "Birampur":       { lat: 25.5191, lng: 88.7190 },
                    "Birganj":        { lat: 25.8383, lng: 88.7283 },
                    "Biral":          { lat: 25.6949, lng: 88.7617 },
                    "Bochaganj":      { lat: 25.8042, lng: 88.6621 },
                    "Chirirbandar":   { lat: 25.5670, lng: 88.5906 },
                    "Fulbari":        { lat: 25.6788, lng: 88.5618 },
                    "Ghoraghat":      { lat: 25.3898, lng: 89.1117 },
                    "Hakimpur":       { lat: 25.7439, lng: 88.8093 },
                    "Kaharole":       { lat: 25.6958, lng: 88.5500 },
                    "Khansama":       { lat: 25.8556, lng: 88.6122 },
                    "Nawabganj":      { lat: 24.9938, lng: 88.2867 },
                    "Parbatipur":     { lat: 25.6452, lng: 88.8877 },
                }
            },
            "Gaibandha": {
                upazilas: {
                    "Gaibandha Sadar": { lat: 25.3284, lng: 89.5286 },
                    "Fulchhari":       { lat: 25.4641, lng: 89.6274 },
                    "Gobindaganj":     { lat: 25.1167, lng: 89.3810 },
                    "Palashbari":      { lat: 25.1881, lng: 89.4489 },
                    "Sadullapur":      { lat: 25.2607, lng: 89.4241 },
                    "Saghata":         { lat: 25.3974, lng: 89.6459 },
                    "Sundarganj":      { lat: 25.4527, lng: 89.4455 },
                }
            },
            "Kurigram": {
                upazilas: {
                    "Kurigram Sadar": { lat: 25.8069, lng: 89.6366 },
                    "Bhurungamari":   { lat: 26.2696, lng: 89.7146 },
                    "Char Rajibpur":  { lat: 25.6561, lng: 89.7828 },
                    "Chilmari":       { lat: 25.5556, lng: 89.6883 },
                    "Nageshwari":     { lat: 26.0467, lng: 89.7040 },
                    "Phulbari":       { lat: 25.8779, lng: 89.4910 },
                    "Rajarhat":       { lat: 25.7124, lng: 89.5295 },
                    "Raumari":        { lat: 25.7093, lng: 89.8454 },
                    "Ulipur":         { lat: 25.6698, lng: 89.5785 },
                }
            },
            "Lalmonirhat": {
                upazilas: {
                    "Lalmonirhat Sadar": { lat: 25.9217, lng: 89.4505 },
                    "Aditmari":          { lat: 25.9987, lng: 89.3817 },
                    "Hatibandha":        { lat: 26.0905, lng: 89.4760 },
                    "Kaliganj":          { lat: 26.1290, lng: 89.3626 },
                    "Patgram":           { lat: 26.2355, lng: 89.3600 },
                }
            },
            "Nilphamari": {
                upazilas: {
                    "Nilphamari Sadar": { lat: 25.9316, lng: 88.8561 },
                    "Dimla":            { lat: 26.1429, lng: 88.9929 },
                    "Domar":            { lat: 26.0590, lng: 88.9429 },
                    "Jaldhaka":         { lat: 26.0855, lng: 89.0829 },
                    "Kishoreganj":      { lat: 25.8502, lng: 88.8124 },
                    "Saidpur":          { lat: 25.7802, lng: 88.8998 },
                }
            },
            "Panchagarh": {
                upazilas: {
                    "Panchagarh Sadar": { lat: 26.3408, lng: 88.5554 },
                    "Atwari":           { lat: 26.5683, lng: 88.6116 },
                    "Boda":             { lat: 26.3053, lng: 88.6796 },
                    "Debiganj":         { lat: 26.4969, lng: 88.7074 },
                    "Tetulia":          { lat: 26.6456, lng: 88.5770 },
                }
            },
            "Rangpur": {
                upazilas: {
                    "Rangpur Sadar": { lat: 25.7439, lng: 89.2752 },
                    "Badarganj":     { lat: 25.6619, lng: 89.0561 },
                    "Gangachara":    { lat: 25.8475, lng: 89.1855 },
                    "Kaunia":        { lat: 25.6716, lng: 89.3847 },
                    "Mithapukur":    { lat: 25.6049, lng: 89.2856 },
                    "Pirgachha":     { lat: 25.7648, lng: 89.3888 },
                    "Pirganj":       { lat: 25.8596, lng: 89.3535 },
                    "Taraganj":      { lat: 25.7031, lng: 89.1576 },
                }
            },
            "Thakurgaon": {
                upazilas: {
                    "Thakurgaon Sadar": { lat: 26.0317, lng: 88.4616 },
                    "Baliadangi":       { lat: 26.2146, lng: 88.4224 },
                    "Haripur":          { lat: 25.8798, lng: 88.4249 },
                    "Pirganj":          { lat: 25.8489, lng: 88.3890 },
                    "Ranisankail":      { lat: 25.9693, lng: 88.2720 },
                }
            },
        }
    },
    "Sylhet": {
        districts: {
            "Habiganj": {
                upazilas: {
                    "Habiganj Sadar": { lat: 24.3743, lng: 91.4156 },
                    "Ajmiriganj":     { lat: 24.4596, lng: 91.3807 },
                    "Bahubal":        { lat: 24.3291, lng: 91.5520 },
                    "Baniachong":     { lat: 24.5133, lng: 91.3574 },
                    "Chunarughat":    { lat: 24.2148, lng: 91.5744 },
                    "Lakhai":         { lat: 24.4436, lng: 91.2556 },
                    "Madhabpur":      { lat: 24.2657, lng: 91.4858 },
                    "Nabiganj":       { lat: 24.3870, lng: 91.6014 },
                }
            },
            "Moulvibazar": {
                upazilas: {
                    "Moulvibazar Sadar": { lat: 24.4829, lng: 91.7774 },
                    "Barlekha":          { lat: 24.5873, lng: 92.1555 },
                    "Juri":              { lat: 24.6283, lng: 92.0456 },
                    "Kamalganj":         { lat: 24.3687, lng: 91.8740 },
                    "Kulaura":           { lat: 24.5352, lng: 92.0445 },
                    "Rajnagar":          { lat: 24.4030, lng: 91.8420 },
                    "Sreemangal":        { lat: 24.3040, lng: 91.7273 },
                }
            },
            "Sunamganj": {
                upazilas: {
                    "Sunamganj Sadar": { lat: 25.0652, lng: 91.3993 },
                    "Bishwamvarpur":   { lat: 24.9643, lng: 91.2983 },
                    "Chhatak":         { lat: 25.0457, lng: 91.6623 },
                    "Derai":           { lat: 24.8065, lng: 91.4685 },
                    "Dharampasha":     { lat: 25.0167, lng: 90.9838 },
                    "Dowarabazar":     { lat: 25.1542, lng: 91.7055 },
                    "Jagannathpur":    { lat: 24.7743, lng: 91.4831 },
                    "Jamalganj":       { lat: 25.0667, lng: 91.0167 },
                    "Sullah":          { lat: 25.0833, lng: 91.1688 },
                    "Tahirpur":        { lat: 25.1153, lng: 91.0649 },
                }
            },
            "Sylhet": {
                upazilas: {
                    "Sylhet Sadar": { lat: 24.8949, lng: 91.8687 },
                    "Balaganj":     { lat: 24.7213, lng: 91.9834 },
                    "Beanibazar":   { lat: 24.7575, lng: 92.1130 },
                    "Bishwanath":   { lat: 24.8608, lng: 91.9974 },
                    "Companiganj":  { lat: 25.1246, lng: 91.7756 },
                    "Fenchuganj":   { lat: 24.7213, lng: 91.9227 },
                    "Golapganj":    { lat: 24.7428, lng: 91.9832 },
                    "Gowainghat":   { lat: 25.1416, lng: 91.9657 },
                    "Jaintiapur":   { lat: 25.0886, lng: 92.1134 },
                    "Kanaighat":    { lat: 25.0590, lng: 92.2748 },
                    "Osmaninagar":  { lat: 24.7900, lng: 91.8800 },
                    "South Surma":  { lat: 24.8167, lng: 91.9000 },
                    "Zakiganj":     { lat: 24.8619, lng: 92.3248 },
                }
            },
        }
    },
};


/* IFTAR COUNTDOWN — dynamic after location select */
function updateIftarCountdown() {
    if (iftarHour === null) return;

    const now   = new Date();
    const iftar = new Date(); iftar.setHours(iftarHour, iftarMin, 0, 0);
    const sehri = new Date(); sehri.setHours(sehriHour, sehriMin, 0, 0);

    const countdownEl = document.getElementById("iftarCountdown");
    const barEl       = document.getElementById("iftarBar");

    if (now < iftar) {
        const diff = iftar - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        countdownEl.textContent = `${h}h ${m}m left`;

        const total   = iftar - sehri;
        const elapsed = Math.max(0, now - sehri);
        const pct     = Math.min(100, (elapsed / total) * 100);
        barEl.style.width = pct + "%";
    } else {
        countdownEl.textContent = "Iftar time! 🌙";
        barEl.style.width = "100%";
    }
}


/* DATE */
function setDate() {
    const now = new Date();
    const opts = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
    document.getElementById("gregorianDate").textContent =
        now.toLocaleDateString("en-BD", opts);
}


/* SAVE / RESET */
function saveProgress() {
    showToast("✅ Progress saved! JazakAllah Khair 🌙");
}

function resetDay() {
    PRAYERS.forEach(p => (p.done = false));
    DEEDS.forEach(d => (d.done = false));

    pages = 0;
    dhikrCounts = [0, 0, 0];
    totalDhikr = 0;

    document.getElementById("pagesNum").textContent = 0;
    document.getElementById("pagesBar").style.width = "0%";
    document.getElementById("pagesPct").textContent = "0%";
    document.getElementById("juzDone").textContent = "0";
    document.getElementById("pagesLeft").textContent = PAGE_GOAL;
    document.getElementById("totalPagesNum").textContent = 0;
    document.getElementById("tasbihNum").textContent = 0;
    document.getElementById("dhikrBarFull").style.width = "0%";
    document.getElementById("dhikrTotal").textContent = `0 / ${DHIKR_GOAL}`;
    document.getElementById("fastingToggle").checked = false;

    renderPrayers();
    renderDeeds();
    selectDhikr(0);
    updateScore();
    showToast("🔄 Day has been reset");
}


/* TOAST */
function showToast(msg) {
    const el = document.getElementById("toastEl");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2800);
}


/* INIT */
(function init() {
    setDate();
    populateDivisions();
    renderPrayers();
    renderDeeds();
    renderWeek();
    selectDhikr(0);
    updateScore();
    setInterval(updateIftarCountdown, 30_000);
})();