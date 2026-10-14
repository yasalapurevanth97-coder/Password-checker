# ShieldPass PRO — Enterprise Password Strength Checker & Generator

An enterprise-grade, modern, and privacy-focused **Cybersecurity Platform** featuring a cinematic opening animation, zero-knowledge in-browser architecture (no sign-in or login barrier required), a real-time Password Strength Checker, a cryptographically secure 8–64 character Password Generator, an active Home Dashboard with live session metrics, and a dedicated Security Standards Audit page.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Security](https://img.shields.io/badge/Security-NIST%20SP%20800--63B-brightgreen)
![Client-Side](https://img.shields.io/badge/Zero--Knowledge-100%25%20In--Browser-purple)
![Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Vanilla)-success)

---

## 🌟 Comprehensive Features

### 1. 🎬 Cinematic Opening Animation
- **Full-Screen Intro**: Features animated shield and lock iconography, pulsing aura rings, and a glowing canvas particle system.
- **Title Reveal**: Text-reveal animation for *"PASSWORD STRENGTH CHECKER"*.
- **Progress Indicator**: Animated progress bar advancing through cryptographic initialization stages.
- **Skip Control**: One-click "Skip Intro" option to transition directly to the dashboard.

### 2. 🛡️ 100% Zero-Knowledge & Anonymous Access
- **No Sign-In or Login Barrier**: Immediate, frictionless access to all cybersecurity tools.
- **Strictly In-Browser**: Calculations and operations execute entirely in local client memory.
- **Zero Plaintext Storage**: Entered passwords are never logged, persisted, or stored in localStorage or databases.
- **Zero Network Transmission**: 0 external API requests for password analysis — completely private and offline-capable.

### 3. 📊 Home Dashboard
- **Personalized Greeting**: Welcomes the user with dynamic time-of-day greetings (`Good morning`, `Good afternoon`, `Good evening`).
- **Live Session Metrics**:
  - Total passwords analyzed during active session.
  - Total passwords generated via CSPRNG.
  - Real-time strength distribution pills (`VW`, `W`, `M`, `S`, `VS`).
  - Active session duration stopwatch.
- **Interactive Action Cards**:
  - Quick-test input with instant visual meter.
  - Quick generator display with one-click copy and regenerate.
  - Real-time audit activity log.
  - Client-side security vault overview.
- **Cyber Hygiene Best Practices**: 4 cards detailing password uniqueness, password managers, 2FA, and passphrases.

### 4. 🛡️ Live Password Strength Analyzer
- **Real-Time Heuristic Engine**:
  - Length checking (8+, 12+, 16+ characters).
  - Multi-case letter detection (A–Z, a–z).
  - Numeric digits (0–9) and special symbol verification.
  - Common dictionary blacklist (30+ common breached passwords).
  - Predictable keyboard sequence detection (`qwerty`, `123456`, `abcdef`).
  - Repetitive character detection (`aaa`, `111`).
- **5-Tier Strength Classification**:
  1. **Very Weak** (Red glow)
  2. **Weak** (Orange glow)
  3. **Medium** (Golden yellow glow)
  4. **Strong** (Electric cyan glow)
  5. **Very Strong** (Emerald green glow)
- **Shannon Entropy Calculation**: Instant mathematical measurement in bits.
- **GPU Cluster Crack Time Estimator**: Mathematical brute-force estimates assuming 10-billion guesses/sec modern GPU cluster throughput.
- **7-Point Checklist**: Interactive animated checkmarks.
- **Personalized Suggestions**: Dynamic, contextual tips to improve credential resistance.

### 5. ⚡ CSPRNG Password Generator (8 to 64 Characters)
- **Web Crypto Engine**: Powered by `window.crypto.getRandomValues()` with rejection sampling for zero modulo bias.
- **Expanded Range**: Custom slider supporting lengths from **8 to 64 characters**.
- **Character Pool Customization**: Toggles for Uppercase, Lowercase, Numbers, and Symbols.
- **Exclude Ambiguous Characters**: Filter out look-alike glyphs (`0`, `O`, `l`, `1`, `|`, `'`, `"`).
- **Show/Hide & Copy**: Mask/unmask generated password, copy with animated toast notification.
- **Test in Checker**: Instantly loads the generated credential into the live analyzer.

### 6. 📜 Dedicated Security & Privacy Audit Page
- **Client Security Architecture**: Documents zero-knowledge in-browser isolation and operating metrics.
- **NIST SP 800-63B Compliance**: Guidelines on minimum length, entropy distribution, and dictionary resistance.
- **Cryptographic Guarantees**: Transparent statement on local memory lifecycle and zero-network footprint.

---

## 🚀 How to Run Locally

Since ShieldPass PRO has **zero build steps or external dependencies**, you can launch it immediately.

### Option 1: Direct File Launch
Double-click [index.html](file:///c:/Users/Revanth/OneDrive/Documents/PRO/index.html) in Windows File Explorer to open it in Chrome, Edge, Firefox, or Brave.

### Option 2: Local HTTP Server (Python)
If you prefer running via a local server:
```powershell
# Open terminal in the project directory
python -m http.server 3000
```
Then navigate to: **`http://localhost:3000`**

### Option 3: Node.js
```powershell
npx -y serve .
```

---

## 📁 File Structure

```
├── index.html       # Single-Page Architecture with intro, auth, dashboard, checker, generator & profile
├── style.css        # Cyber dark theme, canvas styles, glassmorphism, responsive grid & animations
├── script.js        # PBKDF2 Web Crypto auth, entropy engine, CSPRNG generator, SPA router & stats
└── README.md        # Comprehensive documentation & setup instructions
```

---

## 🛡️ Privacy & Security Commitments
- **Zero Server Transmission**: No credentials ever leave your browser.
- **Zero Plaintext Storage**: Account passwords undergo 100,000 PBKDF2 rounds with cryptographically secure random salts.
- **Transparent Heuristics**: Clearly states that strength scores are heuristic mathematical models.

---

## 📜 License
MIT License. Free for educational, commercial, and portfolio use.
