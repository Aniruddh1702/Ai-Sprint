# 🏠 PG Proof — Student City Accommodation & Companion App

> **Check. Compare. Choose.**  
> A production-grade mobile application built for students relocating to new Indian cities (Indore, Bengaluru, Pune, Delhi NCR, Mumbai, etc.). Features a tactile **Claymorphism / Clay Art UI design**, a genuinely integrated **AI Rental Assistant**, scam detection, and a comprehensive **City Companion Suite**.

[![Expo](https://img.shields.io/badge/Expo-~54.0-black?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.79-blue?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org)
[![Node Express](https://img.shields.io/badge/Backend-Node%20Express-green?logo=node.js)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## ✨ Features

### 🎨 1. Tactile Claymorphism / Clay Art Design
- **Squishy 3D Bevels**: Bottom borders with calibrated pastel bevel shades across all color variants (`blue`, `mint`, `lavender`, `peach`, `rose`, `cream`).
- **Inner Gloss Sheens**: Multi-layer drop shadows and top reflection overlays simulating real figurines.
- **Spring Animations**: Tactile press and release micro-interactions on all cards, buttons, and avatar elements.

### 🤖 2. Genuine AI Rental Assistant ("PG Proof Buddy")
- **Live AI Model Integration**: Secure Node/Express server accessing Google Gemini / OpenAI with structured response parsing.
- **Hinglish & English Support**: Empathetic, student-friendly tone tailored for college students negotiating deposits, asking about agreement clauses, or checking tenant rights.
- **Resilient Fallback Mode**: If the backend is offline or unconfigured, the app falls back to an offline rule-based heuristic knowledge base.

### 🚌 3. Student City Companion Suite
- 🚌 **Transport Guide**: City-specific transit options (Metro, BRTS, shared auto, city buses, bike taxis). Computes adjusted peak-hour times, fare splits for groups, and student route recommendations (Indore, Bengaluru, Pune, Delhi NCR).
- 🚨 **Scam Alerts**: Active alerts on fake listings, advance deposit traps, and QR code scams.
- 🍱 **Food & Tiffin Guide**: Verified student dabbas, monthly thali subscriptions, and diet filters.
- 🧭 **City Starter Kit**: Essential emergency contacts, 24x7 chemists, print hubs, and student stationery markets.

### 📊 4. Financial Transparency & Hidden Cost Analysis
- **Full Cash Outlay Breakdown**: Calculates 1st-month cash needed (deposit + advance + broker commission + maintenance).
- **Side-by-Side Comparison Engine**: Compare 2+ PGs simultaneously with an explainable "Why This Recommendation?" breakdown.
- **City-Responsive Sync**: Changing city preferences in the ClayHeader dynamically filters verified PGs and local transit data.

---

## 🏗️ Architecture

```
pg-proof/
├── server/                     # Backend AI Proxy Server
│   ├── index.ts               # Express API endpoints (/api/chat, /api/analyze-listing)
│   ├── package.json
│   └── .env.example
├── src/
│   ├── app/                   # Expo Router File-based Navigation
│   │   ├── _layout.tsx        # Root Navigation Stack & AppProvider
│   │   ├── index.tsx          # Home Dashboard (Rearranged Claymorphism Blocks)
│   │   ├── analyze.tsx        # PG Analyzer & Red Flag Scanner
│   │   ├── buddy.tsx          # Interactive AI Chat with Buddy Avatar
│   │   ├── compare.tsx        # Multi-PG Comparison Table
│   │   ├── report.tsx         # Detailed Cost & Amenity Breakdown
│   │   ├── transport.tsx      # Transport Guide & Fare Split Engine
│   │   ├── food.tsx           # Food & Tiffin Guide
│   │   ├── scams.tsx          # Scam Alerts & Risk Checklist
│   │   └── starter-kit.tsx    # City Starter Kit & Essentials
│   ├── components/clay/       # Claymorphism Component Library
│   │   ├── ClayCard.tsx       # 3D Clay Card with Variant Bevels
│   │   ├── ClayButton.tsx     # Squishy Spring Animated Button
│   │   ├── ClayStatBox.tsx    # Metric Card with 3D Depth
│   │   ├── ClayHeader.tsx     # City Preference & Profile Bar
│   │   ├── ClayBuddyAvatar.tsx# Multi-mood Clay Art Avatar
│   │   ├── ClayInput.tsx      # Inset Tactile Input Fields
│   │   └── ClayBadge.tsx      # Rounded Pastel Status Badges
│   ├── constants/             # Design Tokens & Datasets
│   │   ├── clayTheme.ts       # Palette, Shadows, Radii
│   │   ├── sampleListings.ts  # Verified PG Dataset (Indore, Bengaluru, Pune)
│   │   └── transportData.ts   # City-wise Transport Options
│   ├── context/
│   │   └── AppContext.tsx     # Centralized State Management & Persistence
│   └── utils/
│       ├── costCalculator.ts  # Rent, Security Deposit & Utility Math
│       ├── comparisonEngine.ts# Algorithm for Comparing PGs
│       └── __tests__/         # Comprehensive Unit Tests (100% Pass)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Install App Dependencies
```bash
cd pg-proof
npm install
```

### 2. (Optional) Configure AI Backend Server
```bash
cd server
npm install
cp .env.example .env
# Add your GEMINI_API_KEY or OPENAI_API_KEY in .env
npm start
```
*Note: The app runs in Smart Fallback mode if no API key is provided.*

### 3. Launch the Expo App
```bash
# Return to pg-proof root directory
npx expo start
```
- Press `w` to open in your web browser.
- Scan the QR code with **Expo Go** on Android or iOS.

---

## 🧪 Testing

Run all unit test suites:
```bash
npm test
```

Run TypeScript validation:
```bash
npx tsc --noEmit
```

---

## 📄 License
This project is open-source under the MIT License.
