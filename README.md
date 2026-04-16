# LogFit 🏋️‍♂️

[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

**LogFit** is a premium, high-performance workout tracking application built with Expo. Designed for serious athletes who value data integrity and a seamless user experience, LogFit provides robust session management, real-time performance tracking, and military-grade data portability.

---

## ✨ Key Features

### 🚀 Advanced Session Management
- **Intelligent Resumption**: Never lose a workout. LogFit detects active sessions and allows you to resume exactly where you left off, even after app restarts.
- **Draggable Live Timer**: A floating, interactive timer bubble that stays with you across the app, ensuring you're always aware of your session duration.
- **Dynamic Exercise Injection**: Add movements on the fly with a high-performance searchable bottom sheet.

### ⏱️ Precision Tracking
- **Multi-Type Tracking**: Support for Strength (Weight/Reps), Cardio (Time/Distance/Calories), and Timed (Plank, etc.) exercises.
- **Persistent Set Stopwatches**: Dedicated live stopwatches for timed sets that sync globally and survive app closure.
- **Rest Timer System**: Custom-designed rest overlays with haptic feedback to keep your training intensity high.

### 💎 Premium UI/UX
- **Aesthetic Excellence**: A cohesive design system utilizing glassmorphism, smooth gradients, and curated typography (Inter/Outfit).
- **Fluid Animations**: 60fps interactions powered by `react-native-reanimated` and `react-native-gesture-handler`.
- **Custom Alert System**: Replaces generic system alerts with high-end, animated dialog platforms.

### 🔒 Data Portability & Privacy
- **Local-First Architecture**: Your data stays on your device in a high-performance SQLite database.
- **Cloud-Free Backups**: Export your entire workout "Vault" or specific routine "Portability" files for safe keeping.
- **Zero-Friction Import**: Seamlessly restore your training history with one-tap import functionality.

---

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 54) / [React Native](https://reactnative.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database**: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- **Animations**: [React Native Reanimated](https://www.reanimated.org/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **UI Components**: [Bottom Sheet](https://gorhom.github.io/react-native-bottom-sheet/), [Expo Blur](https://docs.expo.dev/versions/latest/sdk/blur/)
- **Icons**: [Ionicons](https://ionicons.com/) via Expo Vector Icons

---

## 📁 Project Structure

```text
LogFit/
├── app/                  # Expo Router directory (screens & layouts)
│   ├── (tabs)/           # Main navigation tabs
│   ├── workout.tsx       # Core active workout engine
│   └── _layout.tsx       # Root configuration & global providers
├── components/           # Reusable UI components (AppButton, AppAlert, etc.)
├── constants/            # Design tokens, exercise lists, and static data
├── services/             # Database (SQLite) & Data Portability logic
├── store/                # Zustand stores for global state management
├── assets/               # Local icons, images, and fonts
└── scripts/              # Build and maintenance scripts
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/client) app installed on your physical device

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npx expo start
   ```

3. **Run on a device/emulator**
   - Use the **Expo Go** app to scan the QR code.
   - Or press `a` for Android or `i` for iOS.

---

## 📜 Changelog

### Version 1.2.0 (Current)
- **Modal-First UX**: Transitioned all timers to dialog-based card layouts.
- **Persistent Stopwatches**: Implemented rehydrating per-set timers for cardio/timed sets.
- **Workout Status Dialog**: Added quick-view progress modal for the floating timer.
- **Draggable UI**: Enabled vertical repositioning for the floating workout clock.
- **Persistence Refinements**: Accurate timer resumption across app sessions via global store.

### Version 1.1.0
- **Advanced Validation**: Implemented strict checks for empty movements and sets.
- **AppAlert System**: Created custom animated dialogs for error and warning feedback.
- **Database Optimization**: Enhanced SQLite queries for faster set logging.
- **Resume Session UI**: Redesigned the "Active Session Found" flow.

### Version 1.0.0
- **Core Architecture**: Initial release with SQLite integration and file-based routing.
- **Workout Logging**: Basic support for sets, reps, and weight tracking.
- **Exercise Library**: Searchable database of 100+ movements.

---

## 📄 License

This repository is **private** and proprietary. All rights reserved.

---

**Built with ❤️ by Pratik Amonkar.**
