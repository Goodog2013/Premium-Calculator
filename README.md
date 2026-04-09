# GreatCalc ✨

Premium desktop calculator for Windows built with `Tauri + React + TypeScript + Vite + Tailwind`.

[🇬🇧 English](#english) | [🇷🇺 Русский](#русский)

---

## English

### 🚀 Overview
GreatCalc is a premium-tech calculator app focused on:
- fast daily usage
- advanced math and engineering tools
- elegant visual design and smooth animations
- clean architecture and production-quality reliability

### 🧩 Implemented Features
- Standard mode
- Scientific mode
- Programmer mode (bitwise + BIN/OCT/DEC/HEX)
- Unit converter
- Currency converter with real exchange rates
- Graph mode with real-time plotting
- **Symbolic mode** (equation solving, factorization, simplification)
- **Plugin converter system** (custom JSON converters with persistence)
- History, favorites, memory
- Keyboard support and shortcuts
- Light / dark / system themes
- Language setting (50 most-used world languages)
- IP-based language detection button in Settings
- Persistent state between sessions
- Custom desktop title bar (minimize / maximize / close)

### 💱 Currency Rates
- Live providers:
- Open ER API
- Frankfurter API
- Offline fallback provider
- Auto-refresh every 5 minutes in background
- Refresh on app focus / network return

### 🛡️ Safety Notes
- No `eval` in calculator/converter logic
- Safe parser-based evaluation (`mathjs`)
- Symbolic features are isolated in a dedicated engine
- Custom converter plugins are validated before execution

### 🛠 Tech Stack
- Frontend: React 19, TypeScript, Vite, TailwindCSS, Zustand
- UI/Motion: Framer Motion, Lucide
- Graphs: Recharts
- Math engine: Math.js
- Symbolic engine: Nerdamer
- Desktop shell: Tauri 2
- Tests: Vitest + React Testing Library

### 📦 Installation
1. Install Node.js 20+ (24+ recommended)
2. Install Rust toolchain: https://www.rust-lang.org/tools/install
3. Install Visual Studio 2022 Build Tools with:
- Desktop development with C++
- Windows 10/11 SDK
4. Ensure Microsoft Edge WebView2 Runtime is installed
5. Install dependencies:

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
Web build:

```bash
npm run build:web
```

Desktop installers (`.exe` + `.msi`):

```bash
npm run build:desktop
```

Collect release artifacts into `Releases/web` + `Releases/desktop`:

```bash
npm run build:all
```

If Windows desktop build fails with missing MSVC/SDK headers, run build from Developer Command Prompt (or initialize vcvars first):

```bash
cmd /c 'call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" && npm run build:desktop'
```

### 📁 Build Output Paths
- `src-tauri/target/release/bundle/nsis/GreatCalc_0.1.0_x64-setup.exe`
- `src-tauri/target/release/bundle/msi/GreatCalc_0.1.0_x64_en-US.msi`
- `Releases/desktop/`
- `Releases/web/`

### ✅ Tests & Quality
```bash
npm run test
npm run typecheck
npm run lint
```

Current local status:
- `typecheck` ✅
- `lint` ✅
- `test` ✅ (37 tests)

### 🧱 Architecture
`src/` split by responsibility:
- `components/` presentation layer
- `state/` app state and actions (Zustand)
- `engine/` math + graph + symbolic engines
- `format/` number formatting/parsing
- `converters/` unit and plugin converter engines
- `providers/` external/internal data providers
- `persistence/` storage boundaries and keys
- `desktop/` desktop bindings
- `hooks/` behavioral hooks (theme, keyboard, auto-refresh, etc.)
- `i18n/` language catalog/config

### 🎨 UX / WOW Highlights
- Premium layered/glass visual style
- Smooth transitions between modes
- Meaningful microinteractions
- Animated real-time graph rendering
- Collapsible advanced modules for focused daily use

### 🔮 Roadmap
1. Text problem solver mode (LM Studio / local LLM integration)
2. AI-assisted explanation mode for symbolic steps
3. Encrypted profile export/import
4. Optional arbitrary-precision mode
5. Bundle optimization and code-splitting

### 📄 License
MIT License. See [LICENSE](./LICENSE).

---

## Русский

### 🚀 О проекте
GreatCalc — это desktop-калькулятор для Windows в premium-tech стиле с упором на:
- скорость повседневных расчетов
- расширенные инженерные режимы
- аккуратный современный интерфейс
- надежную архитектуру и качество кода

### 🧩 Реализованные возможности
- Стандартный режим
- Научный режим
- Режим программиста (битовые операции + BIN/OCT/DEC/HEX)
- Конвертер единиц
- Конвертер валют с реальными курсами
- Графический режим с отрисовкой в реальном времени
- **Символьный режим** (решение уравнений, факторизация, упрощение)
- **Плагинная система конвертеров** (кастомные JSON-плагины + persistence)
- История, избранное, память
- Поддержка клавиатуры и hotkeys
- Светлая / темная / системная темы
- Выбор языка (50 самых популярных языков)
- Кнопка определения языка по IP в Settings
- Сохранение состояния между сессиями
- Кастомная верхняя панель окна (свернуть / развернуть / закрыть)

### 💱 Курсы валют
- Live-провайдеры:
- Open ER API
- Frankfurter API
- Офлайн fallback-провайдер
- Автообновление каждые 5 минут
- Обновление при возврате в окно и восстановлении сети

### 🛡️ Безопасность
- `eval` не используется
- Вычисления через безопасный parser (`mathjs`)
- Символьный функционал изолирован в отдельном движке
- Плагины конвертеров проходят валидацию перед запуском

### 🛠 Стек
- Frontend: React 19, TypeScript, Vite, TailwindCSS, Zustand
- UI/анимации: Framer Motion, Lucide
- Графики: Recharts
- Математика: Math.js
- Символьная математика: Nerdamer
- Desktop: Tauri 2
- Тесты: Vitest + React Testing Library

### 📦 Установка
1. Установите Node.js 20+ (лучше 24+)
2. Установите Rust: https://www.rust-lang.org/tools/install
3. Установите Visual Studio 2022 Build Tools с компонентами:
- Desktop development with C++
- Windows 10/11 SDK
4. Установите Microsoft Edge WebView2 Runtime
5. Установите зависимости:

```bash
npm install
```

### ▶️ Запуск
Web-режим:

```bash
npm run dev
```

Desktop-режим (Tauri):

```bash
npm run tauri:dev
```

### 🏗 Сборка
Web-сборка:

```bash
npm run build:web
```

Desktop-инсталлеры (`.exe` + `.msi`):

```bash
npm run build:desktop
```

Сборка и копирование артефактов в `Releases/web` и `Releases/desktop`:

```bash
npm run build:all
```

Если на Windows ошибка MSVC/SDK (например, отсутствуют заголовки), запускайте сборку из Developer Command Prompt или инициализируйте `vcvars64`:

```bash
cmd /c 'call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" && npm run build:desktop'
```

### 📁 Где лежат сборки
- `src-tauri/target/release/bundle/nsis/GreatCalc_0.1.0_x64-setup.exe`
- `src-tauri/target/release/bundle/msi/GreatCalc_0.1.0_x64_en-US.msi`
- `Releases/desktop/`
- `Releases/web/`

### ✅ Тесты и качество
```bash
npm run test
npm run typecheck
npm run lint
```

Текущий локальный статус:
- `typecheck` ✅
- `lint` ✅
- `test` ✅ (37 тестов)

### 🧱 Архитектура
`src/` разделен по слоям ответственности:
- `components/` — presentation/UI
- `state/` — состояние и действия (Zustand)
- `engine/` — вычислительное, графическое и символьное ядро
- `format/` — форматирование и парсинг чисел
- `converters/` — движки конвертации (включая плагинные)
- `providers/` — провайдеры данных и абстракции
- `persistence/` — ключи и границы сохранения
- `desktop/` — desktop bindings
- `hooks/` — системное поведение приложения
- `i18n/` — языки и локализация

### 🎨 UX / WOW-детали
- Премиальный layered/glass стиль
- Плавные переходы между режимами
- Ненавязчивые microinteractions
- Анимированный график в реальном времени
- Возможность свернуть расширенные модули для фокуса

### 🔮 Планы
1. Режим решения текстовых задач (LM Studio / локальная LLM)
2. Пошаговые AI-объяснения для символьных решений
3. Экспорт/импорт профиля с шифрованием
4. Режим повышенной точности (arbitrary precision)
5. Оптимизация бандла и code splitting

### 📄 Лицензия
MIT. См. [LICENSE](./LICENSE).
