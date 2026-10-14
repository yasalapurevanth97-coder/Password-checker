/**
 * PASSWORD STRENGTH CHECKER - Application Core Logic
 * Fully In-Browser, Zero-Knowledge Privacy Architecture
 * Only 4 Main Navigation Options: Home, Password Checker, Password Generator, History
 * Web Crypto API CSPRNG & NIST SP 800-63B Analysis
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. STATE & CONSTANTS
  // =========================================================================
  const STORAGE_KEY = 'PasswordChecker_History_Records_v2';

  // Common breached / dictionary passwords list
  const COMMON_BREACHED_PASSWORDS = new Set([
    'password', 'password1', '123456', '12345678', '123456789', '12345',
    'qwerty', '111111', 'abc123', 'admin', 'welcome', 'login', 'iloveyou',
    'master', 'sunshine', 'princess', 'football', 'monkey', 'charlie',
    'donald', 'secret', 'pass123', 'trustno1', 'shadow', 'killer', 'superman',
    'batman', 'starwars', 'letmein', 'access', 'default', 'security'
  ]);

  // Character sets
  const CHAR_POOLS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`',
    ambiguous: '0Oo1lI|'
  };

  let historyRecords = loadHistory();
  let currentGeneratedPassword = '';
  let isGenPasswordMasked = false;
  let checkerSaveTimeout = null;
  let lastCheckedPassword = '';

  // =========================================================================
  // 2. DOM REFERENCES
  // =========================================================================
  // Intro Screen
  const introScreen = document.getElementById('intro-screen');
  const introCanvas = document.getElementById('intro-particles-canvas');
  const introProgressFill = document.getElementById('intro-progress-fill');
  const introStatusText = document.getElementById('intro-status-text');
  const introStatusPercent = document.getElementById('intro-status-percent');
  const btnSkipIntro = document.getElementById('btn-skip-intro');

  // Navigation
  const mainNavbar = document.getElementById('main-navbar');
  const navTabs = document.querySelectorAll('.nav-tab');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const btnMobileToggle = document.getElementById('btn-mobile-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');

  // View Panels
  const viewPanels = {
    home: document.getElementById('view-home'),
    checker: document.getElementById('view-checker'),
    generator: document.getElementById('view-generator'),
    history: document.getElementById('view-history')
  };

  // Password Checker
  const passwordInput = document.getElementById('password-input');
  const btnToggleVisibility = document.getElementById('btn-toggle-visibility');
  const btnClear = document.getElementById('btn-clear');
  const charCount = document.getElementById('char-count');
  const entropyValue = document.getElementById('entropy-value');
  const strengthLevelTag = document.getElementById('strength-level-tag');
  const strengthScorePercent = document.getElementById('strength-score-percent');
  const crackTimeValue = document.getElementById('crack-time-value');
  const crackTimeSub = document.getElementById('crack-time-sub');
  const suggestionsContainer = document.getElementById('suggestions-container');
  const checklistProgress = document.getElementById('checklist-progress');

  const meterSegments = [
    document.getElementById('meter-seg-1'),
    document.getElementById('meter-seg-2'),
    document.getElementById('meter-seg-3'),
    document.getElementById('meter-seg-4'),
    document.getElementById('meter-seg-5')
  ];

  const checkRows = {
    len8: document.getElementById('check-len-8'),
    len12: document.getElementById('check-len-12'),
    upper: document.getElementById('check-upper'),
    lower: document.getElementById('check-lower'),
    number: document.getElementById('check-number'),
    symbol: document.getElementById('check-symbol'),
    patterns: document.getElementById('check-patterns')
  };

  // Password Generator
  const generatedPasswordText = document.getElementById('generated-password');
  const genBitsBadge = document.getElementById('gen-bits-badge');
  const btnToggleGenView = document.getElementById('btn-toggle-gen-view');
  const btnCopyGenerated = document.getElementById('btn-copy-generated');
  const btnRegenIcon = document.getElementById('btn-regen-icon');
  const iconRegenSpin = document.getElementById('icon-regen-spin');
  const genLengthSlider = document.getElementById('gen-length');
  const genLengthVal = document.getElementById('gen-length-val');
  const genUpper = document.getElementById('gen-upper');
  const genLower = document.getElementById('gen-lower');
  const genNumbers = document.getElementById('gen-numbers');
  const genSymbols = document.getElementById('gen-symbols');
  const genAvoidAmbiguous = document.getElementById('gen-avoid-ambiguous');
  const btnGeneratePassword = document.getElementById('btn-generate-password');
  const btnTestInChecker = document.getElementById('btn-test-in-checker');

  // History Elements
  const historyItemsContainer = document.getElementById('history-items-container');
  const historyEmptyState = document.getElementById('history-empty-state');
  const countAll = document.getElementById('count-all');
  const countChecks = document.getElementById('count-checks');
  const countGenerated = document.getElementById('count-generated');
  const filterBtns = document.querySelectorAll('.history-filter-btn');
  const btnOpenClearModal = document.getElementById('btn-open-clear-modal');

  // Modal Elements
  const modalClearHistory = document.getElementById('modal-clear-history');
  const btnCancelClear = document.getElementById('btn-cancel-clear');
  const btnConfirmClear = document.getElementById('btn-confirm-clear');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  let activeHistoryFilter = 'all';

  // =========================================================================
  // 3. CINEMATIC INTRO ANIMATION & PARTICLES
  // =========================================================================
  let introAnimationRunning = true;
  let particleReqId = null;

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
    const particleCount = Math.min(Math.floor((width * height) / 14000), 70);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '#8b5cf6' : '#06b6d4',
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    function renderParticles() {
      if (!introAnimationRunning) return;
      ctx.clearRect(0, 0, width, height);

      // Draw particle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.18 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw individual particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }

      particleReqId = requestAnimationFrame(renderParticles);
    }

    renderParticles();
  }

  function startIntroProgress() {
    if (!introScreen) return;
    initIntroCanvas();

    const stages = [
      { pct: 25, text: 'Initializing Cryptographic Engine...' },
      { pct: 55, text: 'Calibrating NIST SP 800-63B Rules...' },
      { pct: 85, text: 'Synthesizing Entropy Pools...' },
      { pct: 100, text: 'System Initialized. Welcome.' }
    ];

    let currentStage = 0;
    let progress = 0;

    const timer = setInterval(() => {
      if (!introAnimationRunning) {
        clearInterval(timer);
        return;
      }

      progress += 2;
      if (introProgressFill) introProgressFill.style.width = `${progress}%`;
      if (introStatusPercent) introStatusPercent.textContent = `${progress}%`;

      if (currentStage < stages.length && progress >= stages[currentStage].pct) {
        if (introStatusText) introStatusText.textContent = stages[currentStage].text;
        currentStage++;
      }

      if (progress >= 100) {
        clearInterval(timer);
        setTimeout(dismissIntro, 400);
      }
    }, 28);

    if (btnSkipIntro) {
      btnSkipIntro.addEventListener('click', dismissIntro);
    }
  }

  function dismissIntro() {
    if (!introAnimationRunning) return;
    introAnimationRunning = false;
    if (particleReqId) cancelAnimationFrame(particleReqId);

    if (introScreen) {
      introScreen.classList.add('fade-out');
      setTimeout(() => {
        introScreen.style.display = 'none';
      }, 600);
    }
  }

  // =========================================================================
  // 4. SPA VIEW ROUTING (HOME, CHECKER, GENERATOR, HISTORY)
  // =========================================================================
  function switchView(viewName) {
    if (!viewPanels[viewName]) {
      viewName = 'home';
    }

    // Update views
    Object.keys(viewPanels).forEach(key => {
      const panel = viewPanels[key];
      if (panel) {
        if (key === viewName) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      }
    });

    // Update desktop tabs
    navTabs.forEach(tab => {
      if (tab.dataset.view === viewName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update mobile links
    mobileNavLinks.forEach(link => {
      if (link.dataset.view === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close mobile drawer
    if (mobileNavDrawer) {
      mobileNavDrawer.classList.remove('open');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL Hash without reload
    if (window.location.hash !== `#${viewName}`) {
      history.pushState(null, null, `#${viewName}`);
    }

    // If switching to History, refresh records list
    if (viewName === 'history') {
      renderHistoryList();
    }
  }

  // Attach nav link events
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => switchView(link.dataset.view));
  });

  // Mobile menu drawer toggle
  if (btnMobileToggle && mobileNavDrawer) {
    btnMobileToggle.addEventListener('click', () => {
      mobileNavDrawer.classList.toggle('open');
    });
  }

  // Generic data-navigate buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-navigate]');
    if (btn) {
      e.preventDefault();
      const targetView = btn.dataset.navigate;
      switchView(targetView);
    }
  });

  // Handle URL hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && viewPanels[hash]) {
      switchView(hash);
    }
  });

  // =========================================================================
  // 5. TOAST NOTIFICATIONS
  // =========================================================================
  function showToast(message, type = 'normal') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
    
    const iconSvg = type === 'success' 
      ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // =========================================================================
  // 6. PASSWORD STRENGTH CHECKER ENGINE
  // =========================================================================
  function calculateEntropy(pwd) {
    if (!pwd) return 0;
    const len = pwd.length;
    let poolSize = 0;
    if (/[a-z]/.test(pwd)) poolSize += 26;
    if (/[A-Z]/.test(pwd)) poolSize += 26;
    if (/[0-9]/.test(pwd)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 33;
    if (poolSize === 0) return 0;

    // Charset entropy: H = L * log2(poolSize)
    const charsetEntropy = len * Math.log2(poolSize);

    // Shannon entropy: -sum(p * log2(p))
    const freq = {};
    for (const char of pwd) {
      freq[char] = (freq[char] || 0) + 1;
    }
    let shannon = 0;
    for (const char in freq) {
      const p = freq[char] / len;
      shannon -= p * Math.log2(p);
    }
    const adjustedShannon = shannon * len;

    // Use conservative blend
    return Math.round(Math.min(charsetEntropy, adjustedShannon * 1.15));
  }

  function estimateCrackTime(entropyBits) {
    if (entropyBits <= 0) return { timeStr: 'Instant (0 seconds)', subText: 'Enter a password to evaluate brute-force resistance' };
    
    // 10 Billion guesses per second (modern GPU cluster)
    const guessesPerSec = 1e10;
    const totalCombinations = Math.pow(2, entropyBits);
    const seconds = totalCombinations / (2 * guessesPerSec);

    if (seconds < 1) {
      return { timeStr: 'Instant (< 1 second)', subText: 'Vulnerable to immediate offline hash cracking' };
    } else if (seconds < 60) {
      return { timeStr: `${Math.round(seconds)} seconds`, subText: 'Compromised within a single coffee break' };
    } else if (seconds < 3600) {
      return { timeStr: `${Math.round(seconds / 60)} minutes`, subText: 'Extremely vulnerable to consumer-grade hardware' };
    } else if (seconds < 86400) {
      return { timeStr: `${Math.round(seconds / 3600)} hours`, subText: 'Vulnerable to dedicated dictionary/mask attacks' };
    } else if (seconds < 31536000) {
      return { timeStr: `${Math.round(seconds / 86400)} days`, subText: 'Moderate brute-force protection' };
    } else if (seconds < 31536000 * 100) {
      return { timeStr: `${Math.round(seconds / 31536000)} years`, subText: 'Solid enterprise-level defense' };
    } else if (seconds < 31536000 * 1e6) {
      return { timeStr: `${Math.round(seconds / (31536000 * 1000))} Thousand years`, subText: 'Virtually unbreakable under modern computational models' };
    } else {
      return { timeStr: 'Trillions of years', subText: 'Mathematically immune to brute-force cluster attacks' };
    }
  }

  function evaluatePassword(pwd) {
    if (!pwd) {
      return {
        score: 0,
        level: 'Awaiting Input',
        levelClass: '',
        entropy: 0,
        crackTime: { timeStr: 'Instant (0 seconds)', subText: 'Enter a password to evaluate brute-force resistance' },
        checklist: {
          len8: false,
          len12: false,
          upper: false,
          lower: false,
          number: false,
          symbol: false,
          patterns: false
        },
        passedCount: 0,
        suggestions: ['Enter at least 8 characters to begin cryptographic evaluation.']
      };
    }

    const len = pwd.length;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
    const isLen8 = len >= 8;
    const isLen12 = len >= 12;

    // Pattern & Breached Check
    const lowerTrim = pwd.toLowerCase().trim();
    const isBreached = COMMON_BREACHED_PASSWORDS.has(lowerTrim);
    const hasRepeats = /(.)\1{2,}/.test(pwd); // 3 repeated characters e.g. aaa
    const hasSequence = /(012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|qwe|wer|ert)/i.test(pwd);
    const avoidsPatterns = !isBreached && !hasRepeats && !hasSequence;

    const checklist = {
      len8: isLen8,
      len12: isLen12,
      upper: hasUpper,
      lower: hasLower,
      number: hasNumber,
      symbol: hasSymbol,
      patterns: avoidsPatterns
    };

    let passedCount = 0;
    Object.values(checklist).forEach(v => { if (v) passedCount++; });

    // Scoring calculation (0 - 100)
    let score = 0;

    // Length contribution
    if (len >= 8) score += 15;
    if (len >= 12) score += 15;
    if (len >= 16) score += 15;
    if (len >= 20) score += 5;

    // Character pools
    if (hasLower) score += 10;
    if (hasUpper) score += 10;
    if (hasNumber) score += 10;
    if (hasSymbol) score += 15;

    // Pattern bonus / penalties
    if (avoidsPatterns) {
      score += 10;
    } else {
      score = Math.max(0, score - 25);
    }

    if (isBreached) {
      score = Math.min(score, 15);
    }

    score = Math.max(0, Math.min(100, score));

    // 5-Tier Level Assignment
    let level = 'Very Weak';
    let levelClass = 'vweak';

    if (score >= 85 && passedCount >= 6) {
      level = 'Very Strong';
      levelClass = 'vstrong';
    } else if (score >= 65 && passedCount >= 4) {
      level = 'Strong';
      levelClass = 'strong';
    } else if (score >= 45) {
      level = 'Medium';
      levelClass = 'med';
    } else if (score >= 25) {
      level = 'Weak';
      levelClass = 'weak';
    } else {
      level = 'Very Weak';
      levelClass = 'vweak';
    }

    // Dynamic suggestions
    const suggestions = [];
    if (isBreached) {
      suggestions.push({ type: 'warn', text: 'This is a commonly breached password. Never use widely known phrases.' });
    }
    if (hasRepeats) {
      suggestions.push({ type: 'warn', text: 'Avoid repeating identical characters consecutively (e.g. "aaa").' });
    }
    if (hasSequence) {
      suggestions.push({ type: 'warn', text: 'Avoid keyboard sequences like "123", "abc", or "qwerty".' });
    }
    if (!isLen12) {
      suggestions.push({ type: 'warn', text: 'Increase password length to 12 or more characters for exponentially higher brute-force resistance.' });
    }
    if (!hasUpper || !hasLower) {
      suggestions.push({ type: 'warn', text: 'Mix both uppercase (A-Z) and lowercase (a-z) letters.' });
    }
    if (!hasNumber) {
      suggestions.push({ type: 'warn', text: 'Include at least one numeric digit (0-9).' });
    }
    if (!hasSymbol) {
      suggestions.push({ type: 'warn', text: 'Add special symbols (!@#$%^&*) to expand the cryptographic search space.' });
    }
    if (score >= 85 && avoidsPatterns) {
      suggestions.push({ type: 'good', text: 'Excellent! This credential satisfies enterprise-grade NIST SP 800-63B standards.' });
      suggestions.push({ type: 'info', text: 'Ensure this unique password is not reused across other accounts.' });
    }

    const entropy = calculateEntropy(pwd);
    const crackTime = estimateCrackTime(entropy);

    return {
      score,
      level,
      levelClass,
      entropy,
      crackTime,
      checklist,
      passedCount,
      suggestions
    };
  }

  function updateCheckerUI(analysis, pwd) {
    const len = pwd.length;

    // Length & Entropy
    if (charCount) charCount.textContent = `${len} character${len === 1 ? '' : 's'}`;
    if (entropyValue) entropyValue.textContent = `${analysis.entropy} bits`;

    // Strength tag & score percent
    if (strengthScorePercent) strengthScorePercent.textContent = `${analysis.score}%`;
    if (strengthLevelTag) {
      strengthLevelTag.textContent = analysis.level;
      strengthLevelTag.className = 'strength-level-tag';
      if (analysis.levelClass) {
        strengthLevelTag.classList.add(`fill-${analysis.levelClass}`);
      }
    }

    // Update 5-Segment Meter
    const activeSegments = {
      'Very Weak': 1,
      'Weak': 2,
      'Medium': 3,
      'Strong': 4,
      'Very Strong': 5
    }[analysis.level] || (analysis.score > 0 ? 1 : 0);

    meterSegments.forEach((seg, idx) => {
      if (!seg) return;
      seg.className = 'meter-segment';
      if (idx < activeSegments && analysis.levelClass) {
        seg.classList.add(`fill-${analysis.levelClass}`);
      }
    });

    // Crack Time
    if (crackTimeValue) crackTimeValue.textContent = analysis.crackTime.timeStr;
    if (crackTimeSub) crackTimeSub.textContent = analysis.crackTime.subText;

    // Checklist badges
    if (checklistProgress) {
      checklistProgress.textContent = `${analysis.passedCount} of 7 Passed`;
    }

    const setCheckRow = (row, isPassed) => {
      if (!row) return;
      if (isPassed) {
        row.classList.add('passed');
        const icon = row.querySelector('.check-icon');
        if (icon) icon.textContent = '✓';
      } else {
        row.classList.remove('passed');
        const icon = row.querySelector('.check-icon');
        if (icon) icon.textContent = '✕';
      }
    };

    setCheckRow(checkRows.len8, analysis.checklist.len8);
    setCheckRow(checkRows.len12, analysis.checklist.len12);
    setCheckRow(checkRows.upper, analysis.checklist.upper);
    setCheckRow(checkRows.lower, analysis.checklist.lower);
    setCheckRow(checkRows.number, analysis.checklist.number);
    setCheckRow(checkRows.symbol, analysis.checklist.symbol);
    setCheckRow(checkRows.patterns, analysis.checklist.patterns);

    // Suggestions List
    if (suggestionsContainer) {
      suggestionsContainer.innerHTML = '';
      analysis.suggestions.forEach(s => {
        const li = document.createElement('li');
        li.className = `suggestion-item ${typeof s === 'string' ? 'info' : s.type}`;
        li.textContent = typeof s === 'string' ? s : s.text;
        suggestionsContainer.appendChild(li);
      });
    }
  }

  // Real-time input handling on passwordInput
  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      const pwd = passwordInput.value;
      const analysis = evaluatePassword(pwd);
      updateCheckerUI(analysis, pwd);

      // Debounce saving anonymous metadata to history
      clearTimeout(checkerSaveTimeout);
      if (pwd.length >= 3 && pwd !== lastCheckedPassword) {
        checkerSaveTimeout = setTimeout(() => {
          lastCheckedPassword = pwd;
          saveAnonymousCheckRecord(analysis, pwd.length);
        }, 1200);
      }
    });
  }

  // Show/Hide password toggle
  if (btnToggleVisibility && passwordInput) {
    btnToggleVisibility.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      
      const eyeShow = btnToggleVisibility.querySelector('.eye-show');
      const eyeHide = btnToggleVisibility.querySelector('.eye-hide');
      if (eyeShow && eyeHide) {
        eyeShow.style.display = isPassword ? 'none' : 'block';
        eyeHide.style.display = isPassword ? 'block' : 'none';
      }
    });
  }

  // Clear password input button
  if (btnClear && passwordInput) {
    btnClear.addEventListener('click', () => {
      passwordInput.value = '';
      lastCheckedPassword = '';
      clearTimeout(checkerSaveTimeout);
      const emptyAnalysis = evaluatePassword('');
      updateCheckerUI(emptyAnalysis, '');
      passwordInput.focus();
    });
  }

  // =========================================================================
  // 7. SECURE CSPRNG PASSWORD GENERATOR
  // =========================================================================
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

  function generateSecurePassword() {
    const length = parseInt(genLengthSlider ? genLengthSlider.value : 20, 10);
    const useUpper = genUpper ? genUpper.checked : true;
    const useLower = genLower ? genLower.checked : true;
    const useNumbers = genNumbers ? genNumbers.checked : true;
    const useSymbols = genSymbols ? genSymbols.checked : true;
    const avoidAmbiguous = genAvoidAmbiguous ? genAvoidAmbiguous.checked : false;

    // Safety fallback: at least one pool must be selected
    if (!useUpper && !useLower && !useNumbers && !useSymbols) {
      if (genUpper) genUpper.checked = true;
      showToast('At least one character type must remain selected', 'normal');
    }

    const activePools = [];
    if (genUpper && genUpper.checked) {
      let pool = CHAR_POOLS.upper;
      if (avoidAmbiguous) pool = pool.replace(/[O|I]/g, '');
      activePools.push(pool);
    }
    if (genLower && genLower.checked) {
      let pool = CHAR_POOLS.lower;
      if (avoidAmbiguous) pool = pool.replace(/[o|l]/g, '');
      activePools.push(pool);
    }
    if (genNumbers && genNumbers.checked) {
      let pool = CHAR_POOLS.numbers;
      if (avoidAmbiguous) pool = pool.replace(/[0|1]/g, '');
      activePools.push(pool);
    }
    if (genSymbols && genSymbols.checked) {
      let pool = CHAR_POOLS.symbols;
      if (avoidAmbiguous) pool = pool.replace(/[|]/g, '');
      activePools.push(pool);
    }

    const combinedPool = activePools.join('');
    if (!combinedPool) return 'Secur3Pass!';

    const passwordChars = [];

    // Ensure at least one character from each selected pool
    activePools.forEach(pool => {
      const idx = getSecureRandomInt(pool.length);
      passwordChars.push(pool[idx]);
    });

    // Fill remaining length from combined pool
    while (passwordChars.length < length) {
      const idx = getSecureRandomInt(combinedPool.length);
      passwordChars.push(combinedPool[idx]);
    }

    // Fisher-Yates cryptographically secure shuffle
    for (let i = passwordChars.length - 1; i > 0; i--) {
      const j = getSecureRandomInt(i + 1);
      [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }

    currentGeneratedPassword = passwordChars.join('');

    // Animate generation scrambling effect
    animatePasswordReveal(currentGeneratedPassword);

    // Update entropy bits badge
    const entropy = Math.round(length * Math.log2(combinedPool.length));
    if (genBitsBadge) genBitsBadge.textContent = `Entropy: ~${entropy} bits`;

    // Log anonymous generation metadata to History (Strict Zero-Knowledge)
    saveAnonymousGenerationRecord(length, {
      upper: genUpper ? genUpper.checked : true,
      lower: genLower ? genLower.checked : true,
      numbers: genNumbers ? genNumbers.checked : true,
      symbols: genSymbols ? genSymbols.checked : true,
      avoidAmbiguous
    }, entropy);
  }

  function animatePasswordReveal(finalPwd) {
    if (!generatedPasswordText) return;
    const glyphs = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let iterations = 0;
    const maxIterations = 6;

    const interval = setInterval(() => {
      if (isGenPasswordMasked) {
        generatedPasswordText.textContent = '•'.repeat(finalPwd.length);
        clearInterval(interval);
        return;
      }

      generatedPasswordText.textContent = finalPwd
        .split('')
        .map((char, index) => {
          if (index < (iterations / maxIterations) * finalPwd.length) {
            return char;
          }
          return glyphs[getSecureRandomInt(glyphs.length)];
        })
        .join('');

      iterations++;
      if (iterations >= maxIterations) {
        clearInterval(interval);
        generatedPasswordText.textContent = isGenPasswordMasked ? '•'.repeat(finalPwd.length) : finalPwd;
      }
    }, 22);
  }

  // Generator slider listener
  if (genLengthSlider && genLengthVal) {
    genLengthSlider.addEventListener('input', () => {
      genLengthVal.textContent = genLengthSlider.value;
      generateSecurePassword();
    });
  }

  // Generator option toggle listeners
  [genUpper, genLower, genNumbers, genSymbols, genAvoidAmbiguous].forEach(toggle => {
    if (toggle) {
      toggle.addEventListener('change', () => generateSecurePassword());
    }
  });

  // Big generate button
  if (btnGeneratePassword) {
    btnGeneratePassword.addEventListener('click', () => {
      generateSecurePassword();
    });
  }

  // Small spin regen icon
  if (btnRegenIcon) {
    btnRegenIcon.addEventListener('click', () => {
      if (iconRegenSpin) {
        iconRegenSpin.style.transform = 'rotate(360deg)';
        iconRegenSpin.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => {
          iconRegenSpin.style.transform = '';
          iconRegenSpin.style.transition = '';
        }, 400);
      }
      generateSecurePassword();
    });
  }

  // Generator view mask toggle
  if (btnToggleGenView && generatedPasswordText) {
    btnToggleGenView.addEventListener('click', () => {
      isGenPasswordMasked = !isGenPasswordMasked;
      generatedPasswordText.textContent = isGenPasswordMasked 
        ? '•'.repeat(currentGeneratedPassword.length) 
        : currentGeneratedPassword;

      const eyeShow = btnToggleGenView.querySelector('.eye-show');
      const eyeHide = btnToggleGenView.querySelector('.eye-hide');
      if (eyeShow && eyeHide) {
        eyeShow.style.display = isGenPasswordMasked ? 'none' : 'block';
        eyeHide.style.display = isGenPasswordMasked ? 'block' : 'none';
      }
    });
  }

  // Copy generated password to clipboard
  if (btnCopyGenerated) {
    btnCopyGenerated.addEventListener('click', async () => {
      if (!currentGeneratedPassword) return;
      try {
        await navigator.clipboard.writeText(currentGeneratedPassword);
        showToast('Password copied to clipboard securely!', 'success');
      } catch (err) {
        // Fallback for older or restricted environments
        const textArea = document.createElement('textarea');
        textArea.value = currentGeneratedPassword;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Password copied to clipboard securely!', 'success');
      }
    });
  }

  // "Test in Checker" Button
  if (btnTestInChecker) {
    btnTestInChecker.addEventListener('click', () => {
      if (!currentGeneratedPassword) return;
      switchView('checker');
      if (passwordInput) {
        passwordInput.value = currentGeneratedPassword;
        passwordInput.type = 'text'; // Show it so user can see what was brought in
        const eyeShow = btnToggleVisibility ? btnToggleVisibility.querySelector('.eye-show') : null;
        const eyeHide = btnToggleVisibility ? btnToggleVisibility.querySelector('.eye-hide') : null;
        if (eyeShow && eyeHide) {
          eyeShow.style.display = 'none';
          eyeHide.style.display = 'block';
        }
        const analysis = evaluatePassword(currentGeneratedPassword);
        updateCheckerUI(analysis, currentGeneratedPassword);
      }
      showToast('Generated password loaded into Checker for evaluation', 'normal');
    });
  }

  // =========================================================================
  // 8. PRIVACY-PRESERVING HISTORY MANAGEMENT
  // =========================================================================
  function loadHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('LocalStorage error reading history:', e);
      return [];
    }
  }

  function saveHistoryToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historyRecords));
    } catch (e) {
      console.warn('LocalStorage error writing history:', e);
    }
  }

  function saveAnonymousCheckRecord(analysis, length) {
    // STRICT ZERO-KNOWLEDGE: Password string is NEVER stored!
    const record = {
      id: `chk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'check',
      timestamp: Date.now(),
      length: length,
      strengthCategory: analysis.level,
      levelClass: analysis.levelClass,
      scorePercent: analysis.score,
      entropyBits: analysis.entropy,
      crackTime: analysis.crackTime.timeStr,
      passedChecks: analysis.passedCount
    };

    historyRecords.unshift(record);
    if (historyRecords.length > 50) historyRecords.pop(); // Cap to 50 items
    saveHistoryToStorage();
    updateHistoryBadgeCounts();
  }

  function saveAnonymousGenerationRecord(length, options, entropyBits) {
    // STRICT ZERO-KNOWLEDGE: Generated password is NEVER stored!
    const record = {
      id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'generate',
      timestamp: Date.now(),
      length: length,
      charOptions: options,
      entropyBits: entropyBits
    };

    historyRecords.unshift(record);
    if (historyRecords.length > 50) historyRecords.pop(); // Cap to 50 items
    saveHistoryToStorage();
    updateHistoryBadgeCounts();
  }

  function updateHistoryBadgeCounts() {
    const total = historyRecords.length;
    const checks = historyRecords.filter(r => r.type === 'check').length;
    const gens = historyRecords.filter(r => r.type === 'generate').length;

    if (countAll) countAll.textContent = total;
    if (countChecks) countChecks.textContent = checks;
    if (countGenerated) countGenerated.textContent = gens;
  }

  function formatTimestamp(ts) {
    const date = new Date(ts);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function renderHistoryList() {
    updateHistoryBadgeCounts();

    if (!historyItemsContainer || !historyEmptyState) return;

    const filtered = historyRecords.filter(item => {
      if (activeHistoryFilter === 'all') return true;
      return item.type === activeHistoryFilter;
    });

    if (filtered.length === 0) {
      historyItemsContainer.innerHTML = '';
      historyEmptyState.style.display = 'flex';
      return;
    }

    historyEmptyState.style.display = 'none';
    historyItemsContainer.innerHTML = '';

    filtered.forEach(record => {
      const card = document.createElement('div');
      card.className = 'history-item-card';

      if (record.type === 'check') {
        card.innerHTML = `
          <div class="item-top-row">
            <span class="item-type-badge check">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>Password Analyzed</span>
            </span>
            <span class="item-time-stamp">${formatTimestamp(record.timestamp)}</span>
          </div>

          <div class="item-metrics-grid">
            <div class="metric-cell">
              <span class="metric-cell-label">Strength</span>
              <span class="strength-pill ${record.levelClass || 'vweak'}">${record.strengthCategory || 'Unknown'}</span>
            </div>
            <div class="metric-cell">
              <span class="metric-cell-label">Length</span>
              <span class="metric-cell-val font-mono">${record.length} chars</span>
            </div>
            <div class="metric-cell">
              <span class="metric-cell-label">Shannon Entropy</span>
              <span class="metric-cell-val font-mono">${record.entropyBits || 0} bits</span>
            </div>
            <div class="metric-cell">
              <span class="metric-cell-label">Checklist Score</span>
              <span class="metric-cell-val font-mono">${record.passedChecks || 0}/7 Passed (${record.scorePercent || 0}%)</span>
            </div>
            <div class="metric-cell">
              <span class="metric-cell-label">Cluster Crack Time</span>
              <span class="metric-cell-val font-mono" style="color: #38bdf8;">${record.crackTime || 'Instant'}</span>
            </div>
          </div>
        `;
      } else {
        const opts = record.charOptions || {};
        card.innerHTML = `
          <div class="item-top-row">
            <span class="item-type-badge generate">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              <span>CSPRNG Generated</span>
            </span>
            <span class="item-time-stamp">${formatTimestamp(record.timestamp)}</span>
          </div>

          <div class="item-metrics-grid">
            <div class="metric-cell">
              <span class="metric-cell-label">Length</span>
              <span class="metric-cell-val font-mono">${record.length} chars</span>
            </div>
            <div class="metric-cell">
              <span class="metric-cell-label">Entropy</span>
              <span class="metric-cell-val font-mono">${record.entropyBits || 0} bits</span>
            </div>
            <div class="metric-cell" style="grid-column: span 2;">
              <span class="metric-cell-label">Character Pools Included</span>
              <div class="item-options-tags" style="margin-top: 0.25rem;">
                ${opts.upper ? '<span class="opt-tag">Uppercase (A-Z)</span>' : ''}
                ${opts.lower ? '<span class="opt-tag">Lowercase (a-z)</span>' : ''}
                ${opts.numbers ? '<span class="opt-tag">Numbers (0-9)</span>' : ''}
                ${opts.symbols ? '<span class="opt-tag">Symbols (!@#)</span>' : ''}
                ${opts.avoidAmbiguous ? '<span class="opt-tag">No Ambiguous</span>' : ''}
              </div>
            </div>
          </div>
        `;
      }

      historyItemsContainer.appendChild(card);
    });
  }

  // History Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeHistoryFilter = btn.dataset.filter;
      renderHistoryList();
    });
  });

  // Clear History Modal handling
  if (btnOpenClearModal && modalClearHistory) {
    btnOpenClearModal.addEventListener('click', () => {
      modalClearHistory.style.display = 'flex';
    });
  }

  if (btnCancelClear && modalClearHistory) {
    btnCancelClear.addEventListener('click', () => {
      modalClearHistory.style.display = 'none';
    });
  }

  if (btnConfirmClear && modalClearHistory) {
    btnConfirmClear.addEventListener('click', () => {
      historyRecords = [];
      saveHistoryToStorage();
      renderHistoryList();
      modalClearHistory.style.display = 'none';
      showToast('All activity history wiped from local device', 'success');
    });
  }

  // Close modal when clicking backdrop
  if (modalClearHistory) {
    modalClearHistory.addEventListener('click', (e) => {
      if (e.target === modalClearHistory) {
        modalClearHistory.style.display = 'none';
      }
    });
  }

  // =========================================================================
  // 9. INITIALIZATION ROUTINE
  // =========================================================================
  // Initialize default views & initial generator run
  startIntroProgress();
  generateSecurePassword();
  updateHistoryBadgeCounts();

  // Route according to initial URL hash (default to 'home')
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && viewPanels[initialHash]) {
    switchView(initialHash);
  } else {
    switchView('home');
  }
});
