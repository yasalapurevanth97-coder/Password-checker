/**
 * ShieldPass PRO - Enterprise Password Strength Checker & Generator
 * Comprehensive, Zero-Knowledge Client-Side Security Suite (No Login Required)
 */

document.addEventListener('DOMContentLoaded', async () => {
  // =========================================================================
  // STATE MANAGEMENT & CRYPTO ENGINE
  // =========================================================================

  const sessionState = {
    sessionStartTime: Date.now(),
    passwordsAnalyzed: 0,
    passwordsGenerated: 0,
    totalActions: 0,
    categoryCounts: {
      veryWeak: 0,
      weak: 0,
      medium: 0,
      strong: 0,
      veryStrong: 0
    },
    activityLog: []
  };

  // --- Cryptographic Helper Functions (Web Crypto API) ---
  function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Cryptographically unbiased random integer in [0, max) via rejection sampling
  function getSecureRandomInt(max) {
    const array = new Uint32Array(1);
    const maxUint = 0xFFFFFFFF;
    const limit = maxUint - (maxUint % max);
    let randomVal;
    do {
      window.crypto.getRandomValues(array);
      randomVal = array[0];
    } while (randomVal >= limit);
    return randomVal % max;
  }

  // =========================================================================
  // DOM REFERENCES
  // =========================================================================

  // Intro Screen
  const introScreen = document.getElementById('intro-screen');
  const introProgressFill = document.getElementById('intro-progress-fill');
  const introStatusText = document.getElementById('intro-status-text');
  const introStatusPercent = document.getElementById('intro-status-percent');
  const btnSkipIntro = document.getElementById('btn-skip-intro');
  const introCanvas = document.getElementById('intro-particles-canvas');

  // Navbar
  const mainNavbar = document.getElementById('main-navbar');
  const navTabs = document.querySelectorAll('.nav-tab');
  const btnMobileToggle = document.getElementById('btn-mobile-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  // View Panels
  const appViewport = document.getElementById('app-viewport');
  const viewPanels = {
    dashboard: document.getElementById('view-dashboard'),
    checker: document.getElementById('view-checker'),
    generator: document.getElementById('view-generator'),
    audit: document.getElementById('view-audit')
  };

  // Dashboard Elements
  const dashGreetingTime = document.getElementById('dash-greeting-time');
  const statPasswordsAnalyzed = document.getElementById('stat-passwords-analyzed');
  const statPasswordsGenerated = document.getElementById('stat-passwords-generated');
  const statSessionDuration = document.getElementById('stat-session-duration');
  const catCntVweak = document.getElementById('cat-cnt-vweak');
  const catCntWeak = document.getElementById('cat-cnt-weak');
  const catCntMed = document.getElementById('cat-cnt-med');
  const catCntStrong = document.getElementById('cat-cnt-strong');
  const catCntVstrong = document.getElementById('cat-cnt-vstrong');
  const activityLogList = document.getElementById('activity-log-list');

  // Dashboard Mini Quick Actions
  const btnQuickCheck = document.getElementById('btn-quick-check');
  const btnQuickGen = document.getElementById('btn-quick-gen');
  const dashQuickInput = document.getElementById('dash-quick-input');
  const dashQuickLabel = document.getElementById('dash-quick-label');
  const dashMeterSegs = [
    document.getElementById('dash-meter-seg-1'),
    document.getElementById('dash-meter-seg-2'),
    document.getElementById('dash-meter-seg-3'),
    document.getElementById('dash-meter-seg-4'),
    document.getElementById('dash-meter-seg-5')
  ];
  const btnJumpChecker = document.getElementById('btn-jump-checker');
  const dashQuickGenDisplay = document.getElementById('dash-quick-gen-display');
  const dashQuickCopy = document.getElementById('dash-quick-copy');
  const dashQuickRegen = document.getElementById('dash-quick-regen');

  // Password Checker View
  const passwordInput = document.getElementById('password-input');
  const inputFrame = document.getElementById('input-frame');
  const btnToggleVisibility = document.getElementById('btn-toggle-visibility');
  const iconEyeShow = document.getElementById('icon-eye-show');
  const iconEyeHide = document.getElementById('icon-eye-hide');
  const btnClear = document.getElementById('btn-clear');
  const btnCopyInput = document.getElementById('btn-copy-input');
  const btnReset = document.getElementById('btn-reset');
  const charCount = document.getElementById('char-count');
  const entropyValue = document.getElementById('entropy-value');

  const strengthScorePercent = document.getElementById('strength-score-percent');
  const strengthLevelTag = document.getElementById('strength-level-tag');
  const meterSegments = document.querySelectorAll('#strength-meter-section .meter-segment');
  const crackTimeValue = document.getElementById('crack-time-value');
  const crackTimeSub = document.getElementById('crack-time-sub');

  const checklistProgress = document.getElementById('checklist-progress');
  const checkLen8 = document.getElementById('check-len-8');
  const checkLen12 = document.getElementById('check-len-12');
  const checkUpper = document.getElementById('check-upper');
  const checkLower = document.getElementById('check-lower');
  const checkNumber = document.getElementById('check-number');
  const checkSymbol = document.getElementById('check-symbol');
  const checkPatterns = document.getElementById('check-patterns');
  const suggestionsContainer = document.getElementById('suggestions-container');

  // Generator View
  const generatedPasswordText = document.getElementById('generated-password');
  const btnToggleGenView = document.getElementById('btn-toggle-gen-view');
  const genViewLabel = document.getElementById('gen-view-label');
  const btnCopyGenerated = document.getElementById('btn-copy-generated');
  const btnTestInChecker = document.getElementById('btn-test-in-checker');
  const genLengthSlider = document.getElementById('gen-length');
  const genLengthVal = document.getElementById('gen-length-val');
  const genUpper = document.getElementById('gen-upper');
  const genLower = document.getElementById('gen-lower');
  const genNumbers = document.getElementById('gen-numbers');
  const genSymbols = document.getElementById('gen-symbols');
  const genAvoidAmbiguous = document.getElementById('gen-avoid-ambiguous');
  const btnGeneratePassword = document.getElementById('btn-generate-password');

  // Security Standards / Audit View
  const profTotalActions = document.getElementById('prof-total-actions');

  // Modals
  const modalPrivacy = document.getElementById('modal-privacy');
  const modalAbout = document.getElementById('modal-about');
  const btnOpenPrivacy = document.getElementById('btn-open-privacy');
  const btnOpenAbout = document.getElementById('btn-open-about');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // =========================================================================
  // TOAST NOTIFICATIONS & HELPER FUNCTIONS
  // =========================================================================

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
    const iconSvg = type === 'success'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      toast.addEventListener('animationend', () => toast.remove());
    }, 2800);
  }

  async function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
    if (!text) {
      showToast('Nothing to copy!', 'info');
      return;
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const temp = document.createElement('textarea');
        temp.value = text;
        temp.style.position = 'fixed';
        temp.style.left = '-9999px';
        document.body.appendChild(temp);
        temp.focus();
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      showToast(successMsg, 'success');
    } catch {
      showToast('Unable to copy automatically', 'info');
    }
  }

  function addSessionActivity(title) {
    sessionState.totalActions++;
    if (profTotalActions) {
      profTotalActions.textContent = `${sessionState.totalActions} operations`;
    }
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sessionState.activityLog.unshift({ title, time: timeStr });
    if (sessionState.activityLog.length > 20) sessionState.activityLog.pop();

    const li = document.createElement('li');
    li.className = 'activity-log-item';
    li.innerHTML = `
      <span class="activity-bullet blue"></span>
      <div class="activity-body">
        <span class="activity-title">${title}</span>
        <span class="activity-time">${timeStr}</span>
      </div>
    `;
    if (activityLogList.firstChild) {
      activityLogList.insertBefore(li, activityLogList.firstChild);
    } else {
      activityLogList.appendChild(li);
    }
  }

  // =========================================================================
  // 1. OPENING INTRO ANIMATION & PARTICLES CANVAS
  // =========================================================================

  let introCompleted = false;

  function initIntroCanvas() {
    if (!introCanvas) return;
    const ctx = introCanvas.getContext('2d');
    let width = (introCanvas.width = window.innerWidth);
    let height = (introCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = introCanvas.width = window.innerWidth;
      height = introCanvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(50, Math.floor(width / 30));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '#8b5cf6' : '#06b6d4'
      });
    }

    function render() {
      if (introCompleted) return;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.18 * (1 - dist / 110)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(render);
    }

    render();
  }

  function runIntroProgress() {
    initIntroCanvas();
    let progress = 0;
    const stages = [
      { at: 20, text: 'Initializing Cryptographic Engine...' },
      { at: 50, text: 'Calibrating Entropy Heuristics...' },
      { at: 75, text: 'Enforcing NIST SP 800-63B Guidelines...' },
      { at: 92, text: 'Deploying Zero-Knowledge Environment...' },
      { at: 100, text: 'System Initialized. Launching...' }
    ];

    const interval = setInterval(() => {
      if (introCompleted) {
        clearInterval(interval);
        return;
      }
      progress += 2;
      introProgressFill.style.width = `${progress}%`;
      introStatusPercent.textContent = `${progress}%`;

      const curStage = stages.find(s => progress <= s.at) || stages[stages.length - 1];
      introStatusText.textContent = curStage.text;

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(finishIntro, 400);
      }
    }, 38);
  }

  function finishIntro() {
    if (introCompleted) return;
    introCompleted = true;
    introScreen.classList.add('fade-out');
    setTimeout(() => {
      introScreen.style.display = 'none';
      switchView('dashboard');
      addSessionActivity('Zero-Knowledge cybersecurity session initialized');
      showToast('Welcome to ShieldPass PRO!', 'success');
    }, 600);
  }

  btnSkipIntro.addEventListener('click', finishIntro);
  runIntroProgress();

  // =========================================================================
  // 2. SPA ROUTING & VIEW NAVIGATION
  // =========================================================================

  function switchView(viewName) {
    if (!viewPanels[viewName]) return;

    // Toggle View Panels
    Object.keys(viewPanels).forEach(key => {
      viewPanels[key].classList.toggle('active', key === viewName);
    });

    // Toggle Desktop Nav Tabs
    navTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === viewName);
    });

    // Toggle Mobile Nav Links
    mobileNavLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewName);
    });

    mobileNavDrawer.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });

  mobileNavLinks.forEach(link => {
    if (link.dataset.view) {
      link.addEventListener('click', () => switchView(link.dataset.view));
    }
  });

  document.querySelectorAll('.btn-nav-to, .footer-link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.view) switchView(btn.dataset.view);
    });
  });

  btnQuickCheck.addEventListener('click', () => switchView('checker'));
  btnQuickGen.addEventListener('click', () => switchView('generator'));
  btnJumpChecker.addEventListener('click', () => switchView('checker'));

  btnMobileToggle.addEventListener('click', () => {
    mobileNavDrawer.classList.toggle('open');
  });

  // Live Stopwatch for Active Session Duration
  setInterval(() => {
    const diffSec = Math.floor((Date.now() - sessionState.sessionStartTime) / 1000);
    const m = String(Math.floor(diffSec / 60)).padStart(2, '0');
    const s = String(diffSec % 60).padStart(2, '0');
    if (statSessionDuration) statSessionDuration.textContent = `${m}:${s}`;
  }, 1000);

  // Dynamic Greeting based on time of day
  const hour = new Date().getHours();
  if (hour < 12) dashGreetingTime.textContent = 'Good morning';
  else if (hour < 18) dashGreetingTime.textContent = 'Good afternoon';
  else dashGreetingTime.textContent = 'Good evening';

  // =========================================================================
  // 4. PASSWORD STRENGTH ANALYSIS ENGINE (NIST & Shannon Entropy)
  // =========================================================================

  const COMMON_PASSWORDS = new Set([
    'password', '123456', '123456789', '12345678', '12345', 'qwerty',
    'admin', 'welcome', 'letmein', 'monkey', 'iloveyou', 'starwars',
    'dragon', 'football', 'master', 'sunshine', 'princess', 'solo',
    'shadow', 'secret', 'hunter2', 'pass123', 'access', 'computer',
    'login', 'root', 'superman', 'batman', 'trustno1', 'killer'
  ]);

  const KEYBOARD_SEQUENCES = [
    'qwerty', 'asdfgh', 'zxcvbn', 'qwertyuiop',
    '123456', '234567', '345678', '456789', '567890',
    'abcdef', 'bcdefg', 'cdefgh', 'defghi', 'efghij'
  ];

  function hasSequentialAlphabet(pwd) {
    const lower = pwd.toLowerCase();
    for (let i = 0; i < lower.length - 2; i++) {
      const c1 = lower.charCodeAt(i);
      const c2 = lower.charCodeAt(i + 1);
      const c3 = lower.charCodeAt(i + 2);
      if (c1 >= 97 && c1 <= 120 && c2 === c1 + 1 && c3 === c1 + 2) return true;
      if (c1 >= 99 && c1 <= 122 && c2 === c1 - 1 && c3 === c1 - 2) return true;
    }
    return false;
  }

  function hasSequentialNumbers(pwd) {
    for (let i = 0; i < pwd.length - 2; i++) {
      const c1 = pwd.charCodeAt(i);
      const c2 = pwd.charCodeAt(i + 1);
      const c3 = pwd.charCodeAt(i + 2);
      if (c1 >= 48 && c1 <= 55 && c2 === c1 + 1 && c3 === c1 + 2) return true;
      if (c1 >= 50 && c1 <= 57 && c2 === c1 - 1 && c3 === c1 - 2) return true;
    }
    return false;
  }

  function hasRepeatedChars(pwd) {
    return /(.)\1\1/.test(pwd);
  }

  function containsCommonPassword(pwd) {
    const lower = pwd.toLowerCase();
    if (COMMON_PASSWORDS.has(lower)) return true;
    for (const seq of KEYBOARD_SEQUENCES) {
      if (lower.includes(seq)) return true;
    }
    return false;
  }

  function calculateEntropy(pwd) {
    if (!pwd) return 0;
    let poolSize = 0;
    if (/[a-z]/.test(pwd)) poolSize += 26;
    if (/[A-Z]/.test(pwd)) poolSize += 26;
    if (/[0-9]/.test(pwd)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 33;
    if (poolSize === 0) return 0;
    return Math.round(pwd.length * Math.log2(poolSize));
  }

  function calculateCrackTime(pwd) {
    if (!pwd || pwd.length === 0) {
      return { text: 'Instant (0 seconds)', sub: 'Enter a password to evaluate' };
    }

    const guessesPerSec = 1e10; // 10 billion guesses/sec GPU cluster
    let poolSize = 0;
    if (/[a-z]/.test(pwd)) poolSize += 26;
    if (/[A-Z]/.test(pwd)) poolSize += 26;
    if (/[0-9]/.test(pwd)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 33;
    if (poolSize === 0) poolSize = 1;

    const totalCombinations = Math.pow(poolSize, Math.min(pwd.length, 30));
    const seconds = (totalCombinations / 2) / guessesPerSec;

    if (containsCommonPassword(pwd) || pwd.length < 5) {
      return { text: 'Instantly (< 1 millisecond)', sub: 'Flawed by common dictionary entry or tiny length' };
    }
    if (seconds < 1) return { text: 'Instantly (< 1 second)', sub: 'Trivially vulnerable to brute-force' };
    if (seconds < 60) return { text: `${Math.round(seconds)} seconds`, sub: 'Can be cracked within seconds' };
    if (seconds < 3600) return { text: `${Math.round(seconds / 60)} minutes`, sub: 'Can be cracked within minutes' };
    if (seconds < 86400) return { text: `${Math.round(seconds / 3600)} hours`, sub: 'Cracked within standard work shifts' };
    if (seconds < 31536000) return { text: `${Math.round(seconds / 86400)} days`, sub: 'Moderately resistant against casual attacks' };
    if (seconds < 31536000 * 100) return { text: `${Math.round(seconds / 31536000)} years`, sub: 'Highly resistant against modern GPU clusters' };
    if (seconds < 31536000 * 1e6) return { text: `${Math.round(seconds / (31536000 * 1000))} thousand years`, sub: 'Unbreakable against current computing capacity' };
    return { text: 'Millions of Centuries', sub: 'Cryptographically impenetrable to brute force' };
  }

  function evaluatePassword(pwd) {
    const hasLen8 = pwd.length >= 8;
    const hasLen12 = pwd.length >= 12;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);

    const hasSeqAlpha = hasSequentialAlphabet(pwd);
    const hasSeqNum = hasSequentialNumbers(pwd);
    const hasRepeats = hasRepeatedChars(pwd);
    const isCommon = containsCommonPassword(pwd);
    const avoidsPatterns = !hasSeqAlpha && !hasSeqNum && !hasRepeats && !isCommon && pwd.length > 0;

    let rawScore = 0;
    if (pwd.length >= 16) rawScore += 35;
    else if (pwd.length >= 12) rawScore += 25;
    else if (pwd.length >= 8) rawScore += 15;
    else rawScore += pwd.length * 1.5;

    let varietyCount = 0;
    if (hasLower) { rawScore += 12; varietyCount++; }
    if (hasUpper) { rawScore += 12; varietyCount++; }
    if (hasNumber) { rawScore += 12; varietyCount++; }
    if (hasSymbol) { rawScore += 15; varietyCount++; }
    if (varietyCount >= 4) rawScore += 8;

    if (isCommon) rawScore = Math.min(rawScore, 15);
    if (hasSeqAlpha) rawScore -= 12;
    if (hasSeqNum) rawScore -= 12;
    if (hasRepeats) rawScore -= 10;

    let score = Math.max(0, Math.min(100, Math.round(rawScore)));

    let levelIndex = 0;
    let levelName = 'Awaiting Input';
    let levelClass = 'strength-none';
    let categoryKey = null;

    if (pwd.length === 0) {
      levelIndex = 0;
      levelName = 'Awaiting Input';
      levelClass = 'strength-none';
      score = 0;
    } else if (score < 25 || pwd.length < 6 || isCommon) {
      levelIndex = 1;
      levelName = 'Very Weak';
      levelClass = 'strength-very-weak';
      categoryKey = 'veryWeak';
    } else if (score < 50 || pwd.length < 8) {
      levelIndex = 2;
      levelName = 'Weak';
      levelClass = 'strength-weak';
      categoryKey = 'weak';
    } else if (score < 72 || varietyCount < 3) {
      levelIndex = 3;
      levelName = 'Medium';
      levelClass = 'strength-medium';
      categoryKey = 'medium';
    } else if (score < 90 || !hasLen12) {
      levelIndex = 4;
      levelName = 'Strong';
      levelClass = 'strength-strong';
      categoryKey = 'strong';
    } else {
      levelIndex = 5;
      levelName = 'Very Strong';
      levelClass = 'strength-very-strong';
      categoryKey = 'veryStrong';
    }

    return {
      score,
      levelIndex,
      levelName,
      levelClass,
      categoryKey,
      checks: { hasLen8, hasLen12, hasUpper, hasLower, hasNumber, hasSymbol, avoidsPatterns },
      flaws: { hasSeqAlpha, hasSeqNum, hasRepeats, isCommon }
    };
  }

  function generateSuggestions(pwd, analysis) {
    if (!pwd || pwd.length === 0) return [];
    const tips = [];
    const { checks, flaws } = analysis;

    if (flaws.isCommon) {
      tips.push({
        type: 'warning',
        text: 'This matches a commonly breached password or standard keyboard pattern. Attackers test this in first attempts.'
      });
    }

    if (pwd.length < 8) {
      tips.push({
        type: 'warning',
        text: 'Your password is too short. Use at least 8 characters, or ideally 12+ for dependable safety.'
      });
    } else if (pwd.length < 12) {
      tips.push({
        type: 'tip',
        text: 'Increase length to 12 or more characters. Length provides exponential resistance against brute-force.'
      });
    }

    if (!checks.hasUpper && !checks.hasLower) {
      tips.push({
        type: 'tip',
        text: 'Combine both uppercase (A–Z) and lowercase (a–z) letters to increase complexity.'
      });
    } else if (!checks.hasUpper) {
      tips.push({
        type: 'tip',
        text: 'Add uppercase letters (A–Z) to expand the character search pool.'
      });
    } else if (!checks.hasLower) {
      tips.push({
        type: 'tip',
        text: 'Add lowercase letters (a–z) to balance character diversity.'
      });
    }

    if (!checks.hasNumber) {
      tips.push({ type: 'tip', text: 'Incorporate numeric digits (0–9) throughout the password.' });
    }

    if (!checks.hasSymbol) {
      tips.push({ type: 'tip', text: 'Include special characters (such as @, #, $, %, &, *) to dramatically raise entropy.' });
    }

    if (flaws.hasSeqAlpha || flaws.hasSeqNum) {
      tips.push({ type: 'warning', text: 'Avoid predictable sequences such as "123", "abc", or consecutive keyboard runs.' });
    }

    if (flaws.hasRepeats) {
      tips.push({ type: 'warning', text: 'Avoid repeating identical characters consecutively (e.g. "aaa" or "111").' });
    }

    if (tips.length === 0 && analysis.levelIndex >= 4) {
      tips.push({
        type: 'success',
        text: 'Outstanding password! It is long, complex, and free from predictable patterns.'
      });
      tips.push({
        type: 'tip',
        text: 'Tip: Consider using a password manager to store this credential safely without reusing it on other websites.'
      });
    }

    return tips;
  }

  // Real-time UI synchronization
  let lastEvaluatedString = '';
  function updateCheckerUI() {
    const pwd = passwordInput.value;
    const len = pwd.length;

    btnClear.style.display = len > 0 ? 'flex' : 'none';
    charCount.textContent = len;
    const entropy = calculateEntropy(pwd);
    entropyValue.textContent = `${entropy} bits`;

    const analysis = evaluatePassword(pwd);

    // Update real session statistics on distinct evaluation
    if (pwd.length >= 4 && pwd !== lastEvaluatedString) {
      lastEvaluatedString = pwd;
      sessionState.passwordsAnalyzed++;
      statPasswordsAnalyzed.textContent = sessionState.passwordsAnalyzed;
      profTotalActions.textContent = `${sessionState.passwordsAnalyzed + sessionState.passwordsGenerated} operations`;

      if (analysis.categoryKey) {
        sessionState.categoryCounts[analysis.categoryKey]++;
        catCntVweak.textContent = sessionState.categoryCounts.veryWeak;
        catCntWeak.textContent = sessionState.categoryCounts.weak;
        catCntMed.textContent = sessionState.categoryCounts.medium;
        catCntStrong.textContent = sessionState.categoryCounts.strong;
        catCntVstrong.textContent = sessionState.categoryCounts.veryStrong;
      }
      addSessionActivity(`Analyzed credential (${analysis.levelName}, ${entropy} bits)`);
    }

    // Update Status Pill & Frame
    strengthScorePercent.textContent = `${analysis.score}%`;
    strengthLevelTag.textContent = analysis.levelName;
    strengthLevelTag.className = `strength-badge-tag ${analysis.levelClass}`;

    inputFrame.className = 'input-glow-frame';
    if (analysis.levelIndex > 0) {
      const stateClasses = ['', 'state-very-weak', 'state-weak', 'state-medium', 'state-strong', 'state-very-strong'];
      inputFrame.classList.add(stateClasses[analysis.levelIndex]);
    }

    // Segmented Meter
    const activeClassMap = ['', 'active-very-weak', 'active-weak', 'active-medium', 'active-strong', 'active-very-strong'];
    meterSegments.forEach((seg, idx) => {
      seg.className = 'meter-segment';
      if (idx < analysis.levelIndex) {
        seg.classList.add(activeClassMap[analysis.levelIndex]);
      }
    });

    // Crack Time
    const crackTime = calculateCrackTime(pwd);
    crackTimeValue.textContent = crackTime.text;
    crackTimeSub.textContent = crackTime.sub;

    // Checklist
    const checkMapping = [
      { el: checkLen8, passed: analysis.checks.hasLen8 },
      { el: checkLen12, passed: analysis.checks.hasLen12 },
      { el: checkUpper, passed: analysis.checks.hasUpper },
      { el: checkLower, passed: analysis.checks.hasLower },
      { el: checkNumber, passed: analysis.checks.hasNumber },
      { el: checkSymbol, passed: analysis.checks.hasSymbol },
      { el: checkPatterns, passed: analysis.checks.avoidsPatterns }
    ];

    let passedCount = 0;
    checkMapping.forEach(({ el, passed }) => {
      if (passed) {
        el.classList.add('passed');
        passedCount++;
      } else {
        el.classList.remove('passed');
      }
    });
    checklistProgress.textContent = `${passedCount}/7 Passed`;

    // Suggestions
    const suggestions = generateSuggestions(pwd, analysis);
    if (suggestions.length === 0) {
      suggestionsContainer.innerHTML = `
        <div class="suggestion-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <p>Type a password above to receive real-time, personalized suggestions to maximize security.</p>
        </div>
      `;
    } else {
      const listHtml = suggestions.map(s => {
        let iconSvg = '';
        if (s.type === 'warning') {
          iconSvg = `<svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
        } else if (s.type === 'success') {
          iconSvg = `<svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        } else {
          iconSvg = `<svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        }
        return `
          <li class="suggestion-item ${s.type}">
            ${iconSvg}
            <span>${s.text}</span>
          </li>
        `;
      }).join('');
      suggestionsContainer.innerHTML = `<ul class="suggestions-list">${listHtml}</ul>`;
    }
  }

  // Synchronize Dashboard Quick Input Mini Checker
  dashQuickInput.addEventListener('input', () => {
    const val = dashQuickInput.value;
    const analysis = evaluatePassword(val);
    dashQuickLabel.textContent = `${analysis.score}% - ${analysis.levelName}`;

    const activeClasses = ['', 'active-very-weak', 'active-weak', 'active-medium', 'active-strong', 'active-very-strong'];
    dashMeterSegs.forEach((seg, idx) => {
      seg.className = 'meter-segment';
      if (idx < analysis.levelIndex) {
        seg.classList.add(activeClasses[analysis.levelIndex]);
      }
    });
  });

  // Main Checker Listeners
  passwordInput.addEventListener('input', updateCheckerUI);

  btnToggleVisibility.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    iconEyeShow.style.display = isPassword ? 'none' : 'block';
    iconEyeHide.style.display = isPassword ? 'block' : 'none';
    passwordInput.focus();
  });

  btnClear.addEventListener('click', () => {
    passwordInput.value = '';
    updateCheckerUI();
    passwordInput.focus();
    showToast('Input cleared', 'info');
  });

  btnCopyInput.addEventListener('click', () => {
    copyToClipboard(passwordInput.value, 'Password copied to clipboard!');
  });

  btnReset.addEventListener('click', () => {
    passwordInput.value = '';
    updateCheckerUI();
    passwordInput.focus();
    showToast('Analyzer reset', 'info');
  });

  // =========================================================================
  // 5. SECURE PASSWORD GENERATOR ENGINE (8 TO 64 CHARACTERS)
  // =========================================================================

  const CHARSETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };
  const AMBIGUOUS_REGEX = /[O0lI1|`'"]/;

  function generateSecurePassword() {
    const length = parseInt(genLengthSlider.value, 10);
    const useUpper = genUpper.checked;
    const useLower = genLower.checked;
    const useNumbers = genNumbers.checked;
    const useSymbols = genSymbols.checked;
    const avoidAmbiguous = genAvoidAmbiguous.checked;

    let availableSets = [];
    let combinedPool = '';

    if (useUpper) {
      let pool = CHARSETS.upper;
      if (avoidAmbiguous) pool = pool.replace(AMBIGUOUS_REGEX, '');
      availableSets.push(pool);
      combinedPool += pool;
    }
    if (useLower) {
      let pool = CHARSETS.lower;
      if (avoidAmbiguous) pool = pool.replace(AMBIGUOUS_REGEX, '');
      availableSets.push(pool);
      combinedPool += pool;
    }
    if (useNumbers) {
      let pool = CHARSETS.numbers;
      if (avoidAmbiguous) pool = pool.replace(AMBIGUOUS_REGEX, '');
      availableSets.push(pool);
      combinedPool += pool;
    }
    if (useSymbols) {
      let pool = CHARSETS.symbols;
      if (avoidAmbiguous) pool = pool.replace(AMBIGUOUS_REGEX, '');
      availableSets.push(pool);
      combinedPool += pool;
    }

    if (combinedPool.length === 0) {
      showToast('Please enable at least one character set!', 'info');
      return '';
    }

    const passwordChars = [];

    // Ensure at least one from each selected pool
    availableSets.forEach(set => {
      const idx = getSecureRandomInt(set.length);
      passwordChars.push(set[idx]);
    });

    // Fill remaining length
    while (passwordChars.length < length) {
      const idx = getSecureRandomInt(combinedPool.length);
      passwordChars.push(combinedPool[idx]);
    }

    // Cryptographic Fisher-Yates Shuffle
    for (let i = passwordChars.length - 1; i > 0; i--) {
      const j = getSecureRandomInt(i + 1);
      const temp = passwordChars[i];
      passwordChars[i] = passwordChars[j];
      passwordChars[j] = temp;
    }

    const finalPassword = passwordChars.join('');
    generatedPasswordText.textContent = finalPassword;
    dashQuickGenDisplay.textContent = finalPassword.substring(0, 20) + (finalPassword.length > 20 ? '...' : '');

    // Track usage
    sessionState.passwordsGenerated++;
    statPasswordsGenerated.textContent = sessionState.passwordsGenerated;
    profTotalActions.textContent = `${sessionState.passwordsAnalyzed + sessionState.passwordsGenerated} operations`;
    addSessionActivity(`Generated ${length}-character random credential`);

    btnGeneratePassword.classList.add('rotating');
    setTimeout(() => btnGeneratePassword.classList.remove('rotating'), 500);

    return finalPassword;
  }

  // Length slider change (8 to 64)
  genLengthSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    genLengthVal.textContent = `${val} characters`;
    generateSecurePassword();
  });

  // Checkbox option toggles
  [genUpper, genLower, genNumbers, genSymbols, genAvoidAmbiguous].forEach(cb => {
    cb.addEventListener('change', () => {
      if (!genUpper.checked && !genLower.checked && !genNumbers.checked && !genSymbols.checked) {
        cb.checked = true;
        showToast('At least one character set must remain enabled', 'info');
        return;
      }
      generateSecurePassword();
    });
  });

  btnGeneratePassword.addEventListener('click', generateSecurePassword);

  // Show/Hide Generated Password
  let genPasswordHidden = false;
  btnToggleGenView.addEventListener('click', () => {
    genPasswordHidden = !genPasswordHidden;
    if (genPasswordHidden) {
      generatedPasswordText.dataset.raw = generatedPasswordText.textContent;
      generatedPasswordText.textContent = '•'.repeat(generatedPasswordText.dataset.raw.length);
      genViewLabel.textContent = 'Show';
    } else {
      generatedPasswordText.textContent = generatedPasswordText.dataset.raw || generatedPasswordText.textContent;
      genViewLabel.textContent = 'Hide';
    }
  });

  btnCopyGenerated.addEventListener('click', () => {
    const pwd = generatedPasswordText.dataset.raw || generatedPasswordText.textContent;
    if (pwd && pwd !== 'Generating...') {
      copyToClipboard(pwd, 'Generated password copied!');
    }
  });

  // Test in Checker Button
  btnTestInChecker.addEventListener('click', () => {
    const pwd = generatedPasswordText.dataset.raw || generatedPasswordText.textContent;
    if (pwd && pwd !== 'Generating...') {
      passwordInput.value = pwd;
      updateCheckerUI();
      switchView('checker');
      showToast('Loaded into Analyzer for inspection!', 'success');
    }
  });

  // Dashboard quick generator actions
  dashQuickRegen.addEventListener('click', generateSecurePassword);
  dashQuickCopy.addEventListener('click', () => {
    const pwd = generatedPasswordText.dataset.raw || generatedPasswordText.textContent;
    copyToClipboard(pwd, 'Generated password copied!');
  });

  // =========================================================================
  // 6. PROFILE MANAGEMENT & MODALS
  // =========================================================================

  // Generic modal close handlers
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.closeModal;
      const modal = document.getElementById(modalId);
      if (modal) modal.style.display = 'none';
    });
  });

  // Privacy & About Modals
  btnOpenPrivacy.addEventListener('click', () => {
    modalPrivacy.style.display = 'flex';
  });

  btnOpenAbout.addEventListener('click', () => {
    modalAbout.style.display = 'flex';
  });

  // Initialize Default Generator & Checker
  generateSecurePassword();
  updateCheckerUI();
});
