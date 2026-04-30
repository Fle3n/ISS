import json
import os
import ssl
import urllib.error
import urllib.request

import certifi
from flask import Flask, jsonify, redirect, render_template, request, url_for


app = Flask(__name__)
DEFAULT_PORT = int(os.environ.get("PORT", "7001"))
ISS_NOW_URL = "https://api.wheretheiss.at/v1/satellites/25544"
ISS_SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())

SITE_NAV = [
    {
        "endpoint": "index",
        "key": "home",
        "label": "Главная",
        "i18n": "navHome",
        "icon": "home",
    },
    {
        "endpoint": "simulator",
        "key": "simulator",
        "label": "Симулятор",
        "i18n": "navSimulator",
        "icon": "satellite",
    },
    {
        "endpoint": "constructor",
        "key": "constructor",
        "label": "Конструктор",
        "i18n": "navConstructor",
        "icon": "box",
    },
    {
        "endpoint": "settings",
        "key": "settings",
        "label": "Настройки",
        "i18n": "navSettings",
        "icon": "settings",
    },
]


SITE_NAV = [
    {
        "endpoint": "index",
        "key": "home",
        "label": "Главная",
        "i18n": "navHome",
        "icon": "home",
    },
    {
        "endpoint": "simulator",
        "key": "simulator",
        "label": "Симулятор",
        "i18n": "navSimulator",
        "icon": "satellite",
    },
    {
        "endpoint": "orbit",
        "key": "orbit",
        "label": "Орбита",
        "i18n": "navOrbit",
        "icon": "orbit",
    },
    {
        "endpoint": "system",
        "key": "system",
        "label": "Система МКС",
        "i18n": "navSystem",
        "icon": "box",
    },
    {
        "endpoint": "data",
        "key": "data",
        "label": "Данные",
        "i18n": "navData",
        "icon": "bar-chart-3",
    },
    {
        "endpoint": "scenarios",
        "key": "scenarios",
        "label": "Сценарии",
        "i18n": "navScenarios",
        "icon": "play",
    },
    {
        "endpoint": "settings",
        "key": "settings",
        "label": "Настройки",
        "i18n": "navSettings",
        "icon": "settings",
    },
]


SITE_NAV = [
    {
        "endpoint": "index",
        "key": "home",
        "label": "\u0413\u043b\u0430\u0432\u043d\u0430\u044f",
        "i18n": "navHome",
        "icon": "home",
    },
    {
        "endpoint": "simulator",
        "key": "simulator",
        "label": "\u0421\u0438\u043c\u0443\u043b\u044f\u0442\u043e\u0440",
        "i18n": "navSimulator",
        "icon": "satellite",
    },
    {
        "endpoint": "constructor",
        "key": "constructor",
        "label": "\u041a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0442\u043e\u0440",
        "i18n": "navConstructor",
        "icon": "component",
    },
    {
        "endpoint": "system",
        "key": "system",
        "label": "\u0421\u0438\u0441\u0442\u0435\u043c\u0430 \u041c\u041a\u0421",
        "i18n": "navSystem",
        "icon": "box",
    },
    {
        "endpoint": "data",
        "key": "data",
        "label": "\u0414\u0430\u043d\u043d\u044b\u0435",
        "i18n": "navData",
        "icon": "bar-chart-3",
    },
    {
        "endpoint": "scenarios",
        "key": "scenarios",
        "label": "\u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0438",
        "i18n": "navScenarios",
        "icon": "play",
    },
    {
        "endpoint": "settings",
        "key": "settings",
        "label": "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438",
        "i18n": "navSettings",
        "icon": "settings",
    },
]


MISSION_PROFILE = {
    "projectTitle": "Digital Twin of a Modular Orbital Station",
    "stage": "Stage 4 Prototype",
    "defaultHost": "earth",
    "openDataSources": [
        {
            "name": "NASA Planetary Fact Sheets",
            "usage": "Planetary radii and gravitational parameters for orbit presets.",
            "usageRu": "Радиусы планет и гравитационные параметры для орбитальных пресетов.",
            "url": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/",
        },
        {
            "name": "ESA Earth Observation / Open Access",
            "usage": "International open-data reference for Earth observation and open science context.",
            "usageRu": "Международный open-data ориентир для наблюдения Земли и open science контекста.",
            "url": "https://www.esa.int/Applications/Observing_the_Earth/How_to_access_data",
        },
        {
            "name": "ROSCOSMOS open public materials",
            "usage": "Public Russian space-sector reference context for educational comparison.",
            "usageRu": "Публичный российский справочный контекст для образовательного сравнения.",
            "url": "https://www.roscosmos.ru/",
        },
        {
            "name": "CelesTrak",
            "usage": "TLE terminology and orbital reference conventions.",
            "usageRu": "Терминология TLE и справочные орбитальные соглашения.",
            "url": "https://celestrak.org/",
        },
        {
            "name": "Where the ISS at?",
            "usage": "Realtime ISS latitude, longitude, altitude, and velocity for NORAD 25544.",
            "usageRu": "Текущие широта, долгота, высота и скорость МКС для NORAD 25544.",
            "url": "https://wheretheiss.at/w/developer",
        },
        {
            "name": "Space-Track",
            "usage": "International orbital-catalog reference source; no restricted data is bundled.",
            "usageRu": "Международный справочник орбитального каталога; закрытые данные не поставляются.",
            "url": "https://www.space-track.org/",
        },
        {
            "name": "NASA 3D Resources",
            "usage": "Reference for station module proportions and public 3D asset taxonomy.",
            "usageRu": "Референс пропорций модулей станции и публичной таксономии 3D-ресурсов.",
            "url": "https://nasa3d.arc.nasa.gov/models",
        },
    ],
    "dataStandards": [
        {
            "format": "JSON",
            "usage": "Mission profile, planet constants, presets, telemetry labels, and public API payloads.",
            "usageRu": "Профиль миссии, константы планет, пресеты, подписи телеметрии и публичные API-данные.",
        },
        {
            "format": "TLE",
            "usage": "Orbital reference notation for ISS-like educational context.",
            "usageRu": "Орбитальная запись для учебного ISS-like контекста.",
        },
        {
            "format": "glTF / OBJ",
            "usage": "Recommended interchange formats for future external 3D station assets.",
            "usageRu": "Рекомендуемые форматы обмена для будущих внешних 3D-ресурсов станции.",
        },
        {
            "format": "WebGL / ES Modules",
            "usage": "Browser-native runtime format for the current interactive simulator.",
            "usageRu": "Браузерный runtime-формат текущего интерактивного симулятора.",
        },
    ],
    "orbitReference": {
        "label": "ISS-like circular educational orbit",
        "tleSample": [
            "1 25544U 98067A   24076.51835648  .00014389  00000+0  26592-3 0  9994",
            "2 25544  51.6416  22.9383 0004138  42.6653  73.9565 15.49515331445244",
        ],
        "notes": (
            "The frontend uses a circularized orbit model with real gravitational "
            "constants and altitude/inclination controls for realtime educational "
            "visualization. The sample TLE is included only as an open reference "
            "format example, not as operational tracking data."
        ),
        "notesRu": (
            "Фронтенд использует круговую орбитальную модель с реальными "
            "гравитационными константами и управлением высотой/наклонением для "
            "учебной realtime-визуализации. Пример TLE добавлен только как "
            "открытый пример формата, а не как оперативные данные слежения."
        ),
    },
    "planets": {
        "earth": {
            "nameRu": "Земля",
            "nameEn": "Earth",
            "radiusKm": 6371.0,
            "muKm3s2": 398600.4418,
            "rotationHours": 23.934,
            "colorA": "#2563eb",
            "colorB": "#1f8a70",
            "orbitScale": 1.0,
        },
        "moon": {
            "nameRu": "Луна",
            "nameEn": "Moon",
            "radiusKm": 1737.4,
            "muKm3s2": 4902.8001,
            "rotationHours": 655.728,
            "colorA": "#d8d8d8",
            "colorB": "#9f9f9f",
            "orbitScale": 0.55,
        },
        "mars": {
            "nameRu": "Марс",
            "nameEn": "Mars",
            "radiusKm": 3389.5,
            "muKm3s2": 42828.3752,
            "rotationHours": 24.623,
            "colorA": "#c2410c",
            "colorB": "#7c2d12",
            "orbitScale": 0.75,
        },
        "venus": {
            "nameRu": "Венера",
            "nameEn": "Venus",
            "radiusKm": 6051.8,
            "muKm3s2": 324858.592,
            "rotationHours": -5832.5,
            "colorA": "#f6d365",
            "colorB": "#d97706",
            "orbitScale": 0.96,
        },
        "jupiter": {
            "nameRu": "Юпитер",
            "nameEn": "Jupiter",
            "radiusKm": 69911.0,
            "muKm3s2": 126686534.0,
            "rotationHours": 9.925,
            "colorA": "#d6a56d",
            "colorB": "#8d5a3b",
            "orbitScale": 2.2,
        },
        "saturn": {
            "nameRu": "Сатурн",
            "nameEn": "Saturn",
            "radiusKm": 58232.0,
            "muKm3s2": 37931207.8,
            "rotationHours": 10.656,
            "colorA": "#e7d8a5",
            "colorB": "#b08968",
            "orbitScale": 2.0,
        },
    },
    "stationPresets": {
        "engineering": {
            "altitudeKm": 420,
            "inclinationDeg": 51.6,
            "timeScale": 1.8,
            "relayCount": 8,
            "packetRateMbps": 420,
            "linkRangeKm": 14000,
        },
        "education": {
            "altitudeKm": 540,
            "inclinationDeg": 35,
            "timeScale": 1.15,
            "relayCount": 6,
            "packetRateMbps": 260,
            "linkRangeKm": 11000,
        },
        "presentation": {
            "altitudeKm": 900,
            "inclinationDeg": 72,
            "timeScale": 2.4,
            "relayCount": 12,
            "packetRateMbps": 650,
            "linkRangeKm": 17000,
        },
    },
}

LANDING_HIGHLIGHTS = [
    {
        "value": "6+",
        "title": "Типов модулей",
        "text": (
            "Базовый, лабораторный, жилой, энергетический, узловой и "
            "коммуникационный сегменты станции."
        ),
    },
    {
        "value": "3",
        "title": "Ключевых процесса",
        "text": (
            "Орбитальное движение, стыковка и межспутниковая связь "
            "объединены в одном realtime-прототипе."
        ),
    },
    {
        "value": "50x",
        "title": "Ускорение времени",
        "text": "Пользователь может мгновенно ускорять сценарии и видеть эффект.",
    },
]

LANDING_STORIES = [
    {
        "name": "Инженерный анализ",
        "nameEn": "Engineering analysis",
        "description": (
            "Изменение высоты орбиты, наклонения, ориентации и структуры "
            "станции для быстрого сравнения конфигураций."
        ),
        "descriptionEn": (
            "Change orbital altitude, inclination, attitude and station "
            "structure to compare configurations quickly."
        ),
    },
    {
        "name": "Образовательный сценарий",
        "nameEn": "Educational docking",
        "description": (
            "Пошаговая демонстрация сближения, мягкого захвата и фиксации "
            "нового модуля к выбранному узлу."
        ),
        "descriptionEn": (
            "Demonstrate approach, soft capture and final locking of a new "
            "module to the selected docking port."
        ),
    },
    {
        "name": "Презентационный сценарий",
        "nameEn": "Presentation expansion",
        "description": (
            "Наглядное расширение станции, включение ретрансляторов и "
            "демонстрация изменения телеметрии в реальном времени."
        ),
        "descriptionEn": (
            "Show station growth, relay activation and realtime telemetry "
            "changes for a presentation."
        ),
    },
]

VALUE_METRICS = [
    {
        "metric": "Время до первого понимания структуры",
        "metricEn": "Time to first structural understanding",
        "target": "5-7 минут",
        "targetEn": "5-7 minutes",
        "baseline": "15-20 минут",
        "baselineEn": "15-20 minutes",
        "impact": "Новый пользователь быстрее понимает состав и логику модулей.",
        "impactEn": "A new user understands the module composition and logic faster.",
    },
    {
        "metric": "Время подготовки демонстрации",
        "metricEn": "Demo preparation time",
        "target": "15-20 минут",
        "targetEn": "15-20 minutes",
        "baseline": "60-90 минут",
        "baselineEn": "60-90 minutes",
        "impact": "Снижается ручная сборка материалов из разрозненных источников.",
        "impactEn": "Manual assembly of materials from scattered sources is reduced.",
    },
    {
        "metric": "Время объяснения стыковки",
        "metricEn": "Docking explanation time",
        "target": "3-5 минут",
        "targetEn": "3-5 minutes",
        "baseline": "Без интерактивного сценария дольше и менее наглядно",
        "baselineEn": "Longer and less clear without an interactive scenario",
        "impact": "Процесс объясняется через действие, а не статичную схему.",
        "impactEn": "The process is explained through action instead of a static diagram.",
    },
    {
        "metric": "Успешное прохождение ключевого сценария",
        "metricEn": "Successful completion of the key scenario",
        "target": "≥ 70%",
        "targetEn": "≥ 70%",
        "baseline": "Целевой UX-порог",
        "baselineEn": "Target UX threshold",
        "impact": "Пользователь может самостоятельно запустить стыковку/расширение.",
        "impactEn": "The user can launch docking or expansion independently.",
    },
    {
        "metric": "Правильное объяснение устройства станции",
        "metricEn": "Correct explanation of station structure",
        "target": "≥ 80%",
        "targetEn": "≥ 80%",
        "baseline": "После интерактивной сессии",
        "baselineEn": "After an interactive session",
        "impact": "Подтверждает образовательную и презентационную ценность.",
        "impactEn": "Confirms the educational and presentation value.",
    },
    {
        "metric": "Возврат инженеров в течение недели",
        "metricEn": "Engineer return within one week",
        "target": "≥ 60%",
        "targetEn": "≥ 60%",
        "baseline": "Показатель рабочей применимости",
        "baselineEn": "Work applicability indicator",
        "impact": "Если прототип полезен, к нему возвращаются для анализа вариантов.",
        "impactEn": "If the prototype is useful, users return to compare variants.",
    },
]

ARCHITECTURE_LAYERS = [
    {
        "layer": "Flask backend",
        "details": (
            "Отдаёт HTML-страницы, JSON-профиль миссии, справочные параметры "
            "планет, пресеты сценариев и healthcheck."
        ),
        "detailsEn": (
            "Serves HTML pages, the JSON mission profile, planet reference "
            "parameters, scenario presets and the healthcheck."
        ),
        "stack": "Python / Flask / Jinja2",
    },
    {
        "layer": "3D simulation core",
        "details": (
            "Строит процедурные модели планет, станции и ретрансляторов, "
            "рассчитывает круговую орбиту, стыковку и радиовидимость."
        ),
        "detailsEn": (
            "Builds procedural planet, station and relay models, then "
            "calculates the circular orbit, docking and radio visibility."
        ),
        "stack": "Three.js / WebGL / OrbitControls",
    },
    {
        "layer": "Mission UI + telemetry",
        "details": (
            "Панели параметров, билингвальный интерфейс, журнал событий, "
            "реактивное обновление телеметрии и сценарные пресеты."
        ),
        "detailsEn": (
            "Parameter panels, bilingual interface, event log, reactive "
            "telemetry updates and scenario presets."
        ),
        "stack": "HTML5 / CSS3 / ES Modules",
    },
    {
        "layer": "Open data context",
        "details": (
            "В интерфейсе фиксируются источники открытых данных и TLE-"
            "референс, а физические параметры берутся из открытых справочников."
        ),
        "detailsEn": (
            "The interface records open-data sources and the TLE reference, "
            "while physical parameters come from public references."
        ),
        "stack": "NASA / CelesTrak / Public orbital references",
    },
]

TECH_MODULES = [
    {
        "name": "Орбитальная модель",
        "nameEn": "Orbital model",
        "summary": (
            "Упрощённая круговая орбита с управляемой высотой и наклонением, "
            "период и скорость считаются по гравитационному параметру μ."
        ),
        "summaryEn": (
            "Simplified circular orbit with controllable altitude and "
            "inclination; period and velocity are derived from the "
            "gravitational parameter μ."
        ),
    },
    {
        "name": "Стыковочная логика",
        "nameEn": "Docking logic",
        "summary": (
            "Новый модуль появляется на подходной траектории, переходит в "
            "режим захвата и после фиксации увеличивает длину выбранного порта."
        ),
        "summaryEn": (
            "A new module appears on an approach trajectory, enters capture "
            "mode and extends the selected port after locking."
        ),
    },
    {
        "name": "Коммуникационная модель",
        "nameEn": "Communications model",
        "summary": (
            "Для каждого ретранслятора проверяется дальность, геометрическое "
            "перекрытие планетой и влияние мощности/помех на throughput."
        ),
        "summaryEn": (
            "Each relay is checked for range, planet occlusion and the impact "
            "of antenna power and interference on throughput."
        ),
    },
]

COMPLIANCE_ITEMS = [
    {
        "criterion": "Open international data",
        "criterionRu": "Открытые международные данные",
        "status": "Documented",
        "statusRu": "Зафиксировано",
        "evidence": "NASA, ESA, ROSCOSMOS, CelesTrak, Space-Track and NASA 3D Resources are listed as the allowed source set.",
        "evidenceRu": "NASA, ESA, ROSCOSMOS, CelesTrak, Space-Track и NASA 3D Resources указаны как разрешённый набор источников.",
    },
    {
        "criterion": "Common data formats",
        "criterionRu": "Общепринятые форматы данных",
        "status": "Documented",
        "statusRu": "Зафиксировано",
        "evidence": "JSON and TLE are used now; glTF and OBJ are recorded as the interchange formats for future external 3D assets.",
        "evidenceRu": "JSON и TLE используются сейчас; glTF и OBJ зафиксированы как форматы обмена для будущих внешних 3D-ресурсов.",
    },
    {
        "criterion": "Bilingual interface",
        "criterionRu": "Билингвальный интерфейс",
        "status": "Implemented",
        "statusRu": "Реализовано",
        "evidence": "The global RU / EN switch covers the site navigation and simulator controls.",
        "evidenceRu": "Глобальный переключатель RU / EN покрывает навигацию сайта и элементы управления симулятора.",
    },
    {
        "criterion": "Reproducible web build",
        "criterionRu": "Воспроизводимый веб-запуск",
        "status": "Implemented",
        "statusRu": "Реализовано",
        "evidence": "Flask routes, healthcheck and setup commands are documented in README.md.",
        "evidenceRu": "Маршруты Flask, healthcheck и команды запуска описаны в README.md.",
    },
    {
        "criterion": "User stories",
        "criterionRu": "Сценарии использования",
        "status": "Implemented",
        "statusRu": "Реализовано",
        "evidence": "Engineering analysis, educational docking and presentation expansion are visible in the interface.",
        "evidenceRu": "Инженерный анализ, учебная стыковка и презентационное расширение представлены в интерфейсе.",
    },
    {
        "criterion": "Safety and ethics",
        "criterionRu": "Безопасность и этика",
        "status": "Documented",
        "statusRu": "Зафиксировано",
        "evidence": "The project states that no restricted tracking data or copyrighted station model is bundled.",
        "evidenceRu": "Проект указывает, что закрытые трекинговые данные и copyrighted-модель станции не поставляются.",
    },
]


@app.context_processor
def inject_layout_state():
    return {
        "site_nav": SITE_NAV,
        "mission_title": "Цифровой двойник МКС",
        "mission_title": "Цифровой двойник модульной орбитальной станции",
    }


@app.context_processor
def inject_clean_layout_title():
    return {"mission_title": "Цифровой двойник МКС"}


@app.context_processor
def inject_dashboard_layout_state():
    return {
        "site_nav": SITE_NAV,
        "mission_title": "\u0426\u0438\u0444\u0440\u043e\u0432\u043e\u0439 \u0434\u0432\u043e\u0439\u043d\u0438\u043a \u041c\u041a\u0421",
    }


@app.route("/")
def index():
    return render_template(
        "index.html",
        active_page="home",
        highlights=LANDING_HIGHLIGHTS,
        user_stories=LANDING_STORIES,
        metrics=VALUE_METRICS,
        layers=ARCHITECTURE_LAYERS,
        compliance_items=COMPLIANCE_ITEMS,
        mission_profile=MISSION_PROFILE,
    )


@app.route("/simulator")
def simulator():
    return render_template("simulator.html", active_page="simulator")


@app.route("/constructor")
def constructor():
    return render_template("constructor.html", active_page="constructor")


@app.route("/orbit")
def orbit():
    return redirect(url_for("simulator"))


@app.route("/system")
def system():
    return render_template("system.html", active_page="system")


@app.route("/data")
def data():
    return render_template("data.html", active_page="data")


@app.route("/scenarios")
def scenarios():
    return render_template("scenarios.html", active_page="scenarios")


@app.route("/settings")
def settings():
    return render_template("settings.html", active_page="settings")


@app.route("/metrics")
def metrics():
    return redirect(url_for("data"))


@app.route("/architecture")
def architecture():
    return redirect(url_for("simulator"))


@app.route("/api/mission-profile")
def mission_profile():
    return jsonify(MISSION_PROFILE)


@app.route("/api/iss-now")
def iss_now():
    request_headers = {"User-Agent": "iss-digital-twin/1.0"}
    request_obj = urllib.request.Request(ISS_NOW_URL, headers=request_headers)
    try:
        with urllib.request.urlopen(request_obj, timeout=10, context=ISS_SSL_CONTEXT) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (
        urllib.error.URLError,
        TimeoutError,
        json.JSONDecodeError,
        KeyError,
        TypeError,
        ValueError,
        OSError,
    ) as error:
        return jsonify(
            {
                "status": "unavailable",
                "source": "Where the ISS at?",
                "source_url": "https://wheretheiss.at/w/developer",
                "error": str(error),
            }
        ), 502

    velocity_kmh = float(payload.get("velocity", 0.0))
    return jsonify(
        {
            "status": "ok",
            "source": "Where the ISS at?",
            "source_url": "https://wheretheiss.at/w/developer",
            "id": payload.get("id"),
            "name": payload.get("name"),
            "latitude": float(payload["latitude"]),
            "longitude": float(payload["longitude"]),
            "altitude_km": float(payload["altitude"]),
            "velocity_kmh": velocity_kmh,
            "velocity_kms": velocity_kmh / 3600,
            "timestamp": payload.get("timestamp"),
            "visibility": payload.get("visibility"),
        }
    )


@app.route("/healthz")
def healthcheck():
    return jsonify(
        {"status": "ok", "service": "digital-twin", "host": request.host}
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=DEFAULT_PORT, debug=False)
