let currentAuthMode = "login";
let selectedGender = "male";
let selectedCategory = "all";

// Test Döngüsü & Skor
let quizQuestions = [];
let currentIndex = 0;
let correctCount = 0;
let wrongAnswers = [];
let answered = false;

// Joker Hakları ve Durumları
let fiftyFiftyCount = 1;
let secondChanceCount = 1;
let secondChanceActive = false;

// 20 Soruda bir joker yenileme sayacı
let sessionAnsweredCount = 0;

// Veritabanındaki Geçmiş
let userHistoryData = [];

// 9 Kategori Tanımı (debate yerine vocabulary güncellendi)
const categories = [
    { key: "all", name: "🎲 Karma Sınav" },
    { key: "business", name: "💼 İş Dünyası" },
    { key: "academic", name: "🎓 Akademik" },
    { key: "idioms", name: "🗣️ Deyimler" },
    { key: "tech", name: "💻 Teknoloji & IT" },
    { key: "travel", name: "✈️ Seyahat" },
    { key: "vocabulary", name: "📚 Kelime Düellosu" },
    { key: "kitchen", name: "🍳 Mutfak & Yemek" },
    { key: "daily", name: "🏡 Gündelik Yaşam" }
];

// DOM Elemanları
const authOverlay = document.getElementById("auth-overlay");
const lobbyScreen = document.getElementById("lobby-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const authMsg = document.getElementById("auth-message");
const genderBox = document.getElementById("gender-select-box");
const lobbyUsername = document.getElementById("lobby-username");

const questionProgress = document.getElementById("question-progress");
const qtypeBadge = document.getElementById("qtype-badge");
const correctCountVal = document.getElementById("correct-count-val");
const exampleEl = document.getElementById("example-text");
const optionsGrid = document.getElementById("options-grid");
const feedbackEl = document.getElementById("feedback-banner");
const nextBtn = document.getElementById("next-btn");

const typeLabels = {
    MEANING: "KELİME ANLAMI",
    FILL_BLANK: "BOŞLUK DOLDURMA",
    SYNONYM: "EŞ ANLAM",
    ANTONYM: "ZIT ANLAM",
    COMPLETION: "CÜMLE TAMAMLAMA",
    TR_TO_EN: "ÇEVİRİ TESTİ"
};

function selectCategory(cat, element) {
    selectedCategory = cat;
    document.querySelectorAll(".cat-card").forEach(c => c.classList.remove("active"));
    element.classList.add("active");
}

function switchAuthTab(mode) {
    currentAuthMode = mode;
    authMsg.innerText = "";
    document.getElementById("tab-login").classList.toggle("active", mode === "login");
    document.getElementById("tab-register").classList.toggle("active", mode === "register");

    const authTitle = document.getElementById("auth-title");
    const submitBtn = document.getElementById("auth-submit-btn");

    if (mode === "login") {
        authTitle.innerText = "İngilizce Kelime Uygulaması";
        submitBtn.innerText = "Giriş Yap";
    } else {
        authTitle.innerText = "Hadi Kayıt Olalım 🏃‍♂️";
        submitBtn.innerText = "Hemen Kaydol";
    }

    genderBox.style.display = mode === "register" ? "flex" : "none";
    document.getElementById("password-strength-box").style.display = mode === "register" ? "flex" : "none";
    checkPasswordStrength();
}

function setGender(gender) {
    selectedGender = gender;
    document.getElementById("gender-male").classList.toggle("active", gender === "male");
    document.getElementById("gender-female").classList.toggle("active", gender === "female");
}

function checkPasswordStrength() {
    if (currentAuthMode !== "register") return;
    const pwd = document.getElementById("auth-password").value;
    const bar = document.getElementById("strength-bar");
    const txt = document.getElementById("strength-text");

    if (!pwd) {
        bar.style.width = "0%";
        txt.innerText = "Şifre giriniz";
        txt.style.color = "#94a3b8";
        return;
    }

    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) {
        bar.style.width = "30%";
        bar.style.backgroundColor = "#ef4444";
        txt.innerText = "Zayıf (Büyük harf ve rakam ekleyin)";
        txt.style.color = "#ef4444";
    } else if (score === 3 || score === 4) {
        bar.style.width = "65%";
        bar.style.backgroundColor = "#f59e0b";
        txt.innerText = "Orta (Özel karakter ekleyin)";
        txt.style.color = "#d97706";
    } else {
        bar.style.width = "100%";
        bar.style.backgroundColor = "#22c55e";
        txt.innerText = "Güçlü Şifre 🔒";
        txt.style.color = "#16a34a";
    }
}

async function submitAuth() {
    const u = document.getElementById("auth-username").value.trim();
    const p = document.getElementById("auth-password").value.trim();

    if (!u || !p) {
        authMsg.style.color = "#dc2626";
        authMsg.innerText = "Kullanıcı adı ve şifre zorunludur.";
        return;
    }

    const endpoint = currentAuthMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = { username: u, password: p, gender: selectedGender };

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
            authMsg.style.color = "#dc2626";
            authMsg.innerText = data.message || "İşlem başarısız!";
            return;
        }

        if (currentAuthMode === "register") {
            authMsg.style.color = "#16a34a";
            authMsg.innerText = "Kayıt başarılı! Şimdi giriş yapabilirsiniz.";
            setTimeout(() => switchAuthTab("login"), 1200);
        } else {
            localStorage.setItem("user", data.username);
            showLobby();
        }
    } catch (err) {
        authMsg.style.color = "#dc2626";
        authMsg.innerText = "Sunucu bağlantı hatası!";
    }
}

function logout() {
    localStorage.removeItem("user");
    location.reload();
}

function showLobby() {
    const user = localStorage.getItem("user");
    lobbyUsername.innerText = user ? user : "Kullanıcı";
    authOverlay.style.display = "none";
    quizScreen.style.display = "none";
    resultScreen.style.display = "none";
    lobbyScreen.style.display = "block";
}

// Sınav Başlatma
async function startTest() {
    try {
        const res = await fetch(`/api/quiz/start?category=${selectedCategory}`);
        if (!res.ok) throw new Error("Sunucu yanıt vermedi");
        quizQuestions = await res.json();

        if (!quizQuestions || quizQuestions.length === 0) {
            alert(`"${selectedCategory}" kategorisinde soru bulunamadı!`);
            return;
        }

        currentIndex = 0;
        correctCount = 0;
        wrongAnswers = [];

        if (sessionAnsweredCount === 0) {
            fiftyFiftyCount = 1;
            secondChanceCount = 1;
        }

        lobbyScreen.style.display = "none";
        resultScreen.style.display = "none";
        quizScreen.style.display = "block";

        renderQuestion();
    } catch (e) {
        alert("Sorular yüklenirken hata oluştu! Veritabanını kontrol edin.");
    }
}

function renderQuestion() {
    answered = false;
    secondChanceActive = false;
    nextBtn.style.display = "none";
    feedbackEl.style.display = "none";
    feedbackEl.className = "feedback";
    optionsGrid.innerHTML = "";

    closeJokerDrawer();
    updateJokersUI();

    const q = quizQuestions[currentIndex];
    questionProgress.innerText = `Soru: ${currentIndex + 1} / ${quizQuestions.length}`;
    qtypeBadge.innerText = typeLabels[q.questionType] || q.questionType;
    correctCountVal.innerText = correctCount;

    const styledPrompt = q.prompt.replace(/\*\*(.*?)\*\*/g, `<span class="target-word">$1</span>`);
    exampleEl.innerHTML = styledPrompt;

    q.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "opt-btn";
        btn.innerHTML = `<span class="opt-key">${String.fromCharCode(65 + idx)}</span> <span>${opt}</span>`;
        btn.onclick = () => selectOption(btn, opt, q);
        optionsGrid.appendChild(btn);
    });
}

// --- SÜRGÜLÜ ÇEKMECE & JOKER İŞLEMLERİ ---

function toggleJokerDrawer() {
    const drawer = document.getElementById("joker-drawer");
    if (drawer) {
        drawer.classList.toggle("open");
    }
}

function closeJokerDrawer() {
    const drawer = document.getElementById("joker-drawer");
    if (drawer) {
        drawer.classList.remove("open");
    }
}

function updateJokersUI() {
    const fiftyBtn = document.getElementById("joker-fifty");
    const secondBtn = document.getElementById("joker-second");
    const fiftyTxt = document.getElementById("joker-fifty-count");
    const secondTxt = document.getElementById("joker-second-count");

    if (!fiftyBtn || !secondBtn) return;

    fiftyTxt.innerText = fiftyFiftyCount;
    secondTxt.innerText = secondChanceCount;

    if (fiftyFiftyCount > 0 && !answered) {
        fiftyBtn.className = "drawer-joker-item active-joker";
        fiftyBtn.disabled = false;
    } else {
        fiftyBtn.className = "drawer-joker-item used-joker";
        fiftyBtn.disabled = true;
    }

    if (secondChanceCount > 0 && !answered) {
        secondBtn.className = "drawer-joker-item active-joker";
        secondBtn.disabled = false;
    } else {
        secondBtn.className = "drawer-joker-item used-joker";
        secondBtn.disabled = true;
    }
}

function useFiftyFiftyJoker() {
    if (fiftyFiftyCount <= 0 || answered) return;

    const currentQ = quizQuestions[currentIndex];
    const buttons = Array.from(optionsGrid.querySelectorAll(".opt-btn"));

    const wrongButtons = buttons.filter(btn => !btn.innerText.includes(currentQ.correctAnswer));

    wrongButtons.sort(() => Math.random() - 0.5);
    const toEliminate = wrongButtons.slice(0, 2);

    toEliminate.forEach(b => {
        b.classList.add("eliminated");
        b.disabled = true;
    });

    fiftyFiftyCount--;
    updateJokersUI();
}

function useSecondChanceJoker() {
    if (secondChanceCount <= 0 || answered) return;

    secondChanceActive = true;
    secondChanceCount--;
    updateJokersUI();

    feedbackEl.style.display = "block";
    feedbackEl.className = "feedback success";
    feedbackEl.innerText = "🛡️ İkinci Şans Koruması Aktif! Yanlış bilsen dahi 1 hakkın daha olacak.";
}

function selectOption(selectedBtn, answer, q) {
    if (answered) return;

    const isCorrect = (answer === q.correctAnswer);

    if (!isCorrect && secondChanceActive) {
        secondChanceActive = false;
        selectedBtn.classList.add("second-chance-miss");
        selectedBtn.disabled = true;

        feedbackEl.style.display = "block";
        feedbackEl.className = "feedback error";
        feedbackEl.innerText = "⚠️ İlk denemen yanlış oldu! Ama İkinci Şans hakkın sayesinde bir seçenek daha seçebilirsin.";
        return;
    }

    answered = true;
    updateJokersUI();
    closeJokerDrawer();

    const buttons = optionsGrid.querySelectorAll(".opt-btn");
    buttons.forEach(b => b.disabled = true);
    feedbackEl.style.display = "block";

    if (isCorrect) {
        selectedBtn.classList.add("correct");
        correctCount++;
        correctCountVal.innerText = correctCount;
        feedbackEl.classList.add("success");
        feedbackEl.innerText = "🎉 Harika! Doğru cevap.";
    } else {
        selectedBtn.classList.add("wrong");
        feedbackEl.classList.add("error");
        feedbackEl.innerText = `❌ Yanlış! Doğru cevap: "${q.correctAnswer}"`;

        wrongAnswers.push({
            sentence: q.prompt.replace(/\*\*/g, ""),
            chosen: answer,
            correct: q.correctAnswer
        });

        buttons.forEach(b => {
            if (b.innerText.includes(q.correctAnswer)) {
                b.classList.add("correct");
            }
        });
    }

    sessionAnsweredCount++;
    if (sessionAnsweredCount % 20 === 0) {
        fiftyFiftyCount++;
        secondChanceCount++;
        triggerTeacherCheer("🎁 20 soru tamamladın! 1'er adet Yarı Yarıya ve İkinci Şans jokeri kazandın!");
    }

    saveAnswerToDatabase(q.category || selectedCategory, isCorrect, q.prompt, answer, q.correctAnswer);

    if (currentIndex + 1 < quizQuestions.length) {
        nextBtn.innerText = "Sonraki Soru ➔";
        nextBtn.onclick = () => {
            currentIndex++;
            renderQuestion();
        };
    } else {
        nextBtn.innerText = "Sonuçları Gör 📊";
        nextBtn.onclick = finishQuiz;
    }
    nextBtn.style.display = "inline-flex";
}

function triggerTeacherCheer(message) {
    const container = document.getElementById("teacher-cheer");
    const msgEl = document.getElementById("teacher-msg");
    if (!container || !msgEl) return;

    msgEl.innerText = message;
    container.classList.add("show");

    setTimeout(() => {
        container.classList.remove("show");
    }, 4000);
}

async function saveAnswerToDatabase(category, isCorrect, prompt, chosen, correct) {
    const username = localStorage.getItem("user");
    if (!username) return;

    try {
        const res = await fetch("/api/progress/record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: username,
                category: category,
                correct: isCorrect,
                prompt: prompt,
                chosenAnswer: chosen,
                correctAnswer: correct
            })
        });

        if (res.ok) {
            await fetchUserHistory();

            const totalAnswered = userHistoryData.length;
            const totalCorrect = userHistoryData.filter(h => h.correct).length;

            if (totalAnswered === 10) triggerTeacherCheer("Tebrikler! 10 soru barajını aştın! 🎓");
            else if (totalAnswered === 100) triggerTeacherCheer("Harikasın! 100 soru barajını devirdin! 🥈");
            else if (totalAnswered === 1000) triggerTeacherCheer("İnanılmaz! Tam 1000 soru çözdün! 👑");

            if (isCorrect) {
                if (totalCorrect === 10) triggerTeacherCheer("Müthiş! 10 doğru cevaba ulaştın! 🎯");
                else if (totalCorrect === 100) triggerTeacherCheer("Büyük başarı! 100 doğru cevaba ulaştın! 🔥");
                else if (totalCorrect === 1000) triggerTeacherCheer("Efsanesin! 1000 doğru rekorunu kırdın! 💎");
            }
        }
    } catch (e) {
        console.error("Geçmiş kaydedilemedi", e);
    }
}

function finishQuiz() {
    quizScreen.style.display = "none";
    resultScreen.style.display = "block";

    const celebBox = document.getElementById("result-celebration");
    const total = quizQuestions.length;

    if (correctCount >= 6) {
        celebBox.className = "result-box passed";
        celebBox.innerHTML = `
      <h2>🎉 Tebrikler! Harika Bir Başarı</h2>
      <p style="margin-top: 8px; font-size: 16px;">${total} sorudan <strong>${correctCount} tanesini doğru</strong> yaptınız!</p>
    `;
    } else {
        celebBox.className = "result-box failed";
        celebBox.innerHTML = `
      <h2>Daha Çok Pratik Yapmalısın!</h2>
      <p style="margin-top: 8px; font-size: 16px;">${total} sorudan <strong>${correctCount} doğru</strong> yapabildiniz. 6 ve üzeri doğru için tekrar deneyin.</p>
    `;
    }

    const wrongList = document.getElementById("wrong-answers-list");
    wrongList.innerHTML = "";

    if (wrongAnswers.length === 0) {
        wrongList.innerHTML = "<p style='color: #16a34a; font-weight: 700;'>Hatasız tamamladınız! Bu testte yanlışınız yok. 🏆</p>";
    } else {
        wrongAnswers.forEach(item => {
            const row = document.createElement("div");
            row.className = "wrong-item";
            row.innerHTML = `
        <div class="sentence">"${item.sentence}"</div>
        <div class="answers">
          Seçtiğin: <span class="chosen">${item.chosen}</span> | 
          Doğru: <span class="correct">${item.correct}</span>
        </div>
      `;
            wrongList.appendChild(row);
        });
    }
}

// --- ROZETLERİM MODAL İŞLEMLERİ ---
async function openBadgesModal() {
    document.getElementById("badges-modal").style.display = "flex";
    await fetchUserHistory();
    renderBadgesFolderTabs();
    renderBadgesForCategory("all");
}

function closeBadgesModal() {
    document.getElementById("badges-modal").style.display = "none";
}

function renderBadgesFolderTabs() {
    const tabsContainer = document.getElementById("badges-tabs");
    tabsContainer.innerHTML = "";
    categories.forEach((cat, idx) => {
        const btn = document.createElement("button");
        btn.className = `folder-tab-btn ${idx === 0 ? "active" : ""}`;
        btn.innerText = cat.name;
        btn.onclick = () => {
            document.querySelectorAll("#badges-tabs .folder-tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderBadgesForCategory(cat.key);
        };
        tabsContainer.appendChild(btn);
    });
}

function renderBadgesForCategory(catKey) {
    const content = document.getElementById("badges-content");
    content.innerHTML = "";

    const filtered = (catKey === "all")
        ? userHistoryData
        : userHistoryData.filter(h => h.category && h.category.toLowerCase() === catKey.toLowerCase());

    const totalAnswered = filtered.length;
    const totalCorrect = filtered.filter(h => h.correct).length;

    const badgeMilestones = [
        { name: "İlk Adım", desc: "10 Soru Bitir", target: 10, current: totalAnswered, icon: "🥉" },
        { name: "Kararlı Öğrenci", desc: "100 Soru Bitir", target: 100, current: totalAnswered, icon: "🥈" },
        { name: "Soru Ustası", desc: "1000 Soru Bitir", target: 1000, current: totalAnswered, icon: "👑" },
        { name: "Keskin Göz", desc: "10 Doğru Yap", target: 10, current: totalCorrect, icon: "🎯" },
        { name: "Bilgi Canavarı", desc: "100 Doğru Yap", target: 100, current: totalCorrect, icon: "🔥" },
        { name: "Yenilmez Lider", desc: "1000 Doğru Yap", target: 1000, current: totalCorrect, icon: "💎" }
    ];

    badgeMilestones.forEach(b => {
        const isUnlocked = b.current >= b.target;
        const pct = Math.min(100, Math.round((b.current / b.target) * 100));

        const card = document.createElement("div");
        card.className = `badge-card ${isUnlocked ? "unlocked" : ""}`;
        card.innerHTML = `
      <div class="badge-top">
        <span class="badge-icon">${b.icon}</span>
        <div class="badge-info">
          <h4>${b.name}</h4>
          <p>${b.desc}</p>
        </div>
      </div>
      <div class="badge-progress-bg">
        <div class="badge-progress-fill" style="width: ${pct}%"></div>
      </div>
      <div style="font-size: 11px; font-weight: 700; color: #64748b; display: flex; justify-content: space-between;">
        <span>${b.current} / ${b.target}</span>
        <span>${isUnlocked ? "Tamamlandı ✅" : "%" + pct}</span>
      </div>
    `;
        content.appendChild(card);
    });
}

// --- HATALARIM & DOĞRULARIM MODAL İŞLEMLERİ ---
async function openMistakesModal() {
    document.getElementById("mistakes-modal").style.display = "flex";
    await fetchUserHistory();
    renderMistakesFolderTabs();
    renderMistakesForCategory("all");
}

function closeMistakesModal() {
    document.getElementById("mistakes-modal").style.display = "none";
}

function renderMistakesFolderTabs() {
    const tabsContainer = document.getElementById("mistakes-tabs");
    tabsContainer.innerHTML = "";
    categories.forEach((cat, idx) => {
        const btn = document.createElement("button");
        btn.className = `folder-tab-btn ${idx === 0 ? "active" : ""}`;
        btn.innerText = cat.name;
        btn.onclick = () => {
            document.querySelectorAll("#mistakes-tabs .folder-tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderMistakesForCategory(cat.key);
        };
        tabsContainer.appendChild(btn);
    });
}

function renderMistakesForCategory(catKey) {
    const content = document.getElementById("mistakes-content");
    content.innerHTML = "";

    const filtered = (catKey === "all")
        ? userHistoryData
        : userHistoryData.filter(h => h.category && h.category.toLowerCase() === catKey.toLowerCase());

    const wrongOnly = userHistoryData.filter(h => !h.correct);
    const practiceBtn = document.getElementById("btn-practice-mistakes");
    const badgeNum = document.getElementById("mistake-badge-num");

    if (practiceBtn && badgeNum) {
        badgeNum.innerText = wrongOnly.length;
        if (wrongOnly.length === 0) {
            practiceBtn.disabled = true;
            practiceBtn.title = "Harika! Çözecek hatalı sorun bulunmuyor.";
        } else {
            practiceBtn.disabled = false;
            practiceBtn.title = `${wrongOnly.length} hatandan oluşan telafi testini başlat`;
        }
    }

    if (filtered.length === 0) {
        content.innerHTML = "<p style='color: #64748b; font-weight: 700; text-align: center; padding: 30px;'>Bu kategoride henüz çözülmüş soru geçmişiniz bulunmuyor.</p>";
        return;
    }

    [...filtered].reverse().forEach(item => {
        const card = document.createElement("div");
        card.className = `history-card ${item.correct ? "is-correct" : "is-wrong"}`;
        card.innerHTML = `
      <div class="history-prompt">${item.correct ? "✅" : "❌"} "${item.prompt.replace(/\*\*/g, "")}"</div>
      <div class="history-meta">
        <span>Senin Cevabın: <strong>${item.chosenAnswer}</strong></span>
        ${!item.correct ? `<span>Doğru Cevap: <strong style="color: #10b981;">${item.correctAnswer}</strong></span>` : ""}
      </div>
    `;
        content.appendChild(card);
    });
}

// --- 🎯 HATALARIMDAN SINAV OL (GARANTİLİ VE KAPSAMLI MOD) ---
async function startMistakePracticeQuiz() {
    const wrongOnly = userHistoryData.filter(h => !h.correct);
    if (wrongOnly.length === 0) {
        alert("Tebrikler! Çözülecek hiç hatalı sorun yok. 🏆");
        return;
    }

    try {
        const res = await fetch("/api/quiz/start?category=all");
        const allQuestions = await res.json();

        const wrongPrompts = [...new Set(wrongOnly.map(w => w.prompt.trim()))];
        let mistakeQuizPool = [];

        wrongPrompts.forEach(pText => {
            const cleanTarget = pText.replace(/\*\*/g, "").trim().toLowerCase();
            const matched = allQuestions.find(q => {
                const cleanQ = q.prompt.replace(/\*\*/g, "").trim().toLowerCase();
                return cleanQ === cleanTarget || cleanQ.includes(cleanTarget.substring(0, 15));
            });

            if (matched && !mistakeQuizPool.some(m => m.id === matched.id)) {
                mistakeQuizPool.push(matched);
            }
        });

        if (mistakeQuizPool.length < wrongPrompts.length) {
            wrongOnly.forEach(w => {
                if (!mistakeQuizPool.some(m => m.prompt === w.prompt)) {
                    mistakeQuizPool.push({
                        id: w.id || Math.floor(Math.random() * 100000),
                        category: w.category || "all",
                        questionType: "MEANING",
                        prompt: w.prompt,
                        correctAnswer: w.correctAnswer,
                        options: [w.correctAnswer, w.chosenAnswer, "None of the above", "Alternative"].sort(() => Math.random() - 0.5)
                    });
                }
            });
        }

        if (mistakeQuizPool.length < 10 && allQuestions.length > 0) {
            allQuestions.sort(() => Math.random() - 0.5);
            for (const q of allQuestions) {
                if (!mistakeQuizPool.some(m => m.prompt === q.prompt)) {
                    mistakeQuizPool.push(q);
                }
                if (mistakeQuizPool.length >= 10) break;
            }
        }

        mistakeQuizPool.sort(() => Math.random() - 0.5);
        quizQuestions = mistakeQuizPool.slice(0, 10);

        closeMistakesModal();

        currentIndex = 0;
        correctCount = 0;
        wrongAnswers = [];

        lobbyScreen.style.display = "none";
        resultScreen.style.display = "none";
        quizScreen.style.display = "block";

        renderQuestion();
        triggerTeacherCheer(`🎯 ${quizQuestions.length} soruluk telafi sınavın başladı!`);
    } catch (err) {
        console.error("Hata sınavı hatası:", err);
        alert("Telafi sınavı başlatılırken hata oluştu!");
    }
}

async function fetchUserHistory() {
    const username = localStorage.getItem("user");
    if (!username) return;

    try {
        const res = await fetch(`/api/progress/history/${username}`);
        if (res.ok) {
            userHistoryData = await res.json();
        }
    } catch (e) {
        console.error("Geçmiş çekilemedi", e);
    }
}

const savedUser = localStorage.getItem("user");
if (savedUser) {
    showLobby();
}