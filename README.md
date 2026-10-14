# Password Strength Checker

An enterprise-grade, modern, and privacy-first **Cybersecurity Web Application** designed with sleek cyber dark aesthetics, neon purple/cyan glowing accents, a cinematic opening animation, and an intuitive single-page interface with **strictly four core navigation options**:

1. **Home**
2. **Password Checker**
3. **Password Generator**
4. **History**

> **No Login, Registration, Profile, Dashboard, or unnecessary features.** 100% focused on cryptographic password strength analysis, CSPRNG synthesis, and privacy-preserving audit logs.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Security](https://img.shields.io/badge/Security-NIST%20SP%20800--63B-brightgreen)
![Client-Side](https://img.shields.io/badge/Zero--Knowledge-100%25%20In--Browser-purple)
![Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Vanilla)-success)
![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blueviolet?logo=github)

---

## 🌐 Live Website & Repository
* **Live Link**: [https://yasalapurevanth97-coder.github.io/Password-checker/](https://yasalapurevanth97-coder.github.io/Password-checker/)
* **GitHub Repository**: [https://github.com/yasalapurevanth97-coder/Password-checker](https://github.com/yasalapurevanth97-coder/Password-checker)

---

## 🌟 Application Architecture & Features

### 1. 🎬 Cinematic Opening Animation
* **Visual Iconography**: High-tech animated shield and lock with expanding pulse rings.
* **Canvas Cyber Particles**: Ambient network nodes and connecting threads rendered using HTML5 Canvas.
* **Text Reveal**: Animated reveal for **PASSWORD STRENGTH CHECKER**.
* **Tagline**: *"Secure Your Digital World"*.
* **Glowing Progress Bar**: Simulated cryptographic initialization sequence with real-time percentage counter.
* **Skip Intro Button**: Quick bypass for instant access to the Home page.

### 2. 🏠 Home Page
* **Main Heading**: *"Password Strength Checker"*
* **Subtitle**: *"Check, Create, and Manage Strong Passwords."*
* **Cybersecurity Hero Graphic**: Animated rotating shield illustration with active laser scanline and floating feature chips (*Shannon Entropy*, *CSPRNG 256-bit*, *Zero Server Storage*).
* **Three Interactive Feature Cards**:
  1. **Password Checker**: Check password strength instantly and receive security suggestions.
  2. **Password Generator**: Generate strong, random passwords using customizable options.
  3. **Password History**: View previous analysis results and generated password records according to the privacy rules.
* **Interactive Navigation Buttons**: Seamless one-click transitions to all tools.

### 3. 🔍 Password Checker Page
* **Real-Time Heuristic Engine**:
  * Character length counter with live Shannon entropy calculation in bits.
  * 5-segment animated strength progress meter:
    1. **Very Weak** (Red)
    2. **Weak** (Orange)
    3. **Medium** (Yellow)
    4. **Strong** (Cyan)
    5. **Very Strong** (Emerald Green)
  * Brute-Force GPU Cluster Crack Time Estimator (assuming 10 billion guesses/sec).
* **Interactive Security Checklist**:
  * At least 8 characters
  * 12+ characters recommended
  * Uppercase letters (A–Z)
  * Lowercase letters (a–z)
  * Numeric digits (0–9)
  * Special symbols (!@#$%^&*)
  * Avoids common patterns & dictionary words (filters breached passwords, sequential chars, repeated chars).
* **Personalized Improvement Suggestions**: Context-aware guidance tailored to the user's input.
* **Input Utilities**: One-click password visibility toggle and clear button.
* **Security Guarantee**: Password analysis runs **100% locally in the browser**. Passwords are never logged, stored, or sent over any network.

### 4. ⚡ Password Generator Page
* **Cryptographically Secure Randomness**: Driven by Web Crypto API (`window.crypto.getRandomValues`) with unbiased character selection.
* **Customizable Length**: Smooth slider from **8 to 64 characters**.
* **Character Pool Toggles**:
  * Uppercase Letters (`A–Z`)
  * Lowercase Letters (`a–z`)
  * Numeric Digits (`0–9`)
  * Special Characters (`!@#$%^&*...`)
  * Option to **Exclude Ambiguous Characters** (`0`, `O`, `o`, `1`, `l`, `I`, `|`).
* **Visual Display & Actions**:
  * Animated reveal effect when generating passwords.
  * Show/Hide masking toggle (`••••••••`).
  * One-click Copy-to-Clipboard with animated toast feedback.
  * Regenerate button with spin icon animation.
  * **Test in Checker** button to seamlessly send the generated credential to the Checker for instant evaluation.

### 5. 📜 History Page (Strict Zero-Knowledge)
* **Strict Privacy Rule**: **Actual password values are NEVER stored or displayed.**
* **Anonymous Metadata Only**: Records include timestamp, length, strength category, Shannon entropy bits, checklist score, and crack time.
* **Filter Tabs**: Toggle between **All Records**, **Analyzed**, and **Generated**.
* **Clear History Modal**: Confirmation dialog preventing accidental deletion of local records.
* **Empty State**: Elegant empty state illustration with quick action links when no history is present.

### 6. 🛡️ Navigation & Footer
* **Navigation Bar**: Fixed top navbar containing **ONLY 4 items**: Home, Password Checker, Password Generator, and History. Features a glowing active tab indicator line and mobile hamburger drawer.
* **Footer**:
  `© 2026 Password Strength Checker. All Rights Reserved. Yasalapu Revanth Vardhan`

---

## 🛠️ Technology Stack
* **HTML5**: Clean, semantic markup following accessibility (WAI-ARIA) best practices.
* **CSS3**: Vanilla CSS with custom properties, glassmorphism, glowing borders, CSS Grid, Flexbox, and reduced-motion accessibility.
* **JavaScript (ES6+)**: Pure vanilla JavaScript for fast performance without frameworks or bloated bundles.
* **Web Cryptography API**: Cryptographic pseudo-random number generator (CSPRNG) for password generation.

---

## 🚀 How to Run Locally

### Option 1: Direct File Launch
Double-click [index.html](file:///c:/Users/Revanth/OneDrive/Documents/PRO/index.html) in your file explorer to open it in any modern browser (Chrome, Edge, Firefox, Brave, Safari).

### Option 2: Python Local Server
```powershell
# In the project directory:
python -m http.server 3000
```
Then visit: `http://localhost:3000`

### Option 3: Node.js (npx)
```powershell
npx -y serve .
```

---

## 📁 Repository Structure
```
Password-checker/
├── index.html        # Main HTML5 Single Page Application (4 Views)
├── style.css         # Modern Cybersecurity Design System & Animations
├── script.js         # Core Engine: Intro, Navigation, Checker, Generator, History
├── README.md         # Comprehensive Project Documentation
└── .github/
    └── workflows/
        └── deploy.yml # GitHub Actions automated Pages deployment workflow
```

---

## 🔒 Privacy & Security Commitment
1. **No External Requests**: Zero analytical trackers, zero telemetry, and zero remote logging.
2. **Zero Plaintext Storage**: Entered passwords never touch `localStorage`, `sessionStorage`, cookies, or remote databases.
3. **Device-Only Metadata**: History records reside solely in the user's browser `localStorage` and can be completely wiped at any time using the "Clear History" button.

---

## 📜 Copyright
&copy; 2026 Password Strength Checker. All Rights Reserved. Yasalapu Revanth Vardhan
