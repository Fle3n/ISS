import os

from flask import Flask, jsonify, render_template


app = Flask(__name__)
DEFAULT_PORT = int(os.environ.get("PORT", "7001"))

SITE_NAV = [
    {"endpoint": "index", "key": "home", "label": "Главная", "eyebrow": "Обзор"},
    {
        "endpoint": "simulator",
        "key": "simulator",
        "label": "3D симулятор",
        "eyebrow": "Digital Twin",
    },
    {
        "endpoint": "metrics",
        "key": "metrics",
        "label": "Метрики",
        "eyebrow": "Value",
    },
    {
        "endpoint": "architecture",
        "key": "architecture",
        "label": "Архитектура",
        "eyebrow": "Data & Stack",
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
            "url": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/",
        },
        {
            "name": "CelesTrak",
            "usage": "TLE terminology and orbital reference conventions.",
            "url": "https://celestrak.org/",
        },
        {
            "name": "NASA 3D Resources",
            "usage": "Reference for station module proportions and public 3D asset taxonomy.",
            "url": "https://nasa3d.arc.nasa.gov/models",
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
            "visualization."
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
        "description": (
            "Изменение высоты орбиты, наклонения, ориентации и структуры "
            "станции для быстрого сравнения конфигураций."
        ),
    },
    {
        "name": "Образовательный сценарий",
        "description": (
            "Пошаговая демонстрация сближения, мягкого захвата и фиксации "
            "нового модуля к выбранному узлу."
        ),
    },
    {
        "name": "Презентационный сценарий",
        "description": (
            "Наглядное расширение станции, включение ретрансляторов и "
            "демонстрация изменения телеметрии в реальном времени."
        ),
    },
]

VALUE_METRICS = [
    {
        "metric": "Время до первого понимания структуры",
        "target": "5-7 минут",
        "baseline": "15-20 минут",
        "impact": "Новый пользователь быстрее понимает состав и логику модулей.",
    },
    {
        "metric": "Время подготовки демонстрации",
        "target": "15-20 минут",
        "baseline": "60-90 минут",
        "impact": "Снижается ручная сборка материалов из разрозненных источников.",
    },
    {
        "metric": "Время объяснения стыковки",
        "target": "3-5 минут",
        "baseline": "Без интерактивного сценария дольше и менее наглядно",
        "impact": "Процесс объясняется через действие, а не статичную схему.",
    },
    {
        "metric": "Успешное прохождение ключевого сценария",
        "target": "≥ 70%",
        "baseline": "Целевой UX-порог",
        "impact": "Пользователь может самостоятельно запустить стыковку/расширение.",
    },
    {
        "metric": "Правильное объяснение устройства станции",
        "target": "≥ 80%",
        "baseline": "После интерактивной сессии",
        "impact": "Подтверждает образовательную и презентационную ценность.",
    },
    {
        "metric": "Возврат инженеров в течение недели",
        "target": "≥ 60%",
        "baseline": "Показатель рабочей применимости",
        "impact": "Если прототип полезен, к нему возвращаются для анализа вариантов.",
    },
]

ARCHITECTURE_LAYERS = [
    {
        "layer": "Flask backend",
        "details": (
            "Отдаёт HTML-страницы, JSON-профиль миссии, справочные параметры "
            "планет, пресеты сценариев и healthcheck."
        ),
        "stack": "Python / Flask / Jinja2",
    },
    {
        "layer": "3D simulation core",
        "details": (
            "Строит процедурные модели планет, станции и ретрансляторов, "
            "рассчитывает круговую орбиту, стыковку и радиовидимость."
        ),
        "stack": "Three.js / WebGL / OrbitControls",
    },
    {
        "layer": "Mission UI + telemetry",
        "details": (
            "Панели параметров, билингвальный интерфейс, журнал событий, "
            "реактивное обновление телеметрии и сценарные пресеты."
        ),
        "stack": "HTML5 / CSS3 / ES Modules",
    },
    {
        "layer": "Open data context",
        "details": (
            "В интерфейсе фиксируются источники открытых данных и TLE-"
            "референс, а физические параметры берутся из открытых справочников."
        ),
        "stack": "NASA / CelesTrak / Public orbital references",
    },
]

TECH_MODULES = [
    {
        "name": "Орбитальная модель",
        "summary": (
            "Упрощённая круговая орбита с управляемой высотой и наклонением, "
            "период и скорость считаются по гравитационному параметру μ."
        ),
    },
    {
        "name": "Стыковочная логика",
        "summary": (
            "Новый модуль появляется на подходной траектории, переходит в "
            "режим захвата и после фиксации увеличивает длину выбранного порта."
        ),
    },
    {
        "name": "Коммуникационная модель",
        "summary": (
            "Для каждого ретранслятора проверяется дальность, геометрическое "
            "перекрытие планетой и влияние мощности/помех на throughput."
        ),
    },
]


@app.context_processor
def inject_layout_state():
    return {
        "site_nav": SITE_NAV,
        "mission_title": "Цифровой двойник модульной орбитальной станции",
    }


@app.route("/")
def index():
    return render_template(
        "index.html",
        active_page="home",
        highlights=LANDING_HIGHLIGHTS,
        user_stories=LANDING_STORIES,
    )


@app.route("/simulator")
def simulator():
    return render_template("simulator.html", active_page="simulator")


@app.route("/metrics")
def metrics():
    return render_template(
        "metrics.html",
        active_page="metrics",
        metrics=VALUE_METRICS,
        scenarios=LANDING_STORIES,
    )


@app.route("/architecture")
def architecture():
    return render_template(
        "architecture.html",
        active_page="architecture",
        layers=ARCHITECTURE_LAYERS,
        tech_modules=TECH_MODULES,
        mission_profile=MISSION_PROFILE,
    )


@app.route("/api/mission-profile")
def mission_profile():
    return jsonify(MISSION_PROFILE)


@app.route("/healthz")
def healthcheck():
    return jsonify(
        {"status": "ok", "service": "digital-twin", "port": DEFAULT_PORT}
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=DEFAULT_PORT, debug=False)
