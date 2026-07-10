(() => {
  'use strict';

  const BANKS = Array.isArray(window.CG_BANKS) ? window.CG_BANKS : [];
  const app = document.getElementById('app');
  const toastStack = document.getElementById('toastStack');
  const soundButton = document.getElementById('soundButton');
  const themeButton = document.getElementById('themeButton');
  const homeButton = document.getElementById('homeButton');
  const networkStatus = document.getElementById('networkStatus');
  const installButton = document.getElementById('installButton');

  const STORAGE_KEY = 'circuit-grind-v1';
  const THEMES = ['neon', 'blueprint', 'ember'];
  const MODE_INFO = {
    hardcore: { name: 'Hardcore', icon: '↺', description: 'One wrong answer resets the run to Question 1 and reshuffles everything.' },
    practice: { name: 'Practice', icon: '∞', description: 'Immediate feedback and explanations. Wrong answers do not reset the run.' },
    survival: { name: 'Three Lives', icon: '♥', description: 'Start with three lives. Lose one on every miss.' },
    speedrun: { name: 'Speedrun', icon: '⏱', description: 'Score as many correct answers as possible in two minutes.' }
  };

  const ACHIEVEMENTS = [
    { id: 'first', icon: 'ϟ', name: 'First Spark', description: 'Answer one question correctly.' },
    { id: 'streak5', icon: '5', name: 'Live Circuit', description: 'Build a five-answer streak.' },
    { id: 'streak10', icon: '10', name: 'No-Trip Run', description: 'Build a ten-answer streak.' },
    { id: 'century', icon: '100', name: 'Panel Veteran', description: 'Answer 100 questions correctly.' },
    { id: 'daily', icon: 'D', name: 'Daily Inspection', description: 'Complete a Daily 10.' },
    { id: 'perfect', icon: '★', name: 'Clean Certification', description: 'Finish a set without a wrong answer.' },
    { id: 'hardcore', icon: '☠', name: 'No Breaker Trip', description: 'Complete a Hardcore run.' },
    { id: 'allbanks', icon: '163', name: 'Full Commissioning', description: 'Answer every question in an all-bank run.' }
  ];

  const PRAISE = [
    'Clean termination.', 'Signal is solid.', 'No fault detected.', 'That circuit holds.',
    'Certified move.', 'Rack it and label it.', 'Zero crosstalk energy.', 'Inspector-approved brainwave.'
  ];
  const FAILS = [
    'Breaker tripped.', 'That pair got crossed.', 'Certification failed.', 'Back to the panel.',
    'Signal lost.', 'Wrong conductor.', 'The inspector found it.', 'That run needs rework.'
  ];
  const RANKS = ['Apprentice', 'Cable Puller', 'Terminator', 'Field Technician', 'Lead Installer', 'Commissioning Tech', 'Systems Specialist', 'Code Grinder'];

  const defaults = {
    xp: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    bestStreak: 0,
    hardcoreBest: 0,
    completions: 0,
    achievements: [],
    theme: 'neon',
    sound: true,
    dailyDate: '',
    dailyScore: 0,
    lastMode: 'hardcore',
    selectedBanks: BANKS.map(bank => bank.id),
    selectedCategory: 'all'
  };

  let profile = loadProfile();
  let state = {
    screen: 'home',
    mode: profile.lastMode || 'hardcore',
    selectedBanks: new Set((Array.isArray(profile.selectedBanks) ? profile.selectedBanks : []).filter(id => BANKS.some(bank => bank.id === id))),
    selectedCategory: profile.selectedCategory || 'all',
    session: null,
    installPrompt: null
  };
  if (!state.selectedBanks.size) BANKS.forEach(bank => state.selectedBanks.add(bank.id));

  let audioContext = null;
  let timerHandle = null;

  function loadProfile() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...defaults, ...parsed, achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [] };
    } catch {
      return { ...defaults };
    }
  }

  function saveProfile() {
    profile.lastMode = state.mode;
    profile.selectedBanks = [...state.selectedBanks];
    profile.selectedCategory = state.selectedCategory;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function shuffle(items, random = Math.random) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function hashString(text) {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6D2B79F5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function todayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  function allQuestions() {
    return BANKS.flatMap(bank => bank.questions.map(question => ({ ...question, bankId: bank.id, bankTitle: bank.title })));
  }

  function selectedPool() {
    return BANKS
      .filter(bank => state.selectedBanks.has(bank.id))
      .flatMap(bank => bank.questions.map(question => ({ ...question, bankId: bank.id, bankTitle: bank.title })))
      .filter(question => state.selectedCategory === 'all' || question.category === state.selectedCategory);
  }

  function availableCategories() {
    return [...new Set(BANKS.filter(bank => state.selectedBanks.has(bank.id)).flatMap(bank => bank.questions.map(q => q.category)))].sort();
  }

  function rankInfo() {
    const level = Math.floor(profile.xp / 500);
    const rankIndex = Math.min(RANKS.length - 1, Math.floor(level / 2));
    const currentFloor = level * 500;
    const nextFloor = (level + 1) * 500;
    return {
      level: level + 1,
      name: RANKS[rankIndex],
      progress: Math.max(0, Math.min(100, ((profile.xp - currentFloor) / (nextFloor - currentFloor)) * 100)),
      remaining: nextFloor - profile.xp
    };
  }

  function accuracy() {
    return profile.totalAnswered ? Math.round((profile.totalCorrect / profile.totalAnswered) * 100) : 0;
  }

  function playTone(kind) {
    if (!profile.sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;
      oscillator.type = kind === 'correct' ? 'sine' : 'square';
      oscillator.frequency.setValueAtTime(kind === 'correct' ? 520 : 180, now);
      if (kind === 'correct') oscillator.frequency.exponentialRampToValueAtTime(760, now + 0.12);
      else oscillator.frequency.exponentialRampToValueAtTime(110, now + 0.16);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.075, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.19);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.21);
    } catch {
      profile.sound = false;
      saveProfile();
    }
  }

  function toast(title, message, bonus = false) {
    const item = document.createElement('div');
    item.className = `toast${bonus ? ' bonus' : ''}`;
    item.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
    toastStack.appendChild(item);
    window.setTimeout(() => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(8px)';
      window.setTimeout(() => item.remove(), 220);
    }, 3200);
  }

  function unlock(id) {
    if (profile.achievements.includes(id)) return;
    const achievement = ACHIEVEMENTS.find(item => item.id === id);
    if (!achievement) return;
    profile.achievements.push(id);
    profile.xp += 75;
    saveProfile();
    toast(`Achievement: ${achievement.name}`, `${achievement.description} +75 XP`, true);
  }

  function checkAchievements(session = state.session) {
    if (profile.totalCorrect >= 1) unlock('first');
    if (profile.bestStreak >= 5) unlock('streak5');
    if (profile.bestStreak >= 10) unlock('streak10');
    if (profile.totalCorrect >= 100) unlock('century');
    if (!session) return;
    if (session.completed && session.wrong === 0) unlock('perfect');
    if (session.completed && session.mode === 'hardcore') unlock('hardcore');
    if (session.completed && session.mode === 'daily') unlock('daily');
    if (session.completed && session.originalPoolSize === 163) unlock('allbanks');
  }

  function renderHome() {
    clearTimer();
    state.screen = 'home';
    state.session = null;
    const rank = rankInfo();
    const categories = availableCategories();
    if (state.selectedCategory !== 'all' && !categories.includes(state.selectedCategory)) state.selectedCategory = 'all';
    const poolCount = selectedPool().length;
    const dailyDone = profile.dailyDate === todayKey();

    app.innerHTML = `
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">163 questions · CEC 2024 course edition</p>
          <h1>Study until the <span>breaker trips.</span></h1>
          <p>Pick a bank, choose how brutal the run should be, and grind through cabling, testing, life-safety, and telecommunications questions. Handwritten selections from the source sheets were ignored.</p>
          <div class="hero-actions">
            <button class="primary-button" type="button" data-action="start">Start ${escapeHtml(MODE_INFO[state.mode].name)}</button>
            <button class="secondary-button" type="button" data-action="daily">${dailyDone ? 'Replay' : 'Start'} Daily 10</button>
          </div>
        </div>
        <aside class="rank-card" aria-label="Player rank">
          <div>
            <div class="rank-top"><div><p class="eyebrow">Current rank</p><h2>${escapeHtml(rank.name)}</h2><p>${profile.xp.toLocaleString()} total XP</p></div><div class="rank-level">${rank.level}</div></div>
            <div class="xp-track"><div class="xp-fill" style="width:${rank.progress}%"></div></div>
            <div class="rank-meta"><span>Level ${rank.level}</span><span>${rank.remaining} XP to level ${rank.level + 1}</span></div>
          </div>
          <div class="stat-grid" style="margin-top:24px">
            <div class="stat-tile"><strong>${accuracy()}%</strong><span>Lifetime accuracy</span></div>
            <div class="stat-tile"><strong>${profile.bestStreak}</strong><span>Best streak</span></div>
          </div>
        </aside>
      </section>

      <section class="dashboard-grid">
        <div class="main-stack">
          <section class="panel">
            <div class="panel-heading"><div><p class="eyebrow">Operating mode</p><h2>Choose the failure policy</h2><p>Hardcore follows your original reset-to-Question-1 rule.</p></div><span class="count-badge">${escapeHtml(MODE_INFO[state.mode].name)}</span></div>
            <div class="mode-grid">
              ${Object.entries(MODE_INFO).map(([id, mode]) => `
                <label class="mode-card ${state.mode === id ? 'selected' : ''}">
                  <input type="radio" name="mode" value="${id}" ${state.mode === id ? 'checked' : ''} />
                  <span class="mode-icon">${mode.icon}</span>
                  <strong>${escapeHtml(mode.name)}</strong>
                  <small>${escapeHtml(mode.description)}</small>
                </label>`).join('')}
            </div>
          </section>

          <section class="panel">
            <div class="panel-heading"><div><p class="eyebrow">Question banks</p><h2>Select the work package</h2><p>Use one bank, combine them, or filter by topic.</p></div><span class="count-badge">${poolCount} ready</span></div>
            <div class="bank-list">
              ${BANKS.map(bank => `
                <label class="bank-card">
                  <input type="checkbox" value="${bank.id}" ${state.selectedBanks.has(bank.id) ? 'checked' : ''} />
                  <span><strong>${escapeHtml(bank.title)}</strong><small>${escapeHtml(bank.description)}</small></span>
                  <span class="bank-count">${bank.questions.length}</span>
                </label>`).join('')}
            </div>
            <div class="filter-row">
              <label class="select-label">Topic filter
                <select id="categorySelect">
                  <option value="all">All selected topics</option>
                  ${categories.map(category => `<option value="${escapeHtml(category)}" ${state.selectedCategory === category ? 'selected' : ''}>${escapeHtml(category)}</option>`).join('')}
                </select>
              </label>
              <button class="secondary-button" type="button" data-action="toggle-all">${state.selectedBanks.size === BANKS.length ? 'Clear banks' : 'Select all banks'}</button>
            </div>
          </section>
        </div>

        <aside class="side-stack">
          <section class="panel daily-card">
            <p class="eyebrow">Daily inspection</p>
            <h2 style="margin:0">Daily 10</h2>
            <p style="color:var(--muted)">A deterministic ten-question mix. The set changes with the date.</p>
            <p><strong>${dailyDone ? `${profile.dailyScore}/10 completed today` : 'Not completed today'}</strong></p>
            <button class="secondary-button" type="button" data-action="daily">Run Daily 10</button>
          </section>

          <section class="panel">
            <div class="panel-heading"><div><p class="eyebrow">Lifetime stats</p><h2>Scoreboard</h2></div></div>
            <div class="stat-grid">
              <div class="stat-tile"><strong>${profile.totalCorrect}</strong><span>Correct</span></div>
              <div class="stat-tile"><strong>${profile.totalAnswered}</strong><span>Answered</span></div>
              <div class="stat-tile"><strong>${profile.hardcoreBest}</strong><span>Hardcore best</span></div>
              <div class="stat-tile"><strong>${profile.completions}</strong><span>Completed runs</span></div>
            </div>
            <div style="display:grid;gap:7px;margin-top:14px">
              <button class="secondary-button" type="button" data-action="export">Export progress</button>
              <button class="text-button" type="button" data-action="reset-stats">Reset local stats</button>
            </div>
          </section>

          <section class="panel">
            <div class="panel-heading"><div><p class="eyebrow">Achievements</p><h2>${profile.achievements.length}/${ACHIEVEMENTS.length} unlocked</h2></div></div>
            <div class="achievement-list">
              ${ACHIEVEMENTS.map(item => `
                <div class="achievement ${profile.achievements.includes(item.id) ? 'unlocked' : ''}">
                  <span class="achievement-icon">${item.icon}</span>
                  <span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.description)}</small></span>
                </div>`).join('')}
            </div>
          </section>

          <div class="start-panel">
            <div class="start-summary"><span>Selected run</span><strong>${poolCount} questions</strong></div>
            <button class="primary-button" type="button" data-action="start" ${poolCount ? '' : 'disabled'}>Energize ${escapeHtml(MODE_INFO[state.mode].name)}</button>
          </div>
        </aside>
      </section>`;

    bindHomeEvents();
    app.focus({ preventScroll: true });
    saveProfile();
  }

  function bindHomeEvents() {
    app.querySelectorAll('input[name="mode"]').forEach(input => {
      input.addEventListener('change', event => {
        state.mode = event.target.value;
        saveProfile();
        renderHome();
      });
    });
    app.querySelectorAll('.bank-card input').forEach(input => {
      input.addEventListener('change', event => {
        if (event.target.checked) state.selectedBanks.add(event.target.value);
        else state.selectedBanks.delete(event.target.value);
        saveProfile();
        renderHome();
      });
    });
    document.getElementById('categorySelect')?.addEventListener('change', event => {
      state.selectedCategory = event.target.value;
      saveProfile();
      renderHome();
    });
    app.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', handleHomeAction));
  }

  function handleHomeAction(event) {
    const action = event.currentTarget.dataset.action;
    if (action === 'start') startSession(state.mode);
    if (action === 'daily') startSession('daily');
    if (action === 'toggle-all') {
      if (state.selectedBanks.size === BANKS.length) state.selectedBanks.clear();
      else BANKS.forEach(bank => state.selectedBanks.add(bank.id));
      saveProfile();
      renderHome();
    }
    if (action === 'export') exportProgress();
    if (action === 'reset-stats') resetStats();
  }

  function startSession(mode) {
    const basePool = mode === 'daily' ? allQuestions() : selectedPool();
    if (!basePool.length) {
      toast('No questions selected', 'Select at least one question bank or change the topic filter.');
      return;
    }
    const date = todayKey();
    const random = mode === 'daily' ? seededRandom(hashString(`circuit-grind-${date}`)) : Math.random;
    const questions = mode === 'daily' ? shuffle(basePool, random).slice(0, 10) : shuffle(basePool, random);
    state.screen = 'quiz';
    state.session = {
      mode,
      questions,
      originalPool: [...basePool],
      originalPoolSize: basePool.length,
      index: 0,
      score: 0,
      correct: 0,
      wrong: 0,
      streak: 0,
      bestStreak: 0,
      lives: mode === 'survival' ? 3 : null,
      resets: 0,
      locked: false,
      feedback: null,
      displayOptions: [],
      startedAt: Date.now(),
      endsAt: mode === 'speedrun' ? Date.now() + 120000 : null,
      timeLeft: mode === 'speedrun' ? 120 : null,
      completed: false
    };
    prepareQuestion();
    if (mode === 'speedrun') startTimer();
    renderQuiz();
  }

  function prepareQuestion() {
    const session = state.session;
    const question = session.questions[session.index];
    session.locked = false;
    session.feedback = null;
    session.displayOptions = shuffle(question.options.map((text, originalIndex) => ({ text, originalIndex })));
  }

  function currentQuestion() { return state.session?.questions[state.session.index]; }

  function isBossQuestion() {
    const session = state.session;
    return session && (session.index + 1) % 10 === 0;
  }

  function modeName(mode) { return mode === 'daily' ? 'Daily 10' : MODE_INFO[mode]?.name || mode; }

  function renderQuiz() {
    const session = state.session;
    if (!session) return renderHome();
    const question = currentQuestion();
    if (!question) return finishSession('complete');
    const progress = session.mode === 'speedrun'
      ? Math.min(100, (session.index / Math.max(1, session.questions.length)) * 100)
      : ((session.index + 1) / session.questions.length) * 100;
    const boss = isBossQuestion();
    const timeText = session.mode === 'speedrun' ? formatTime(session.timeLeft) : null;

    app.innerHTML = `
      <section class="quiz-layout">
        <div class="quiz-hud">
          <div class="hud-group">
            <button class="secondary-button" type="button" id="quitButton">← Exit</button>
            <span class="mode-badge">${escapeHtml(modeName(session.mode))}</span>
          </div>
          <div class="quiz-progress">
            <div class="quiz-progress-label"><span>${session.mode === 'speedrun' ? 'Question stream' : `Question ${session.index + 1} of ${session.questions.length}`}</span><span>${Math.round(progress)}%</span></div>
            <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
            ${session.mode === 'speedrun' ? `<div class="timer-track" style="margin-top:7px"><div class="timer-fill" id="timerFill" style="width:${Math.max(0, session.timeLeft / 120 * 100)}%"></div></div>` : ''}
          </div>
          <div class="hud-group">
            ${session.mode === 'survival' ? `<div class="hud-metric"><strong>${'♥'.repeat(session.lives)}${'♡'.repeat(3-session.lives)}</strong><span>Lives</span></div>` : ''}
            ${session.mode === 'speedrun' ? `<div class="hud-metric"><strong id="timerText">${timeText}</strong><span>Time</span></div>` : ''}
            <div class="hud-metric"><strong>${session.score}</strong><span>Score</span></div>
            <div class="hud-metric"><strong>${session.streak}</strong><span>Streak</span></div>
          </div>
        </div>

        <article class="quiz-card ${boss ? 'boss' : ''}">
          <div class="question-meta">
            <span class="category-chip">${escapeHtml(question.category)}</span>
            <span class="category-chip">${escapeHtml(question.bankTitle)}</span>
            ${question.review ? '<span class="review-badge">Review flag</span>' : ''}
            ${boss ? '<span class="boss-badge">Boss question · 2× XP</span>' : ''}
            <span class="question-number">Source Q${question.sourceNumber}</span>
          </div>
          <h1 class="question-title">${escapeHtml(question.question)}</h1>
          ${question.review ? `<p class="question-note">This item has wording, jurisdiction, or standards-edition limits. The explanation identifies the issue.</p>` : ''}
          <div class="option-list" role="group" aria-label="Answer choices">
            ${session.displayOptions.map((option, displayIndex) => {
              const classes = ['option-button'];
              if (session.locked && option.originalIndex === question.answer) classes.push('correct');
              if (session.locked && session.feedback?.selectedOriginal === option.originalIndex && option.originalIndex !== question.answer) classes.push('wrong');
              return `<button class="${classes.join(' ')}" type="button" data-option="${displayIndex}" ${session.locked ? 'disabled' : ''}>
                <span class="option-key">${String.fromCharCode(65 + displayIndex)}</span>
                <span>${escapeHtml(option.text)}</span>
              </button>`;
            }).join('')}
          </div>
          ${renderFeedback()}
        </article>
      </section>`;

    app.querySelectorAll('[data-option]').forEach(button => button.addEventListener('click', () => answerQuestion(Number(button.dataset.option))));
    document.getElementById('quitButton')?.addEventListener('click', confirmExit);
    document.getElementById('nextButton')?.addEventListener('click', nextQuestion);
    app.focus({ preventScroll: true });
  }

  function renderFeedback() {
    const session = state.session;
    const question = currentQuestion();
    if (!session.feedback) return '';
    const correct = session.feedback.correct;
    const heading = correct ? session.feedback.message : session.feedback.message;
    return `
      <div class="feedback-box ${correct ? 'success' : 'error'}">
        <span class="feedback-icon">${correct ? '✓' : '×'}</span>
        <div>
          <h3>${escapeHtml(heading)}</h3>
          <p>${escapeHtml(question.explanation)}</p>
          ${question.note ? `<p class="review-note">${escapeHtml(question.note)}</p>` : ''}
        </div>
        ${session.feedback.showNext ? `<button class="primary-button" type="button" id="nextButton">${session.index + 1 >= session.questions.length ? 'Finish run' : 'Next question'} →</button>` : ''}
      </div>`;
  }

  function answerQuestion(displayIndex) {
    const session = state.session;
    if (!session || session.locked) return;
    const question = currentQuestion();
    const selected = session.displayOptions[displayIndex];
    if (!selected) return;
    const correct = selected.originalIndex === question.answer;
    session.locked = true;
    profile.totalAnswered += 1;

    if (correct) {
      session.correct += 1;
      session.streak += 1;
      session.bestStreak = Math.max(session.bestStreak, session.streak);
      profile.totalCorrect += 1;
      profile.bestStreak = Math.max(profile.bestStreak, session.streak);
      const base = isBossQuestion() ? 20 : 10;
      const combo = Math.min(20, session.streak * 2);
      let reward = base + combo;
      let bonusMessage = '';
      if (Math.random() < 0.12) {
        reward += 25;
        bonusMessage = ' Supply crate found: +25 bonus XP.';
        toast('Supply crate', 'Random bonus: +25 XP.', true);
      }
      profile.xp += reward;
      session.score += isBossQuestion() ? 2 : 1;
      session.feedback = {
        correct: true,
        selectedOriginal: selected.originalIndex,
        message: `${PRAISE[Math.floor(Math.random() * PRAISE.length)]} +${reward} XP.${bonusMessage}`,
        showNext: session.mode !== 'speedrun'
      };
      playTone('correct');
    } else {
      session.wrong += 1;
      session.streak = 0;
      session.feedback = {
        correct: false,
        selectedOriginal: selected.originalIndex,
        message: FAILS[Math.floor(Math.random() * FAILS.length)],
        showNext: ['practice', 'daily'].includes(session.mode)
      };
      playTone('wrong');
      if (session.mode === 'hardcore') {
        profile.hardcoreBest = Math.max(profile.hardcoreBest, session.index + 1);
      } else if (session.mode === 'survival') {
        session.lives -= 1;
        session.feedback.showNext = session.lives > 0;
      } else if (session.mode === 'speedrun') {
        session.endsAt -= 5000;
        session.timeLeft = Math.max(0, Math.ceil((session.endsAt - Date.now()) / 1000));
      }
    }

    saveProfile();
    checkAchievements();
    renderQuiz();

    if (!correct) {
      if (session.mode === 'hardcore') window.setTimeout(renderHardcoreReset, 1250);
      if (session.mode === 'survival' && session.lives <= 0) window.setTimeout(() => finishSession('out-of-lives'), 900);
      if (session.mode === 'speedrun') window.setTimeout(nextQuestion, 450);
    } else if (session.mode === 'speedrun') {
      window.setTimeout(nextQuestion, 340);
    }
  }

  function renderHardcoreReset() {
    const session = state.session;
    if (state.screen !== 'quiz' || !session || session.mode !== 'hardcore') return;
    app.innerHTML = `
      <section class="quiz-card reset-overlay">
        <div>
          <div class="reset-number">Q1</div>
          <h2>Run reset.</h2>
          <p>One miss sends the entire run back to Question 1. Question order and answer positions are being reshuffled.</p>
        </div>
      </section>`;
    window.setTimeout(hardReset, 1350);
  }

  function hardReset() {
    const session = state.session;
    if (state.screen !== 'quiz' || !session) return;
    session.questions = shuffle(session.originalPool);
    session.index = 0;
    session.score = 0;
    session.correct = 0;
    session.wrong = 0;
    session.streak = 0;
    session.bestStreak = 0;
    session.resets += 1;
    session.startedAt = Date.now();
    prepareQuestion();
    renderQuiz();
  }

  function nextQuestion() {
    const session = state.session;
    if (state.screen !== 'quiz' || !session) return;
    if (!session.locked && session.mode !== 'speedrun') return;
    session.index += 1;
    if (session.index >= session.questions.length) {
      finishSession('complete');
      return;
    }
    prepareQuestion();
    renderQuiz();
  }

  function finishSession(reason) {
    const session = state.session;
    if (state.screen !== 'quiz' || !session) return;
    clearTimer();
    session.completed = reason === 'complete';
    if (session.completed) profile.completions += 1;
    if (session.mode === 'daily') {
      profile.dailyDate = todayKey();
      profile.dailyScore = session.correct;
    }
    saveProfile();
    checkAchievements(session);
    state.screen = 'result';
    renderResult(reason);
  }

  function renderResult(reason) {
    const session = state.session;
    const elapsed = Math.max(1, Math.round((Date.now() - session.startedAt) / 1000));
    const answered = session.correct + session.wrong;
    const runAccuracy = answered ? Math.round(session.correct / answered * 100) : 0;
    const messages = {
      complete: ['Run complete.', 'The question set has been fully commissioned.'],
      'out-of-lives': ['All three lives are gone.', 'The system failed inspection, but the missed items are now exposed.'],
      timeout: ['Time expired.', 'Speedrun is over. The score is locked in.']
    };
    const [title, subtitle] = messages[reason] || ['Run ended.', 'Your progress has been saved locally.'];

    app.innerHTML = `
      <section class="result-card">
        <div class="result-icon">${reason === 'complete' ? '✓' : reason === 'timeout' ? '⏱' : '×'}</div>
        <p class="eyebrow">${escapeHtml(modeName(session.mode))}</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(subtitle)}</p>
        <div class="result-stats">
          <div class="stat-tile"><strong>${session.correct}</strong><span>Correct answers</span></div>
          <div class="stat-tile"><strong>${runAccuracy}%</strong><span>Run accuracy</span></div>
          <div class="stat-tile"><strong>${formatTime(elapsed)}</strong><span>Elapsed time</span></div>
          <div class="stat-tile"><strong>${session.bestStreak}</strong><span>Best streak</span></div>
          <div class="stat-tile"><strong>${session.resets || 0}</strong><span>Hardcore resets</span></div>
          <div class="stat-tile"><strong>${session.score}</strong><span>Mode score</span></div>
        </div>
        <div class="result-actions">
          <button class="primary-button" type="button" id="retryButton">Run it again</button>
          <button class="secondary-button" type="button" id="resultHomeButton">Change setup</button>
        </div>
      </section>`;
    document.getElementById('retryButton')?.addEventListener('click', () => startSession(session.mode));
    document.getElementById('resultHomeButton')?.addEventListener('click', renderHome);
    app.focus({ preventScroll: true });
  }

  function startTimer() {
    clearTimer();
    timerHandle = window.setInterval(() => {
      const session = state.session;
      if (!session || session.mode !== 'speedrun') return clearTimer();
      session.timeLeft = Math.max(0, Math.ceil((session.endsAt - Date.now()) / 1000));
      const timerText = document.getElementById('timerText');
      const timerFill = document.getElementById('timerFill');
      if (timerText) timerText.textContent = formatTime(session.timeLeft);
      if (timerFill) timerFill.style.width = `${Math.max(0, session.timeLeft / 120 * 100)}%`;
      if (session.timeLeft <= 0) finishSession('timeout');
    }, 250);
  }

  function clearTimer() {
    if (timerHandle) window.clearInterval(timerHandle);
    timerHandle = null;
  }

  function formatTime(totalSeconds) {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function confirmExit() {
    if (window.confirm('Exit this run? Current run progress will be discarded, but lifetime XP and stats remain saved.')) renderHome();
  }

  function exportProgress() {
    const payload = {
      app: 'Circuit Grind',
      exportedAt: new Date().toISOString(),
      profile,
      questionCount: allQuestions().length
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `circuit-grind-progress-${todayKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast('Progress exported', 'A JSON backup was downloaded to this device.');
  }

  function resetStats() {
    if (!window.confirm('Reset all Circuit Grind XP, achievements, and local statistics on this device?')) return;
    const retained = { theme: profile.theme, sound: profile.sound };
    profile = { ...defaults, ...retained };
    state.mode = profile.lastMode;
    state.selectedBanks = new Set(profile.selectedBanks);
    state.selectedCategory = 'all';
    saveProfile();
    renderHome();
  }

  function updateSoundButton() {
    soundButton.classList.toggle('active', profile.sound);
    soundButton.textContent = profile.sound ? '♪' : '∕';
    soundButton.setAttribute('aria-label', profile.sound ? 'Mute sound' : 'Enable sound');
  }

  function cycleTheme() {
    const current = THEMES.indexOf(profile.theme);
    profile.theme = THEMES[(current + 1) % THEMES.length];
    document.documentElement.dataset.theme = profile.theme;
    saveProfile();
    toast('Theme changed', profile.theme[0].toUpperCase() + profile.theme.slice(1));
  }

  function updateNetworkStatus() {
    const online = navigator.onLine;
    networkStatus.classList.toggle('offline', !online);
    networkStatus.querySelector('span:last-child').textContent = online ? 'Online' : 'Offline ready';
  }

  function handleKeyboard(event) {
    if (state.screen !== 'quiz' || !state.session) return;
    const tag = document.activeElement?.tagName;
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) return;
    const keys = { '1': 0, 'a': 0, '2': 1, 'b': 1, '3': 2, 'c': 2, '4': 3, 'd': 3 };
    const key = event.key.toLowerCase();
    if (key in keys && !state.session.locked) {
      event.preventDefault();
      answerQuestion(keys[key]);
    } else if (event.key === 'Enter' && state.session.locked && state.session.feedback?.showNext) {
      event.preventDefault();
      nextQuestion();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      confirmExit();
    }
  }

  homeButton.addEventListener('click', () => {
    if (state.screen === 'quiz' && state.session && !window.confirm('Exit the current run and return home?')) return;
    renderHome();
  });
  soundButton.addEventListener('click', () => {
    profile.sound = !profile.sound;
    saveProfile();
    updateSoundButton();
    if (profile.sound) playTone('correct');
  });
  themeButton.addEventListener('click', cycleTheme);
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  window.addEventListener('keydown', handleKeyboard);
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    state.installPrompt = event;
    installButton.classList.remove('hidden');
  });
  installButton.addEventListener('click', async () => {
    if (!state.installPrompt) return;
    state.installPrompt.prompt();
    await state.installPrompt.userChoice;
    state.installPrompt = null;
    installButton.classList.add('hidden');
  });

  document.documentElement.dataset.theme = THEMES.includes(profile.theme) ? profile.theme : 'neon';
  updateSoundButton();
  updateNetworkStatus();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }

  if (BANKS.length !== 3 || allQuestions().length !== 163) {
    app.innerHTML = `<section class="result-card"><div class="result-icon">!</div><h1>Question data failed to load.</h1><p>Expected 163 questions but found ${allQuestions().length}. Reload the page.</p></section>`;
  } else {
    renderHome();
  }
})();
