# Digital Twin Of A Modular Orbital Station

Interactive Flask + Three.js prototype for a modular orbital station digital
twin. The simulator demonstrates orbital parameters, station attitude, docking,
station expansion, relay communications and bilingual RU / EN operation.

## Requirements

- Python 3.11 or newer.
- Flask 3.x, installed from `requirements.txt`.
- Latest stable Chrome, Firefox or Safari with WebGL enabled.
- Internet access for CDN-loaded Three.js and web fonts, unless these assets
  are vendored before an offline submission.

## Setup And Run

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python app.py
```

Open `http://127.0.0.1:7004`.

Use a custom port without changing code:

```bash
PORT=7010 .venv/bin/python app.py
```

Healthcheck:

```bash
curl http://127.0.0.1:7004/healthz
```

## Project Routes

- `/` - landing page with project value, user stories, metrics, architecture,
  open-data sources and criteria evidence.
- `/simulator` - interactive 3D simulator.
- `/metrics` - value metrics and scenario validation logic.
- `/architecture` - architecture, source data and criteria summary.
- `/api/mission-profile` - JSON mission profile for the simulator.
- `/healthz` - service status.

## Architecture

Flask renders the pages and exposes the mission profile as JSON. Three.js runs
the realtime 3D scene in the browser: planet mesh, modular station, docking
sequence, relay network, telemetry and scenario presets.

More detail:

- `docs/ARCHITECTURE.md` - block diagram and architecture decisions.
- `docs/OPEN_DATA_AND_ETHICS.md` - allowed data sources, formats and asset
  policy.
- `docs/TEST_PLAN.md` - browser, WCAG and FPS test plan.
- `docs/CRITERIA_COMPLIANCE.md` - mapping from the task criteria to evidence.

## Open Data And Formats

The project records the allowed source set required by the criteria: NASA
Planetary Fact Sheets, NASA 3D Resources, ESA Earth Observation / Open Access,
ROSCOSMOS public materials, CelesTrak and Space-Track. The current simulator
uses JSON mission data and an educational TLE format example; glTF and OBJ are
documented as the required interchange formats for future external 3D assets.

No restricted orbital catalog data is bundled. The station and relay geometry
are procedural. New textures, models or datasets must be open licensed or
self-created and documented in `docs/OPEN_DATA_AND_ETHICS.md`.

## User Stories

- Engineering analysis: compare orbit altitude, inclination, attitude, relay
  range and station configuration.
- Educational docking: show approach, capture and final docking of a selected
  module.
- Presentation expansion: demonstrate station growth, relay activation and
  realtime telemetry changes.

## Validation

```bash
python3 -m py_compile app.py scripts/validate_project.py
python3 scripts/validate_project.py
```

If Node.js is available:

```bash
node --check static/js/digital_twin.js
node --check static/js/ui_animations.js
```

Manual submission checks are listed in `docs/TEST_PLAN.md`. Record Chrome,
Firefox and Safari results before final delivery.

## License And Publication

The repository includes an Apache-2.0 license in `LICENSE`. Before final
submission, publish the project in a public GitHub or GitLab repository with
this license file and the documentation above.

---

# Цифровой Двойник Модульной Орбитальной Станции

Веб-прототип на Flask + Three.js: интерактивная 3D-визуализация модульной
орбитальной станции со стыковкой, орбитальным движением, межспутниковой связью
и настройкой параметров в реальном времени.

## Быстрый Запуск

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python app.py
```

Открыть в браузере: `http://127.0.0.1:7004`.

Другой порт:

```bash
PORT=7010 .venv/bin/python app.py
```

## Что Реализовано

- Многостраничный Flask-сайт с навигацией и переключением RU / EN.
- Главная страница объединяет сценарии, метрики, архитектуру, открытые данные
  и соответствие критериям.
- 3D-сцена с планетой, орбитой, станцией, ретрансляторами и телеметрией.
- Сценарии инженерного анализа, образовательной стыковки и презентационного
  расширения станции.
- Описание открытых источников данных, форматов JSON/TLE/glTF/OBJ,
  архитектурная схема, тест-план и матрица соответствия критериям.

Перед защитой нужно опубликовать репозиторий публично и вручную зафиксировать
результаты проверки браузеров, доступности и 30+ FPS.
