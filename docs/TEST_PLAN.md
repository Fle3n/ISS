# Test Plan / План Проверки

## Target Environment

- Python: 3.11 or newer.
- Browser: latest stable Chrome, Firefox and Safari.
- Hardware target: mid-range laptop, 8 GB RAM, integrated or entry-level
  discrete GPU, WebGL enabled.
- Performance target: 30+ FPS in the simulator FPS counter during normal use.

## Automated Checks

Run from the repository root:

```bash
python3 -m py_compile app.py scripts/validate_project.py
python3 scripts/validate_project.py
```

If Node.js is available:

```bash
node --check static/js/digital_twin.js
node --check static/js/ui_animations.js
```

## Manual Browser Checklist

- Open `/`, `/simulator`, `/metrics`, `/architecture` and `/healthz`.
- Switch RU / EN and confirm navigation plus simulator labels update.
- In `/simulator`, run each scenario:
  engineering analysis, educational docking and presentation expansion.
- Confirm the planet/orbit controls keep the station outside the planet mesh.
- Confirm normal scene interaction stays visually smooth and reports 30+ FPS
  after the first loading burst.
- Test latest Chrome, Firefox and Safari before submission.

## WCAG 2.1 Level A Baseline

- All interactive controls are reachable with keyboard focus.
- Buttons have visible text or accessible labels.
- The global navigation exposes `aria-current` on the active page.
- Motion-sensitive animations respect `prefers-reduced-motion` where practical.
- Text contrast and input focus states must be checked manually in the target
  browsers before submission.

## Русский

Целевой минимум: последние версии Chrome, Firefox, Safari; ноутбук среднего
класса с 8 ГБ RAM; стабильные 30+ FPS по счётчику симулятора. Перед защитой
нужно вручную пройти страницы, три сценария, переключение языка, клавиатурную
доступность и базовый контраст.
