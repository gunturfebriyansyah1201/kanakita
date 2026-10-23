/**
 * Kanakita - Main Application Logic
 * Integrates navigation, mobile bottom bar, modals, flashcards, quizzes, and state updates.
 */

// ── Sound Row Group Definitions ──────────────────────────────────────────────
const SOUND_GROUPS = {
  a:   { name: 'A',   title: 'Baris A  (A・I・U・E・O)',         icon: '🔴', desc: 'Vokal Dasar' },
  ka:  { name: 'KA',  title: 'Baris KA (Ka・Ki・Ku・Ke・Ko)',    icon: '🟠', desc: 'Bunyi K' },
  sa:  { name: 'SA',  title: 'Baris SA (Sa・Shi・Su・Se・So)',   icon: '🟡', desc: 'Bunyi S' },
  ta:  { name: 'TA',  title: 'Baris TA (Ta・Chi・Tsu・Te・To)', icon: '🟢', desc: 'Bunyi T' },
  na:  { name: 'NA',  title: 'Baris NA (Na・Ni・Nu・Ne・No)',    icon: '🔵', desc: 'Bunyi N' },
  ha:  { name: 'HA',  title: 'Baris HA (Ha・Hi・Fu・He・Ho)',    icon: '🟣', desc: 'Bunyi H' },
  ma:  { name: 'MA',  title: 'Baris MA (Ma・Mi・Mu・Me・Mo)',    icon: '🌸', desc: 'Bunyi M' },
  ya:  { name: 'YA',  title: 'Baris YA (Ya・Yu・Yo)',           icon: '🌙', desc: 'Bunyi Y' },
  ra:  { name: 'RA',  title: 'Baris RA (Ra・Ri・Ru・Re・Ro)',    icon: '⛩️',  desc: 'Bunyi R' },
  wa:  { name: 'WA',  title: 'Baris WA + N (Wa・Wo・N)',        icon: '🌊', desc: 'Bunyi W + N' },
  ga:  { name: 'GA',  title: 'Baris GA (Ga・Gi・Gu・Ge・Go)',    icon: '🔥', desc: 'Dakuten K → G' },
  za:  { name: 'ZA',  title: 'Baris ZA (Za・Ji・Zu・Ze・Zo)',   icon: '⚡',  desc: 'Dakuten S → Z' },
  da:  { name: 'DA',  title: 'Baris DA (Da・Di・Du・De・Do)',    icon: '🎲', desc: 'Dakuten T → D' },
  ba:  { name: 'BA',  title: 'Baris BA (Ba・Bi・Bu・Be・Bo)',    icon: '🎈', desc: 'Dakuten H → B' },
  pa:  { name: 'PA',  title: 'Baris PA (Pa・Pi・Pu・Pe・Po)',    icon: '🐼', desc: 'Handakuten H → P' },
  kya: { name: 'KYA', title: 'Yōon KYA (Kya・Kyu・Kyo)',       icon: '💜', desc: 'Ki + ya/yu/yo' },
  sha: { name: 'SHA', title: 'Yōon SHA (Sha・Shu・Sho)',        icon: '🌟', desc: 'Shi + ya/yu/yo' },
  cha: { name: 'CHA', title: 'Yōon CHA (Cha・Chu・Cho)',        icon: '🍵', desc: 'Chi + ya/yu/yo' },
  nya: { name: 'NYA', title: 'Yōon NYA (Nya・Nyu・Nyo)',        icon: '🐱', desc: 'Ni + ya/yu/yo' },
  hya: { name: 'HYA', title: 'Yōon HYA (Hya・Hyu・Hyo)',       icon: '❄️',  desc: 'Hi + ya/yu/yo' },
  mya: { name: 'MYA', title: 'Yōon MYA (Mya・Myu・Myo)',       icon: '🎶', desc: 'Mi + ya/yu/yo' },
  rya: { name: 'RYA', title: 'Yōon RYA (Rya・Ryu・Ryo)',       icon: '🐉', desc: 'Ri + ya/yu/yo' },
  gya: { name: 'GYA', title: 'Yōon GYA (Gya・Gyu・Gyo)',       icon: '🥩', desc: 'Gi + ya/yu/yo' },
  ja:  { name: 'JA',  title: 'Yōon JA  (Ja・Ju・Jo)',           icon: '🧃', desc: 'Ji + ya/yu/yo' },
  jya: { name: 'JYA', title: 'Yōon JYA (Jya・Jyu・Jyo)',       icon: '⚡',  desc: 'Dji + ya/yu/yo' },
  bya: { name: 'BYA', title: 'Yōon BYA (Bya・Byu・Byo)',       icon: '🏥', desc: 'Bi + ya/yu/yo' },
  pya: { name: 'PYA', title: 'Yōon PYA (Pya・Pyu・Pyo)',       icon: '🐇', desc: 'Pi + ya/yu/yo' }
};

const BADGES_DATA = [
  { id: 'first_step', name: 'Langkah Pertama', icon: '🌱', desc: 'Mulai perjalanan belajar kana.' },
  { id: 'streak_3', name: 'Konsisten', icon: '🔥', desc: 'Belajar selama 3 hari berturut-turut.' },
  { id: 'hiragana_master', name: 'Master Hiragana', icon: 'ひ', desc: 'Kuasai setidaknya 46 huruf kana.' },
  { id: 'quiz_champion', name: 'Ranking 1', icon: '🏆', desc: 'Raih akurasi 100% dalam kuis.' }
];

const VOCABULARY_CHAR_ALIASES = { 'ぢゃ': 'じゃ', 'ぢゅ': 'じゅ', 'ぢょ': 'じょ' };
const ROMAJI_TO_HIRAGANA = {
  kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ', sha: 'しゃ', shu: 'しゅ', sho: 'しょ',
  cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ', nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ',
  hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ', mya: 'みゃ', myu: 'みゅ', myo: 'みょ',
  rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ', gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
  ja: 'じゃ', ju: 'じゅ', jo: 'じょ', jya: 'じゃ', jyu: 'じゅ', jyo: 'じょ',
  bya: 'びゃ', byu: 'びゅ', byo: 'びょ', pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ',
  shi: 'し', chi: 'ち', tsu: 'つ', fu: 'ふ', ji: 'じ', si: 'し', ti: 'ち', tu: 'つ',
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ', sa: 'さ', su: 'す', se: 'せ', so: 'そ',
  ta: 'た', te: 'て', to: 'と', na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  ha: 'は', hi: 'ひ', he: 'へ', ho: 'ほ', ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
  ya: 'や', yu: 'ゆ', yo: 'よ', ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
  wa: 'わ', wo: 'を', ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  za: 'ざ', zu: 'ず', ze: 'ぜ', zo: 'ぞ', da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
  ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ', pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お', n: 'ん'
};

let HIRAGANA_VOCABULARY_READINGS = null;
let KATAKANA_VOCABULARY_BY_CHAR = null;

function toHiragana(text) {
  return Array.from(text, char => {
    const codePoint = char.codePointAt(0);
    return codePoint >= 0x30a1 && codePoint <= 0x30f6 ? String.fromCodePoint(codePoint - 0x60) : char;
  }).join('');
}

function romajiToHiragana(romaji) {
  const value = romaji.toLowerCase().replace(/[ā]/g, 'aa').replace(/[ī]/g, 'ii').replace(/[ū]/g, 'uu').replace(/[ē]/g, 'ei').replace(/[ō]/g, 'ou').replace(/[^a-z]/g, '');
  const syllables = Object.keys(ROMAJI_TO_HIRAGANA).sort((left, right) => right.length - left.length);
  let result = '';
  let index = 0;

  while (index < value.length) {
    const current = value[index];
    if (index + 1 < value.length && current === value[index + 1] && !'aeioun'.includes(current)) {
      result += 'っ';
      index++;
      continue;
    }
    if (current === 'n' && (index + 1 === value.length || (!'aeioyu'.includes(value[index + 1]) && value[index + 1] !== 'n'))) {
      result += 'ん';
      index++;
      continue;
    }

    const syllable = syllables.find(candidate => value.startsWith(candidate, index));
    if (!syllable) return '';
    result += ROMAJI_TO_HIRAGANA[syllable];
    index += syllable.length;
  }
  return result;
}

function getKanaVocabulary(kanaItem, system = kanaItem.type) {
  if (system === 'katakana') return getUniqueKatakanaVocabulary(kanaItem);
  return getKanaVocabularyCandidates(kanaItem, system).slice(0, 4);
}

function getUniqueKatakanaVocabulary(kanaItem) {
  if (!KATAKANA_VOCABULARY_BY_CHAR) {
    const usedWords = new Set();
    KATAKANA_VOCABULARY_BY_CHAR = new Map();

    KANA_DATA.katakana.forEach(item => {
      const selected = getKanaVocabularyCandidates(item, 'katakana')
        .filter(entry => !usedWords.has(entry.word))
        .slice(0, 4);
      selected.forEach(entry => usedWords.add(entry.word));
      KATAKANA_VOCABULARY_BY_CHAR.set(item.char, selected);
    });
  }

  return KATAKANA_VOCABULARY_BY_CHAR.get(kanaItem.char) || [];
}

function getKanaVocabularyCandidates(kanaItem, system) {
  const target = toHiragana(kanaItem.char);
  const matchingText = VOCABULARY_CHAR_ALIASES[target] || target;
  const scriptPattern = system === 'katakana' ? /^[\p{Script=Katakana}ー]+$/u : /^[\p{Script=Hiragana}ー]+$/u;
  const entries = (KANA_DATA[system] || []).flatMap(item => (item.vocab || []).map(vocab => {
    const word = system === 'katakana'
      ? vocab.word
      : vocab.kana
        ? toHiragana(vocab.kana)
        : scriptPattern.test(vocab.word)
          ? toHiragana(vocab.word)
            : /\p{Script=Han}/u.test(vocab.word)
              ? romajiToHiragana(vocab.romaji)
              : '';
    return { word, romaji: vocab.romaji, meaning: vocab.meaning };
  }));
  const hiraganaReadings = system === 'katakana' ? getHiraganaVocabularyReadings() : null;
  const uniqueEntries = new Map();

  entries.forEach(entry => {
    if (!entry.word || !scriptPattern.test(entry.word)) return;
    const normalizedWord = toHiragana(entry.word);
    if (normalizedWord.length <= matchingText.length || !normalizedWord.includes(matchingText)) return;
    if (hiraganaReadings && hiraganaReadings.has(normalizedWord)) return;
    if (!uniqueEntries.has(entry.word)) uniqueEntries.set(entry.word, entry);
  });

  const candidates = [...uniqueEntries.values()];
  candidates.sort((left, right) => Number(toHiragana(right.word).startsWith(matchingText)) - Number(toHiragana(left.word).startsWith(matchingText)));
  return candidates;
}

function getHiraganaVocabularyReadings() {
  if (!HIRAGANA_VOCABULARY_READINGS) {
    HIRAGANA_VOCABULARY_READINGS = new Set(KANA_DATA.hiragana.flatMap(item =>
      getKanaVocabulary(item, 'hiragana').map(vocab => toHiragana(vocab.word))
    ));
  }
  return HIRAGANA_VOCABULARY_READINGS;
}

document.addEventListener('DOMContentLoaded', () => {
  // Global State Variables
  let currentSystem = 'hiragana'; // 'hiragana' | 'katakana'
  let currentCategory = 'all'; // 'all' | 'basic' | 'dakuten' | 'yoon' | 'yoon-dakuten'
  let activeModalKana = null;
  let activeCanvas = null;
  let strokeVideoPlayer = null;

  // Flashcard State
  let flashcardIndex = 0;
  let flashcardDeck = [];
  let isCardFlipped = false;

  // Quiz State
  let quizQuestions = [];
  let currentQuizIndex = 0;
  let quizScore = 0;
  let quizTimer = null;
  let quizAdvanceTimeout = null;
  let quizTimeLeft = 15;
  let quizUserAnswers = [];
  let isQuizRunning = false;

  // Initialize UI
  initNavigation();
  initAuthUI();
  renderKanaGrid();
  renderVocabSection();
  initFlashcardDeck();
  renderProfile();

  // --------------------------------------------------------------------------
  // 1. Navigation & Mobile Bottom Bar Handlers
  // --------------------------------------------------------------------------
  function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-link, .mobile-nav-btn, [data-tab]');
    navButtons.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetTab = link.getAttribute('data-tab');
        if (!targetTab) return;

        audioController.playClick();

        if (targetTab !== 'kuis' && isQuizRunning) {
          stopQuiz(false);
        }
        
        // Update Desktop Nav Link Active States
        document.querySelectorAll('.nav-link').forEach(l => {
          l.classList.toggle('active', l.getAttribute('data-tab') === targetTab);
        });

        // Update Mobile Bottom Nav Active States
        document.querySelectorAll('.mobile-nav-btn').forEach(m => {
          m.classList.toggle('active', m.getAttribute('data-tab') === targetTab);
        });

        // Show Corresponding Tab Pane
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        const activePane = document.getElementById(`tab-${targetTab}`);
        if (activePane) activePane.classList.add('active');

        // Trigger tab specific setup
        if (targetTab === 'flashcard') {
          initFlashcardDeck();
        } else if (targetTab === 'profil') {
          renderProfile();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // Mute Sound Toggle Button
    const muteBtn = document.getElementById('mute-toggle-btn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = audioController.toggleMute();
        muteBtn.innerHTML = isMuted ? '🔇 Audio Off' : '🔊 Audio On';
      });
    }
  }

  // --------------------------------------------------------------------------
  // 2. Authentication UI & Modals
  // --------------------------------------------------------------------------
  function initAuthUI() {
    const loginModal = document.getElementById('auth-modal');
    const loginBtn = document.getElementById('user-profile-pill');
    const authCloseBtn = document.getElementById('auth-modal-close');
    const authForm = document.getElementById('auth-form');
    const authToggleTab = document.getElementById('auth-toggle-mode');
    const guestModeBtn = document.getElementById('profile-guest-btn');
    const usernameMenu = document.getElementById('profile-username-menu');
    const editUsernameBtn = document.getElementById('profile-edit-username-btn');
    const usernameForm = document.getElementById('profile-username-form');
    const usernameInput = document.getElementById('profile-username-input');
    const usernameCancelBtn = document.getElementById('profile-username-cancel');
    const usernameFeedback = document.getElementById('profile-username-feedback');
    const passwordInput = document.getElementById('auth-pass');
    const passwordToggle = document.getElementById('auth-pass-toggle');

    let authMode = 'login'; // 'login' | 'register'

    function setPasswordVisibility(isVisible) {
      passwordInput.type = isVisible ? 'text' : 'password';
      passwordToggle.textContent = isVisible ? 'Sembunyikan' : 'Tampilkan';
      passwordToggle.setAttribute('aria-label', `${isVisible ? 'Sembunyikan' : 'Tampilkan'} kata sandi`);
      passwordToggle.setAttribute('aria-pressed', String(isVisible));
    }

    function setAuthMode(mode) {
      authMode = mode;
      setPasswordVisibility(false);
      document.getElementById('auth-modal-title').textContent = authMode === 'login' ? 'Masuk ke Kanakita' : 'Daftar Akun Baru';
      document.getElementById('auth-submit-btn').textContent = authMode === 'login' ? 'Masuk' : 'Daftar';
      document.getElementById('auth-username-field').style.display = authMode === 'login' ? 'none' : 'block';
      authToggleTab.textContent = authMode === 'login' ? 'Belum punya akun? Daftar gratis' : 'Sudah punya akun? Masuk di sini';
    }

    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        audioController.playClick();
        setAuthMode('login');
        loginModal.classList.add('active');
      });
    }

    if (editUsernameBtn && usernameForm) {
      editUsernameBtn.addEventListener('click', () => {
        audioController.playClick();
        usernameInput.value = authController.user.username;
        usernameFeedback.textContent = '';
        usernameInput.focus();
      });
    }

    if (usernameCancelBtn && usernameForm) {
      usernameCancelBtn.addEventListener('click', () => {
        usernameMenu.open = false;
        editUsernameBtn.focus();
      });
    }

    if (usernameForm) {
      usernameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const result = authController.updateUsername(usernameInput.value);
        usernameFeedback.textContent = result.message;
        if (!result.success) return;

        updateUserNavPill();
        renderProfile();
        usernameMenu.open = false;
        editUsernameBtn.focus();
      });
    }

    if (authCloseBtn) {
      authCloseBtn.addEventListener('click', () => {
        loginModal.classList.remove('active');
        setPasswordVisibility(false);
      });
    }

    if (passwordToggle) {
      passwordToggle.addEventListener('click', () => {
        setPasswordVisibility(passwordInput.type === 'password');
      });
    }

    if (authToggleTab) {
      authToggleTab.addEventListener('click', () => {
        setAuthMode(authMode === 'login' ? 'register' : 'login');
      });
    }

    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-pass').value;
        const username = document.getElementById('auth-username').value;
        const submitButton = document.getElementById('auth-submit-btn');

        submitButton.disabled = true;
        let res;
        try {
          if (authMode === 'login') {
            res = await authController.login(email, pass);
          } else {
            res = await authController.register(username, email, pass);
          }
        } finally {
          submitButton.disabled = false;
        }

        if (res.success) {
          audioController.playCorrect();
          alert(res.message);
          loginModal.classList.remove('active');
          updateUserNavPill();
          renderKanaGrid();
          renderProfile();
        } else {
          audioController.playWrong();
          alert(res.message);
        }
      });
    }

    if (guestModeBtn) {
      guestModeBtn.addEventListener('click', () => {
        if (!authController.user.isLoggedIn) return;
        authController.logout();
        updateUserNavPill();
        renderKanaGrid();
        renderProfile();
      });
    }

    updateUserNavPill();
  }

  function updateUserNavPill() {
    const userPill = document.getElementById('user-profile-pill');
    const streakCount = document.getElementById('streak-count-display');

    if (userPill) {
      const displayName = authController.user.isLoggedIn ? authController.user.username : 'Login';
      userPill.innerHTML = `${authController.user.avatar} <span>${displayName}</span>`;
    }

    if (streakCount) {
      streakCount.textContent = `${authController.user.streakDays} Hari`;
    }
  }

  // --------------------------------------------------------------------------
  // 3. Kana Grid View & Filters (Melihat Huruf)
  // --------------------------------------------------------------------------
  function renderKanaGrid() {
    const container = document.getElementById('kana-grid');
    if (!container) return;

    // System Filter Events
    const systemFilterBtns = document.querySelectorAll('[data-system-filter]');
    systemFilterBtns.forEach(btn => {
      btn.onclick = () => {
        systemFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSystem = btn.getAttribute('data-system-filter');
        renderKanaGrid();
      };
    });

    // Category Filter Events
    const categoryFilterBtns = document.querySelectorAll('[data-category-filter]');
    categoryFilterBtns.forEach(btn => {
      btn.onclick = () => {
        categoryFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category-filter');
        renderKanaGrid();
      };
    });

    let rawList = KANA_DATA[currentSystem] || [];
    let list = rawList;
    if (currentCategory !== 'all') {
      list = rawList.filter(k => k.category === currentCategory);
    }

    // Group items by Sound Row Family
    const grouped = {};
    const groupOrder = [];

    list.forEach(item => {
      let key = item.group;
      if (key === 'n') key = 'wa';

      if (!grouped[key]) {
        grouped[key] = [];
        groupOrder.push(key);
      }
      grouped[key].push(item);
    });

    if (groupOrder.length === 0) {
      container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px 0;">Tidak ada huruf dalam kategori atau sound baris ini.</p>';
      return;
    }

    container.innerHTML = groupOrder.map(gKey => {
      const groupItems = grouped[gKey];
      const info = SOUND_GROUPS[gKey] || { title: `Baris ${gKey.toUpperCase()}`, icon: '📌' };

      const cardsHTML = groupItems.map(item => {
        const isMastered = authController.isKanaMastered(item.char);
        let catBadge = ' Dasar';
        if (item.category === 'dakuten') catBadge = ' Dakuten';
        else if (item.category === 'yoon') catBadge = ' Yōon';
        else if (item.category === 'yoon-dakuten') catBadge = ' Yōon+Daku';

        return `
          <div class="kana-card ${isMastered ? 'mastered' : ''}" data-char="${item.char}">
            ${isMastered ? '<span class="mastered-check">✓</span>' : ''}
            <div class="kana-char">${item.char}</div>
            <div class="kana-romaji">${item.romaji}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">${catBadge}</div>
            <div class="audio-btn-icon" style="margin-top: 6px;">🔊 Dengarkan</div>
          </div>
        `;
      }).join('');

      return `
        <div class="kana-sound-group">
          <div class="kana-sound-group-header">
            <h3 class="kana-sound-group-title">${info.icon} ${info.title}</h3>
            <span class="kana-sound-group-badge">${groupItems.length} Huruf</span>
          </div>
          <div class="kana-grid-container">
            ${cardsHTML}
          </div>
        </div>
      `;
    }).join('');

    // Bind Card Click -> Open Detail Modal
    container.querySelectorAll('.kana-card').forEach(card => {
      card.addEventListener('click', () => {
        const charStr = card.getAttribute('data-char');
        const kanaItem = rawList.find(k => k.char === charStr);
        if (kanaItem) {
          audioController.speakJapanese(kanaItem.char);
          openKanaModal(kanaItem);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 4. Modal Kana Detail (Stroke order animation & Interactive Writing Canvas)
  // --------------------------------------------------------------------------
  function openKanaModal(kanaItem) {
    activeModalKana = kanaItem;
    const modal = document.getElementById('kana-detail-modal');
    if (!modal) return;

    // Fill Modal Data
    document.getElementById('modal-kana-char').textContent = kanaItem.char;
    document.getElementById('modal-kana-romaji').textContent = `Romaji: /${kanaItem.romaji}/ • System: ${kanaItem.type.toUpperCase()}`;

    // Audio Play button inside Modal
    const playAudioModalBtn = document.getElementById('modal-audio-btn');
    if (playAudioModalBtn) {
      playAudioModalBtn.onclick = () => {
        audioController.speakJapanese(kanaItem.char);
      };
    }

    // Toggle Mastered Button
    const masterToggleBtn = document.getElementById('modal-master-toggle');
    if (masterToggleBtn) {
      const isMastered = authController.isKanaMastered(kanaItem.char);
      masterToggleBtn.textContent = isMastered ? '✓ Dikuasai (Lepas)' : '⭐ Tandai Dikuasai';
      masterToggleBtn.className = isMastered ? 'btn btn-secondary' : 'btn btn-outline';

      masterToggleBtn.onclick = () => {
        const nowMastered = authController.toggleMasteredKana(kanaItem.char);
        audioController.playCorrect();
        masterToggleBtn.textContent = nowMastered ? '✓ Dikuasai (Lepas)' : '⭐ Tandai Dikuasai';
        masterToggleBtn.className = nowMastered ? 'btn btn-secondary' : 'btn btn-outline';
        renderKanaGrid();
        renderProfile();
      };
    }

    // Initialize Stroke Video Player
    if (!strokeVideoPlayer) {
      strokeVideoPlayer = new StrokeVideoPlayer('modal-stroke-anim-container');
    }
    const strokeGifUrl = kanaItem.category === 'basic'
      ? `https://jepang.org/images/tutorial/${kanaItem.type}/${kanaItem.romaji}${kanaItem.type === 'katakana' ? 'k' : ''}.gif`
      : null;
    const strokeControls = [
      document.getElementById('stroke-step-badge'),
      document.querySelector('.stroke-speed-wrapper'),
      document.querySelector('.stroke-video-timeline-bar'),
      document.querySelector('.stroke-video-controls')
    ];
    const strokeSourceLink = document.getElementById('stroke-source-link');

    if (strokeGifUrl) {
      strokeVideoPlayer.pause();
      strokeControls.forEach(control => { if (control) control.hidden = true; });
      strokeSourceLink.href = `https://jepang.org/tutorial/huruf-${kanaItem.type}-dan-cara-penulisannya`;
      strokeSourceLink.textContent = 'Sumber animasi: Jepang.org';
      strokeSourceLink.hidden = false;

      const strokeGif = document.createElement('img');
      strokeGif.className = 'stroke-reference-gif';
      strokeGif.src = strokeGifUrl;
      strokeGif.alt = `Urutan goresan ${kanaItem.char}`;
      strokeGif.onerror = () => {
        strokeSourceLink.hidden = true;
        strokeControls.forEach(control => { if (control) control.hidden = false; });
        strokeVideoPlayer.load(kanaItem.strokePaths || []);
      };
      strokeVideoPlayer.container.replaceChildren(strokeGif);
    } else {
      strokeSourceLink.hidden = true;
      strokeControls.forEach(control => { if (control) control.hidden = false; });
      strokeVideoPlayer.load(kanaItem.strokePaths || []);
    }

    // Initialize Interactive Writing Canvas
    setTimeout(() => {
      activeCanvas = new WritingCanvas('modal-user-canvas');

      const clearCanvasBtn = document.getElementById('clear-canvas-btn');
      if (clearCanvasBtn) {
        clearCanvasBtn.onclick = () => {
          audioController.playClick();
          if (activeCanvas) activeCanvas.clear();
        };
      }
    }, 100);

    // Render Vocab List inside Modal
    const modalVocabList = document.getElementById('modal-vocab-list');
    const kanaVocabulary = getKanaVocabulary(kanaItem);
    if (modalVocabList) {
      modalVocabList.innerHTML = kanaVocabulary.map(v => `
        <div class="vocab-item" onclick="audioController.speakJapanese('${v.word}')">
          <div>
            <span class="vocab-japanese">${v.word}</span>
            <span class="vocab-romaji">(${v.romaji})</span>
          </div>
          <div>
            <strong>${v.meaning}</strong>
            <span style="margin-left: 8px; cursor: pointer;">🔊</span>
          </div>
        </div>
      `).join('');
    }

    modal.classList.add('active');

    const modalClose = document.getElementById('modal-close-btn');
    if (modalClose) {
      modalClose.onclick = () => {
        if (strokeVideoPlayer) strokeVideoPlayer.pause();
        modal.classList.remove('active');
      };
    }
  }

  // --------------------------------------------------------------------------
  // 6. Contoh Kosakata Section (Hiragana/Katakana Gallery & Live Search)
  // --------------------------------------------------------------------------
  function renderVocabSection() {
    const container = document.getElementById('vocab-gallery-grid');
    const searchInput = document.getElementById('vocab-search-input');
    if (!container) return;

    const systemFilters = document.querySelectorAll('[data-vocab-system]');
    let selectedSystem = 'hiragana';

    function displayVocab(filterQuery = '') {
      const query = filterQuery.toLowerCase().trim();
      const allVocab = KANA_DATA[selectedSystem].flatMap(item => getKanaVocabulary(item, selectedSystem).map(vocab => ({
        ...vocab,
        keyChar: item.char
      })));
      const filtered = allVocab.filter(v => 
        v.word.toLowerCase().includes(query) ||
        v.romaji.toLowerCase().includes(query) ||
        v.meaning.toLowerCase().includes(query)
      );

      if (filtered.length === 0) {
        container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px 0;">Tidak ada kosakata yang cocok dengan "${filterQuery}".</p>`;
        return;
      }

      container.innerHTML = filtered.map(v => `
        <div class="vocab-item" style="padding: 16px; background: white; box-shadow: var(--shadow-sm); border-radius: var(--radius-md); border: 1px solid var(--border-light); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: var(--transition);" onclick="audioController.speakJapanese('${v.word}')">
          <div>
            <div class="vocab-japanese" style="font-size: 1.4rem; color: var(--primary); font-weight: 700;">${v.word}</div>
            <div class="vocab-romaji" style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary);">/${v.romaji}/</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.9rem;">${v.meaning}</div>
            <div style="display: flex; gap: 4px; justify-content: flex-end; margin-top: 6px;">
              <span class="badge" style="background: var(--bg-main); color: var(--text-secondary); font-size: 0.7rem; padding: 2px 6px;">${selectedSystem === 'hiragana' ? 'Hiragana' : 'Katakana'} ${v.keyChar}</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    systemFilters.forEach(button => {
      button.addEventListener('click', () => {
        selectedSystem = button.getAttribute('data-vocab-system');
        systemFilters.forEach(filter => {
          const isSelected = filter === button;
          filter.classList.toggle('active', isSelected);
          filter.setAttribute('aria-pressed', String(isSelected));
        });
        displayVocab(searchInput ? searchInput.value : '');
      });
    });

    displayVocab(searchInput ? searchInput.value : '');

    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = "true";
      searchInput.addEventListener('input', (e) => {
        displayVocab(e.target.value);
      });
    }
  }

  // --------------------------------------------------------------------------
  // 7. Flashcards Interactive Module (3D Flip)
  // --------------------------------------------------------------------------
  function initFlashcardDeck() {
    flashcardDeck = [...KANA_DATA.hiragana];
    flashcardIndex = 0;
    isCardFlipped = false;
    renderFlashcard();

    const flashcardEl = document.getElementById('flashcard-object');
    if (flashcardEl) {
      flashcardEl.onclick = () => {
        audioController.playClick();
        isCardFlipped = !isCardFlipped;
        flashcardEl.classList.toggle('is-flipped', isCardFlipped);
      };
    }

    const prevBtn = document.getElementById('fc-prev-btn');
    const nextBtn = document.getElementById('fc-next-btn');

    if (prevBtn) {
      prevBtn.onclick = () => {
        if (flashcardIndex > 0) {
          flashcardIndex--;
          isCardFlipped = false;
          if (flashcardEl) flashcardEl.classList.remove('is-flipped');
          renderFlashcard();
        }
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        if (flashcardIndex < flashcardDeck.length - 1) {
          flashcardIndex++;
          isCardFlipped = false;
          if (flashcardEl) flashcardEl.classList.remove('is-flipped');
          renderFlashcard();
        }
      };
    }
  }

  function renderFlashcard() {
    const item = flashcardDeck[flashcardIndex];
    if (!item) return;

    document.getElementById('fc-front-char').textContent = item.char;
    document.getElementById('fc-back-romaji').textContent = `/${item.romaji}/`;
    document.getElementById('fc-counter-display').textContent = `${flashcardIndex + 1} / ${flashcardDeck.length}`;

    // Play pronunciation audio
    audioController.speakJapanese(item.char);
  }

  // --------------------------------------------------------------------------
  // 8. Timed Quiz Engine (Kuis Interaktif)
  // --------------------------------------------------------------------------
  const startQuizBtn = document.getElementById('start-quiz-btn');
  const stopQuizBtn = document.getElementById('stop-quiz-btn');
  const quizResultsMenuBtn = document.getElementById('quiz-results-menu-btn');
  if (startQuizBtn) {
    startQuizBtn.addEventListener('click', startNewQuiz);
  }
  if (stopQuizBtn) {
    stopQuizBtn.addEventListener('click', stopQuiz);
  }
  if (quizResultsMenuBtn) {
    quizResultsMenuBtn.addEventListener('click', stopQuiz);
  }

  function startNewQuiz() {
    audioController.playClick();
    clearTimeout(quizAdvanceTimeout);
    quizAdvanceTimeout = null;
    isQuizRunning = true;
    document.getElementById('tab-kuis').classList.remove('quiz-menu-centered');
    
    // Generate 10 Random Quiz Questions
    const pool = [...KANA_DATA.hiragana, ...KANA_DATA.katakana];
    const shuffled = pool.sort(() => 0.5 - Math.random());
    quizQuestions = shuffled.slice(0, 10);
    
    currentQuizIndex = 0;
    quizScore = 0;
    quizUserAnswers = [];

    document.getElementById('quiz-intro-view').style.display = 'none';
    document.getElementById('quiz-active-view').style.display = 'block';
    document.getElementById('quiz-results-view').style.display = 'none';

    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    if (currentQuizIndex >= quizQuestions.length) {
      finishQuiz();
      return;
    }

    const currentQ = quizQuestions[currentQuizIndex];
    
    // Update Question Info UI
    document.getElementById('quiz-question-num').textContent = `Soal ${currentQuizIndex + 1} / 10`;
    document.getElementById('quiz-char-display').textContent = currentQ.char;
    
    // Progress Bar Fill
    const progressPercent = ((currentQuizIndex) / 10) * 100;
    document.getElementById('quiz-progress-fill').style.width = `${progressPercent}%`;

    // Speak character
    audioController.speakJapanese(currentQ.char);

    // Generate 4 Option Choices (1 Correct, 3 Distractors)
    const pool = [...KANA_DATA.hiragana, ...KANA_DATA.katakana];
    const distractors = pool.filter(k => k.romaji !== currentQ.romaji)
                            .sort(() => 0.5 - Math.random())
                            .slice(0, 3);

    const choices = [currentQ, ...distractors].sort(() => 0.5 - Math.random());

    const optionsContainer = document.getElementById('quiz-options-container');
    optionsContainer.innerHTML = choices.map(choice => `
      <button class="quiz-option-btn" data-romaji="${choice.romaji}">
        /${choice.romaji}/
      </button>
    `).join('');

    // Start 15s Countdown Timer
    resetQuizTimer();

    // Option Click Listener
    optionsContainer.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        clearInterval(quizTimer);
        const selectedRomaji = btn.getAttribute('data-romaji');
        const isCorrect = selectedRomaji === currentQ.romaji;

        if (isCorrect) {
          audioController.playCorrect();
          btn.classList.add('correct');
          quizScore += 10;
        } else {
          audioController.playWrong();
          btn.classList.add('wrong');
          // Highlight correct button
          const correctBtn = optionsContainer.querySelector(`[data-romaji="${currentQ.romaji}"]`);
          if (correctBtn) correctBtn.classList.add('correct');
        }

        quizUserAnswers.push({ question: currentQ, isCorrect, chosen: selectedRomaji });

        // Wait 1.2s before next question
        quizAdvanceTimeout = setTimeout(() => {
          quizAdvanceTimeout = null;
          currentQuizIndex++;
          renderQuizQuestion();
        }, 1200);
      });
    });
  }

  function resetQuizTimer() {
    clearInterval(quizTimer);
    quizTimer = null;
    quizTimeLeft = 15;
    const timerDisplay = document.getElementById('quiz-timer-count');
    if (timerDisplay) timerDisplay.textContent = `${quizTimeLeft}s`;

    quizTimer = setInterval(() => {
      quizTimeLeft--;
      if (timerDisplay) timerDisplay.textContent = `${quizTimeLeft}s`;

      if (quizTimeLeft <= 0) {
        clearInterval(quizTimer);
        quizTimer = null;
        audioController.playWrong();
        quizUserAnswers.push({ question: quizQuestions[currentQuizIndex], isCorrect: false, chosen: 'Timeout' });
        currentQuizIndex++;
        renderQuizQuestion();
      }
    }, 1000);
  }

  function finishQuiz() {
    clearInterval(quizTimer);
    quizTimer = null;
    clearTimeout(quizAdvanceTimeout);
    quizAdvanceTimeout = null;
    isQuizRunning = false;
    audioController.playFanfare();

    document.getElementById('quiz-active-view').style.display = 'none';
    document.getElementById('quiz-results-view').style.display = 'block';

    const accuracy = Math.round((quizScore / 100) * 100);
    document.getElementById('final-score-display').textContent = `${quizScore} / 100`;
    document.getElementById('final-accuracy-display').textContent = `Akurasi Jawaban: ${accuracy}%`;

    // Save to user profile state
    authController.recordQuizResult(quizScore, 10, accuracy, 'Campuran');
    renderProfile();

    const restartQuizBtn = document.getElementById('restart-quiz-btn');
    if (restartQuizBtn) {
      restartQuizBtn.onclick = startNewQuiz;
    }
  }

  function stopQuiz(playSound = true) {
    clearInterval(quizTimer);
    quizTimer = null;
    clearTimeout(quizAdvanceTimeout);
    quizAdvanceTimeout = null;
    isQuizRunning = false;
    quizQuestions = [];
    currentQuizIndex = 0;
    quizScore = 0;
    quizUserAnswers = [];

    document.getElementById('quiz-active-view').style.display = 'none';
    document.getElementById('quiz-results-view').style.display = 'none';
    document.getElementById('quiz-intro-view').style.display = 'block';
    document.getElementById('tab-kuis').classList.add('quiz-menu-centered');
    if (playSound) audioController.playClick();
  }

  // --------------------------------------------------------------------------
  // 9. Profile Dashboard & Badges View
  // --------------------------------------------------------------------------
  function renderProfile() {
    const u = authController.user;

    const usernameMenu = document.getElementById('profile-username-menu');
    if (usernameMenu) {
      usernameMenu.hidden = !u.isLoggedIn;
      if (!u.isLoggedIn) usernameMenu.open = false;
    }

    const guestModeBtn = document.getElementById('profile-guest-btn');
    if (guestModeBtn) {
      guestModeBtn.disabled = !u.isLoggedIn;
      guestModeBtn.textContent = u.isLoggedIn ? 'Keluar Akun' : 'Mode Tamu Aktif';
    }

    const masteredCount = document.getElementById('prof-mastered-count');
    if (masteredCount) masteredCount.textContent = u.masteredKana.length;

    const streakVal = document.getElementById('prof-streak-count');
    if (streakVal) streakVal.textContent = `${u.streakDays} Hari`;

    const highScoreVal = document.getElementById('prof-highscore-count');
    if (highScoreVal) highScoreVal.textContent = u.highScore;

    // Render Badges
    const badgesContainer = document.getElementById('prof-badges-grid');
    if (badgesContainer) {
      badgesContainer.innerHTML = BADGES_DATA.map(badge => {
        const isUnlocked = u.unlockedBadges.includes(badge.id);
        return `
          <div class="badge-item ${isUnlocked ? 'unlocked' : ''}">
            <div class="badge-icon-lg">${badge.icon}</div>
            <div style="font-weight: 700; font-size: 0.85rem;">${badge.name}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">${badge.desc}</div>
          </div>
        `;
      }).join('');
    }

    // Render Recent Quiz History
    const historyContainer = document.getElementById('prof-quiz-history');
    if (historyContainer) {
      if (u.quizHistory.length === 0) {
        historyContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">Belum ada riwayat kuis. Mulai kuis pertama Anda!</p>';
      } else {
        historyContainer.innerHTML = u.quizHistory.slice(0, 5).map(item => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--bg-main); border-radius: var(--radius-sm); margin-bottom: 6px; font-size: 0.85rem;">
            <div>
              <strong>Skor: ${item.score} / 100</strong>
              <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 6px;">${item.date}</span>
            </div>
            <span class="badge badge-success" style="font-size: 0.75rem;">Akurasi: ${item.accuracy}%</span>
          </div>
        `).join('');
      }
    }
  }
});
