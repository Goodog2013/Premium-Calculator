# GreatCalc ✨

Premium desktop calculator for Windows built with `Tauri + React + TypeScript + Vite + Tailwind`.

[🇬🇧 English](#english) | [🇷🇺 Русский](#русский)

---

## English

### 🚀 Overview
GreatCalc is not a basic calculator clone. It is a polished premium-tech app focused on:
- fast daily workflows
- advanced engineering features
- smooth visual interactions
- reliable behavior and strong architecture

### 🧩 Core Features
- Standard mode
- Scientific mode
- Programmer mode (bitwise + BIN/OCT/DEC/HEX)
- Unit converter
- Currency converter with real exchange rates
- Graph mode with real-time plotting
- History, favorites, memory
- Keyboard support and shortcuts
- Light / dark / system themes
- Language setting (50 most-used world languages)
- Persistent state between sessions

### 💱 Currency Rates
- Live providers:
  - Open ER API
  - Frankfurter API
- Offline fallback provider when network is unavailable
- Automatic background refresh every 5 minutes
- Refresh on app focus/network return

### 🛠 Tech Stack
- Frontend: React 19, TypeScript, Vite, TailwindCSS, Zustand
- Motion/UI: Framer Motion, Lucide
- Graphs: Recharts
- Math engine: Math.js (safe parser flow, no `eval`)
- Desktop shell: Tauri 2
- Tests: Vitest + React Testing Library

### 📦 Installation
1. Install Node.js 20+ (24+ recommended)
2. Install Rust toolchain: https://www.rust-lang.org/tools/install
3. Install Visual Studio C++ Build Tools + WebView2 runtime (Windows)
4. Install dependencies:

```bash
npm install
```

### ▶️ Run
Web dev:

```bash
npm run dev
```

Desktop dev (Tauri):

```bash
npm run tauri:dev
```

### 🏗 Build
Web:

```bash
npm run build:web
```

Desktop bundle:

```bash
npm run build:desktop
```

All release artifacts (`Releases/web` + `Releases/desktop`):

```bash
npm run build:all
```

### ✅ Tests & Quality
```bash
npm run test
npm run typecheck
npm run lint
```

Current local status:
- `typecheck` ✅
- `lint` ✅
- `test` ✅ (27 tests)

### 🧱 Architecture
`src/` is split by responsibility:
- `components/` presentation
- `state/` state/actions (Zustand)
- `engine/` math evaluation + graph points
- `format/` number formatting/parsing
- `converters/` unit conversion logic/catalog
- `providers/` data providers (currency abstraction)
- `persistence/` storage keys/boundaries
- `desktop/` desktop bindings
- `hooks/` app behavior hooks (theme, keyboard, auto-refresh, etc.)
- `i18n/` language catalog/config

### 🎨 UX / WOW Details
- Glass/layered premium UI
- Smooth mode transitions
- Meaningful microinteractions
- Real-time graph animation
- Focused layout with collapsible advanced modules

### 🔮 Future Ideas
1. Symbolic tools (equations, factorization)
2. Plugin system for custom converters
3. Encrypted profile export/import
4. Optional arbitrary-precision mode
5. Code-splitting for smaller bundle size

### 📄 License
This project is licensed under the MIT License. See [LICENSE](./LICENSE).

---

## Русский

### 🚀 О проекте
GreatCalc — это не обычный калькулятор, а desktop-приложение с premium-интерфейсом для Windows:
- быстрые повседневные вычисления
- расширенные инженерные режимы
- плавные и аккуратные анимации
- надежная архитектура и стабильная работа

### 🧩 Основные возможности
- Стандартный режим
- Научный режим
- Режим программиста (битовые операции + BIN/OCT/DEC/HEX)
- Конвертер единиц
- Конвертер валют с реальными курсами
- Графический режим (функции в реальном времени)
- История, избранное, память
- Поддержка клавиатуры и горячих клавиш
- Светлая / темная / системная темы
- Настройка языка (50 самых популярных языков)
- Сохранение состояния между сессиями

### 💱 Курсы валют
- Live-провайдеры:
  - Open ER API
  - Frankfurter API
- Резервный офлайн-провайдер при отсутствии сети
- Автообновление в фоне каждые 5 минут
- Обновление при возврате в окно приложения и при восстановлении сети

### 🛠 Технологии
- Frontend: React 19, TypeScript, Vite, TailwindCSS, Zustand
- Анимации/UI: Framer Motion, Lucide
- Графики: Recharts
- Математическое ядро: Math.js (без `eval`)
- Desktop-оболочка: Tauri 2
- Тесты: Vitest + React Testing Library

### 📦 Установка
1. Установите Node.js 20+ (лучше 24+)
2. Установите Rust toolchain: https://www.rust-lang.org/tools/install
3. Установите Visual Studio C++ Build Tools + WebView2 runtime (Windows)
4. Установите зависимости:

```bash
npm install
```

### ▶️ Запуск
Web-режим разработки:

```bash
npm run dev
```

Desktop-режим разработки (Tauri):

```bash
npm run tauri:dev
```

### 🏗 Сборка
Web-сборка:

```bash
npm run build:web
```

Desktop-сборка:

```bash
npm run build:desktop
```

Собрать и сложить артефакты в `Releases/web` и `Releases/desktop`:

```bash
npm run build:all
```

### ✅ Тесты и качество
```bash
npm run test
npm run typecheck
npm run lint
```

Текущий локальный статус:
- `typecheck` ✅
- `lint` ✅
- `test` ✅ (27 тестов)

### 🧱 Архитектура
`src/` разделен по зонам ответственности:
- `components/` — UI/presentation
- `state/` — состояние и действия (Zustand)
- `engine/` — вычислительное ядро и точки графика
- `format/` — форматирование и парсинг чисел
- `converters/` — конвертеры единиц
- `providers/` — абстракции и провайдеры данных (валюты)
- `persistence/` — ключи и границы persistence
- `desktop/` — desktop bindings
- `hooks/` — хуки поведения (тема, клавиатура, автообновление и т.д.)
- `i18n/` — каталог языков и настройки

### 🎨 UX / WOW-детали
- Премиальный layered/glass стиль
- Плавные переходы между режимами
- Ненавязчивые микроинтеракции
- Анимированный график в реальном времени
- Возможность свернуть продвинутые модули для фокусного сценария

### 🔮 Идеи на будущее
1. Символьная математика (уравнения, факторизация)
2. Плагинная система для кастомных конвертеров
3. Экспорт/импорт профиля с шифрованием
4. Режим повышенной точности (arbitrary precision)
5. Code splitting для уменьшения размера бандла

### 📄 Лицензия
Проект распространяется по лицензии MIT. См. файл [LICENSE](./LICENSE).
