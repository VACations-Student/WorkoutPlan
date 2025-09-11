// --- Data model (full exercises included) ---
const DEFAULT = {
    days: [
        {
            id: 'pushA', title: 'Push A (Heavy)', exercises: [
                { id: 'bench', name: 'Bench press', weight: 80, reps: '4x6', notes: 'Strength focus' },
                { id: 'incline', name: 'Incline press', weight: 60, reps: '4x6' },
                { id: 'butterfly', name: 'Butterfly (Pec-deck)', weight: 50, reps: '4x8' },
                { id: 'cablepress', name: 'Cable press', weight: 30, reps: '4x12' },
                { id: 'pushdown', name: 'Triceps pushdown', weight: 60, reps: '4x10' },
                { id: 'oh_ext', name: 'Overhead extension', weight: 60, reps: '4x8' },
                { id: 'dips', name: 'Dips (BW)', weight: 0, reps: '4x3' }
            ]
        },
        {
            id: 'pullA', title: 'Pull A (Heavy)', exercises: [
                { id: 'pulldown', name: 'Pulldowns', setsDetail: [90, 90, 70, 70], repsDetail: ['4', '4', '10', '10'], notes: 'Use straps on heavy sets' },
                { id: 'trow', name: 'T-Bar Rows', weight: 50, reps: '4x8-10', notes: 'Use straps' },
                { id: 'crosslat', name: 'Cross-body lat pull', weight: 70, reps: '4x10', notes: 'One-handed, straps ok' },
                { id: 'dbpreach', name: 'Dumbbell preacher curl', weight: 12.5, reps: '4x10' },
                { id: 'facebay', name: 'Face-away Bayesian Cable Curl', weight: 30, reps: '4 sets (heavy->light)' }
            ]
        },
        {
            id: 'legs', title: 'Legs + Shoulders', exercises: [
                { id: 'legext', name: 'Leg extension', weight: 70, reps: '4x12' },
                { id: 'smithsq', name: 'Smith machine squat', weight: 40, reps: '4x10', notes: 'Go to full depth' },
                { id: 'seatedcurl', name: 'Seated leg curl', weight: 50, reps: '4x10' },
                { id: 'pronecurl', name: 'Prone leg curl', weight: 35, reps: '4x10' },
                { id: 'calf', name: 'Smith calf raises', weight: 60, reps: '4x12', notes: 'Emphasize bottom half' },
                { id: 'lateral', name: 'Lean-in cable lateral raise', weight: 15, reps: '4x12' },
                { id: 'ohp', name: 'Dumbbell overhead press', weight: 20, reps: '4x12' },
                { id: 'rear', name: 'Reverse pec deck (rear delt)', weight: 40, reps: '4x12' }
            ]
        },
        {
            id: 'pushB', title: 'Push B (Volume)', exercises: [
                { id: 'bench2', name: 'Bench press (volume)', weight: 72, reps: '3x8-10' },
                { id: 'butterfly2', name: 'Butterfly / Pec-deck', weight: 50, reps: '3x10-12' },
                { id: 'cablepress2', name: 'Cable press', weight: 30, reps: '3x12' },
                { id: 'oh_ext2', name: 'Overhead extension', weight: 60, reps: '3x8-12' }
            ]
        },
        {
            id: 'pullB', title: 'Pull B (Volume)', exercises: [
                { id: 'pulldown2', name: 'Lat pulldown (vol)', weight: 75, reps: '4x8-12' },
                { id: 'row2', name: 'Row (volume)', weight: 40, reps: '3x8-12' },
                { id: 'cross2', name: 'Cross-body lat pull', weight: 70, reps: '2x8-10' },
                { id: 'facebay2', name: 'Face-away Bayesian cable curl', weight: 30, reps: '2x6-8 / 2x10' },
                { id: 'hammer', name: 'Preacher hammer curl (DB)', weight: 12.5, reps: '4x10' }
            ]
        }
    ]
};

const STORAGE_KEY = 'ppl-workout-v1';
const LOG_KEY = 'ppl-logs-v1';

let data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || DEFAULT;
let logs = JSON.parse(localStorage.getItem(LOG_KEY) || 'null') || [];
let currentDayIndex = 0; let selectedExercise = null; let _scrollY = 0;

const navTabs = document.getElementById('navTabs');
const mobileTabs = document.getElementById('mobileTabs');
const exList = document.getElementById('exList');
const dayTitle = document.getElementById('dayTitle');
const modal = document.getElementById('modal');
const logModal = document.getElementById('logModal');
const historyHolder = document.getElementById('historyHolder');

const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const closeMobileMenuBtn = document.getElementById('closeMobileMenu');
const mobileExportBtn = document.getElementById('mobileExport');
const mobileImportBtn = document.getElementById('mobileImport');

// build tabs from data.days (also populate mobile tabs)
function renderTabs() {
    navTabs.innerHTML = '';
    mobileTabs.innerHTML = '';
    data.days.forEach((d, i) => {
        // desktop tab
        const b = document.createElement('button');
        b.className = 'tab-btn' + (i === currentDayIndex ? ' active' : '');
        b.textContent = d.title;
        b.onclick = () => { currentDayIndex = i; render(); };
        navTabs.appendChild(b);

        // mobile tab (cloned behavior + closes mobile menu)
        const mb = document.createElement('button');
        mb.className = 'mobile-tab-btn' + (i === currentDayIndex ? ' active' : '');
        mb.textContent = d.title;
        mb.onclick = () => { currentDayIndex = i; render(); closeMobileMenu(); };
        mobileTabs.appendChild(mb);
    });
    // make sure active is centered on small screens (desktop)
    const act = navTabs.querySelector('.tab-btn.active'); if (act) act.scrollIntoView({ inline: 'center', behavior: 'smooth' });
}

function render() {
    renderTabs();
    const day = data.days[currentDayIndex]; dayTitle.textContent = day.title;
    exList.innerHTML = '';
    day.exercises.forEach(ex => {
        const el = document.createElement('div'); el.className = 'ex';
        const info = document.createElement('div'); info.className = 'info';
        const h = document.createElement('h3'); h.textContent = ex.name; info.appendChild(h);
        const meta = document.createElement('div'); meta.className = 'meta';
        // show weight/reps if present
        if (ex.reps || ex.weight) meta.textContent = (ex.weight ? 'Default: ' + ex.weight + ' kg • ' : 'Default: BW kg • ') + (ex.reps || '');
        if (ex.notes) meta.textContent += ' • ' + ex.notes;
        info.appendChild(meta);
        el.appendChild(info);

        const ctr = document.createElement('div'); ctr.className = 'controls';
        const hist = document.createElement('button'); hist.className = 'btn'; hist.textContent = 'History'; hist.onclick = () => openHistory(ex.id);
        const edit = document.createElement('button'); edit.className = 'btn'; edit.textContent = 'Edit'; edit.onclick = () => openEditModal(ex);
        const log = document.createElement('button'); log.className = 'btn primary'; log.textContent = '+ Log'; log.onclick = () => openAddLog(ex);
        ctr.appendChild(hist); ctr.appendChild(edit); ctr.appendChild(log);
        el.appendChild(ctr);
        exList.appendChild(el);
    });
    renderHistoryList(); saveState();
    // Update mobile tabs active state (in case render was triggered from other actions)
    const mobileBtns = mobileTabs.querySelectorAll('.mobile-tab-btn');
    mobileBtns.forEach((btn, idx) => {
        btn.classList.toggle('active', idx === currentDayIndex);
    });
}

// modal helpers (lock scroll)
function showModal(el) { if (!el) return; _scrollY = window.scrollY || document.documentElement.scrollTop; document.body.style.top = `-${_scrollY}px`; document.body.classList.add('no-scroll-lock'); el.classList.add('show'); }
function hideModal(el) { if (!el) return; el.classList.remove('show'); document.body.classList.remove('no-scroll-lock'); setTimeout(() => { window.scrollTo(0, _scrollY); document.body.style.top = ''; }, 1); }

function openEditModal(ex) { selectedExercise = ex; document.getElementById('modalTitle').textContent = 'Edit: ' + ex.name; document.getElementById('exName').value = ex.name || ''; document.getElementById('exWeight').value = ex.weight || ''; document.getElementById('exReps').value = ex.reps || ''; document.getElementById('exNotes').value = ex.notes || ''; showModal(modal); }
function openAddLog(ex) { selectedExercise = ex; document.getElementById('logExName').textContent = ex.name; document.getElementById('logDate').value = new Date().toLocaleDateString(); document.getElementById('logSets').value = 3; document.getElementById('logWeight').value = ex.weight || ''; document.getElementById('logReps').value = ''; document.getElementById('logNotes').value = ''; showModal(logModal); }

function openHistory(exId) { renderHistoryList(exId); setTimeout(() => { historyHolder.scrollTop = 0; }, 40); }

function findExerciseById(id) { for (const d of data.days) for (const e of d.exercises) if (e.id === id) return e; return null; }

document.getElementById('saveEx').addEventListener('click', () => { if (!selectedExercise) return; selectedExercise.name = document.getElementById('exName').value || selectedExercise.name; selectedExercise.weight = Number(document.getElementById('exWeight').value) || 0; selectedExercise.reps = document.getElementById('exReps').value || ''; selectedExercise.notes = document.getElementById('exNotes').value || ''; hideModal(modal); saveState(); render(); });
document.getElementById('closeModal').addEventListener('click', () => { hideModal(modal); });
document.getElementById('deleteEx').addEventListener('click', () => { if (!selectedExercise) return; if (!confirm('Delete exercise?')) return; data.days.forEach(d => d.exercises = d.exercises.filter(e => e.id !== selectedExercise.id)); selectedExercise = null; hideModal(modal); saveState(); render(); });

document.getElementById('saveLog').addEventListener('click', () => { const ex = selectedExercise; if (!ex) return; const date = document.getElementById('logDate').value || new Date().toLocaleDateString(); const sets = Number(document.getElementById('logSets').value) || 0; const weight = Number(document.getElementById('logWeight').value) || 0; const reps = document.getElementById('logReps').value || ''; const notes = document.getElementById('logNotes').value || ''; const entry = { id: 'log_' + Date.now(), exId: ex.id, exName: ex.name, date, sets, weight, reps, notes }; logs.unshift(entry); localStorage.setItem(LOG_KEY, JSON.stringify(logs)); hideModal(logModal); renderHistoryList(); });
document.getElementById('cancelLog').addEventListener('click', () => { hideModal(logModal); });
document.getElementById('closeLogModal').addEventListener('click', () => { hideModal(logModal); });

function renderHistoryList(filterExId) {
    historyHolder.innerHTML = '';
    const list = filterExId ? logs.filter(l => l.exId === filterExId) : logs;
    if (list.length === 0) { historyHolder.innerHTML = '<div class="meta">No logs yet.</div>'; return; }
    for (const l of list) {
        const it = document.createElement('div');
        it.className = 'history-item';
        it.style.padding = '8px';
        it.style.borderRadius = '8px';
        it.style.background = 'rgba(255,255,255,0.01)';
        it.style.marginBottom = '8px';
        it.innerHTML = `<div style="display:flex;justify-content:space-between"><strong>${l.exName}</strong><span class="meta">${l.date}</span></div><div class="meta">sets: ${l.sets} • weight: ${l.weight || 'BW'} kg • reps: ${l.reps || ''}</div><div class="meta">${l.notes || ''}</div>`;
        historyHolder.appendChild(it);
    }
}

// export / import handlers
document.getElementById('exportBtn').addEventListener('click', () => { const payload = { data, logs }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'ppl-workout-backup.json'; a.click(); URL.revokeObjectURL(url); });
document.getElementById('importBtn').addEventListener('click', () => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'application/json';
    inp.onchange = (e) => {
        const f = e.target.files[0]; if (!f) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);
                if (parsed.data) data = parsed.data;
                if (parsed.logs) logs = parsed.logs;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                localStorage.setItem(LOG_KEY, JSON.stringify(logs));
                alert('Imported'); render();
            } catch (err) { alert('Invalid JSON'); }
        };
        reader.readAsText(f);
    };
    inp.click();
});

// wire mobile action buttons to the same handlers
mobileExportBtn.addEventListener('click', () => document.getElementById('exportBtn').click());
mobileImportBtn.addEventListener('click', () => document.getElementById('importBtn').click());

document.getElementById('clearLogs').addEventListener('click', () => { if (!confirm('Clear all logs?')) return; logs = []; localStorage.removeItem(LOG_KEY); renderHistoryList(); });
document.getElementById('addLogBtn').addEventListener('click', () => { let ex = selectedExercise || data.days[currentDayIndex].exercises[0]; openAddLog(ex); });

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

// Mobile menu open/close helpers
function openMobileMenu() {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    navToggle.setAttribute('aria-expanded', 'true');
    _scrollY = window.scrollY || document.documentElement.scrollTop;
    document.body.style.top = `-${_scrollY}px`;
    document.body.classList.add('no-scroll-lock');
}

function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll-lock');
    setTimeout(() => { window.scrollTo(0, _scrollY); document.body.style.top = ''; }, 1);
}

navToggle.addEventListener('click', () => {
    if (mobileMenu.classList.contains('open')) closeMobileMenu(); else openMobileMenu();
});

closeMobileMenuBtn.addEventListener('click', closeMobileMenu);

// close menu if user clicks outside inner card
mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMobileMenu();
});

// init
render();

// close modals on escape and close mobile menu on escape too
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { hideModal(modal); hideModal(logModal); closeMobileMenu(); }
});
