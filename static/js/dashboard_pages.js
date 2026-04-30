const stateApi = window.issDashboardState;

const READY_SCENARIOS = [
  {
    id: "education",
    preset: "education",
    titleRu: "Сближение с грузовым кораблем",
    titleEn: "Cargo rendezvous",
    descriptionRu: "Сценарий подхода, захвата и мягкой стыковки транспортного корабля с МКС.",
    descriptionEn: "Approach, capture and soft-docking training for a cargo vehicle.",
    difficultyRu: "Средний",
    difficultyEn: "Medium",
    durationMinutes: 90,
    timeScale: 5,
    altitudeKm: 420,
    inclinationDeg: 51.6,
    externalFactorsRu: "Маневры и динамический отклик станции",
    externalFactorsEn: "Maneuvers and dynamic station response",
    summaryRu: "Фокус на стыковочном окне, устойчивости ориентации и временном профиле операции.",
    summaryEn: "Focus on docking windows, attitude stability and the operation timeline.",
    thermalBias: 0.7,
    powerBiasKw: 1.8,
    linkBias: 18,
  },
  {
    id: "engineering",
    preset: "engineering",
    titleRu: "Инженерный анализ орбиты",
    titleEn: "Orbital engineering analysis",
    descriptionRu: "Проверка высоты, наклонения и энергетического баланса при штатной конфигурации станции.",
    descriptionEn: "Validate altitude, inclination and energy balance under nominal configuration.",
    difficultyRu: "Легкий",
    difficultyEn: "Easy",
    durationMinutes: 45,
    timeScale: 1.8,
    altitudeKm: 417,
    inclinationDeg: 51.64,
    externalFactorsRu: "Стабильная орбита и стандартная нагрузка",
    externalFactorsEn: "Stable orbit and standard load",
    summaryRu: "Подходит для быстрой оценки текущей орбитальной геометрии и полезной нагрузки связи.",
    summaryEn: "Best for fast checks of orbital geometry and communications load.",
    thermalBias: -0.2,
    powerBiasKw: 0.3,
    linkBias: 8,
  },
  {
    id: "presentation",
    preset: "presentation",
    titleRu: "Презентационное расширение станции",
    titleEn: "Presentation expansion",
    descriptionRu: "Наглядный режим с увеличенным числом ретрансляторов и акцентом на визуальную телеметрию.",
    descriptionEn: "A showcase mode with more relays and a stronger visual telemetry profile.",
    difficultyRu: "Средний",
    difficultyEn: "Medium",
    durationMinutes: 60,
    timeScale: 2.4,
    altitudeKm: 900,
    inclinationDeg: 72,
    externalFactorsRu: "Повышенная нагрузка связи и расширенный радиоконтур",
    externalFactorsEn: "Higher comms load and expanded relay shell",
    summaryRu: "Лучший режим для демонстрации масштабирования станции и контрастной динамики каналов связи.",
    summaryEn: "Best mode for showing station growth and contrast-rich link dynamics.",
    thermalBias: 1.2,
    powerBiasKw: 3.4,
    linkBias: 42,
  },
];

const SYSTEM_MODULES = [
  {
    key: "zarya",
    nameRu: "Заря",
    nameEn: "Zarya",
    roleRu: "Функционально-грузовой блок",
    roleEn: "Functional cargo block",
    massKg: 19300,
    lengthM: 12.6,
    diameterM: 4.1,
    volumeM3: 71,
    crew: 0,
    stateRu: "Нормальное",
    stateEn: "Nominal",
  },
  {
    key: "zvezda",
    nameRu: "Звезда",
    nameEn: "Zvezda",
    roleRu: "Служебный модуль",
    roleEn: "Service module",
    massKg: 19000,
    lengthM: 13.1,
    diameterM: 4.1,
    volumeM3: 90,
    crew: 3,
    stateRu: "Нормальное",
    stateEn: "Nominal",
  },
  {
    key: "poisk",
    nameRu: "Поиск",
    nameEn: "Poisk",
    roleRu: "Стыковочный отсек",
    roleEn: "Docking compartment",
    massKg: 3670,
    lengthM: 4.9,
    diameterM: 2.6,
    volumeM3: 14,
    crew: 0,
    stateRu: "Номинальная нагрузка",
    stateEn: "Nominal load",
  },
  {
    key: "rassvet",
    nameRu: "Рассвет",
    nameEn: "Rassvet",
    roleRu: "Многоцелевой лабораторный модуль",
    roleEn: "Research module",
    massKg: 8050,
    lengthM: 6.0,
    diameterM: 2.4,
    volumeM3: 17,
    crew: 0,
    stateRu: "Готов к приему грузов",
    stateEn: "Ready for cargo",
  },
  {
    key: "nauka",
    nameRu: "Наука",
    nameEn: "Nauka",
    roleRu: "Научный модуль",
    roleEn: "Science module",
    massKg: 20100,
    lengthM: 13.0,
    diameterM: 4.1,
    volumeM3: 70,
    crew: 2,
    stateRu: "Активный",
    stateEn: "Active",
  },
];

const PAGE_HELP = {
  home: {
    ru: "Главная страница показывает текущую конфигурацию миссии. Отсюда лучше всего переходить в симулятор для динамики и в конструктор для изменения состава станции.",
    en: "The home page shows the current mission configuration. Use the simulator for dynamics and the builder for changing the station layout.",
  },
  simulator: {
    ru: "В симуляторе работают орбитальные пресеты, управление временем, ориентацией и визуальными слоями. Верхняя правая кнопка сворачивает боковую навигацию, а полноэкранная кнопка разворачивает сцену.",
    en: "The simulator supports orbital presets, time controls, attitude controls and visual layers. The menu button collapses the sidebar and the maximize button expands the scene.",
  },
  constructor: {
    ru: "Конструктор сохраняет конфигурацию станции в общий state. После добавления модулей переходите в Данные или Систему, чтобы увидеть прогноз и обновленные показатели.",
    en: "The builder stores the station layout into shared state. Move to Data or System afterward to see updated forecasts and subsystem indicators.",
  },
  orbit: {
    ru: "Орбита использует тот же state, что и сценарии с симулятором: сброс вернет инженерный профиль, а вкладки переключают представление без потери параметров.",
    en: "Orbit uses the same state as the simulator and scenarios: reset restores the engineering profile and the tabs only change the presentation mode.",
  },
  system: {
    ru: "Система МКС объединяет базовые модули станции и собранную пользователем конфигурацию. Выбор слева меняет карточку модуля и технический статус справа.",
    en: "The ISS System page combines baseline station modules with the user-built configuration. Picking a module updates the technical card and subsystem status.",
  },
  data: {
    ru: "Раздел Данные больше не показывает сырые числа. Прогноз строится по орбите, активному сценарию, составу станции и связи, а график можно переключать по окнам времени.",
    en: "Data no longer shows raw numbers. The forecast is derived from orbit, active scenario, station composition and communications, and the chart can switch time windows.",
  },
  scenarios: {
    ru: "Сценарии управляют активным профилем миссии. Кнопка предпросмотра применяет параметры к общему state, а запуск сразу передает их в симулятор.",
    en: "Scenarios control the active mission profile. Preview applies parameters to shared state and Launch passes them into the simulator immediately.",
  },
  settings: {
    ru: "Настройки сохраняются в общий state и влияют на последующие страницы. Здесь можно вернуть UI к базовой конфигурации без сброса собранной станции.",
    en: "Settings persist in shared state and affect subsequent pages. You can restore the UI defaults here without resetting the built station.",
  },
};

function tr(ru, en) {
  return window.appLanguage?.get?.() === "en" ? en : ru;
}

function formatNumber(value, digits = 1) {
  return Number(value).toFixed(digits);
}

const FORECAST_WINDOWS = {
  "1h": { hours: 1, points: 32, labelRu: "1 час", labelEn: "1 hour" },
  "6h": { hours: 6, points: 42, labelRu: "6 часов", labelEn: "6 hours" },
  "24h": { hours: 24, points: 54, labelRu: "24 часа", labelEn: "24 hours" },
  "7d": { hours: 168, points: 72, labelRu: "7 суток", labelEn: "7 days" },
};

const SIMULATOR_SETTINGS_RANGES = [
  {
    inputId: "settingsPlanetScaleRange",
    outputId: "settingsPlanetScaleOutput",
    key: "planetScale",
    labelRu: "Масштаб планеты",
    labelEn: "Planet scale",
    min: 0.72,
    max: 1.45,
    step: 0.01,
    minLabel: "0.72x",
    maxLabel: "1.45x",
    format: (value) => `${Number(value).toFixed(2)}x`,
  },
  {
    inputId: "settingsAtmosphereGlowRange",
    outputId: "settingsAtmosphereGlowOutput",
    key: "atmosphereGlow",
    labelRu: "Свечение атмосферы",
    labelEn: "Atmosphere glow",
    min: 0,
    max: 1.8,
    step: 0.01,
    minLabel: "0.00",
    maxLabel: "1.80",
    format: (value) => Number(value).toFixed(2),
  },
  {
    inputId: "settingsCloudOpacityRange",
    outputId: "settingsCloudOpacityOutput",
    key: "cloudOpacity",
    labelRu: "Облачный слой",
    labelEn: "Cloud layer",
    min: 0,
    max: 0.85,
    step: 0.01,
    minLabel: "0.00",
    maxLabel: "0.85",
    format: (value) => Number(value).toFixed(2),
  },
  {
    inputId: "settingsSurfaceContrastRange",
    outputId: "settingsSurfaceContrastOutput",
    key: "surfaceContrast",
    labelRu: "Контраст поверхности",
    labelEn: "Surface contrast",
    min: 0.75,
    max: 1.85,
    step: 0.01,
    minLabel: "0.75x",
    maxLabel: "1.85x",
    format: (value) => `${Number(value).toFixed(2)}x`,
  },
  {
    inputId: "settingsNightLightsRange",
    outputId: "settingsNightLightsOutput",
    key: "nightLights",
    labelRu: "Ночные огни",
    labelEn: "Night lights",
    min: 0,
    max: 0.9,
    step: 0.01,
    minLabel: "0.00",
    maxLabel: "0.90",
    format: (value) => Number(value).toFixed(2),
  },
  {
    inputId: "settingsSunAzimuthRange",
    outputId: "settingsSunAzimuthOutput",
    key: "sunAzimuthDeg",
    labelRu: "Азимут Солнца",
    labelEn: "Sun azimuth",
    min: -180,
    max: 180,
    step: 1,
    minLabel: "-180°",
    maxLabel: "180°",
    format: (value) => `${Math.round(Number(value))}°`,
  },
  {
    inputId: "settingsSunElevationRange",
    outputId: "settingsSunElevationOutput",
    key: "sunElevationDeg",
    labelRu: "Высота Солнца",
    labelEn: "Sun elevation",
    min: -10,
    max: 85,
    step: 1,
    minLabel: "-10°",
    maxLabel: "85°",
    format: (value) => `${Math.round(Number(value))}°`,
  },
  {
    inputId: "settingsSpecularBoostRange",
    outputId: "settingsSpecularBoostOutput",
    key: "specularBoost",
    labelRu: "Зеркальный отклик",
    labelEn: "Specular boost",
    min: 0,
    max: 1.4,
    step: 0.01,
    minLabel: "0.00",
    maxLabel: "1.40",
    format: (value) => Number(value).toFixed(2),
  },
  {
    inputId: "settingsStarfieldOpacityRange",
    outputId: "settingsStarfieldOpacityOutput",
    key: "starfieldOpacity",
    labelRu: "Плотность звездного поля",
    labelEn: "Starfield density",
    min: 0.15,
    max: 1.2,
    step: 0.01,
    minLabel: "0.15",
    maxLabel: "1.20",
    format: (value) => Number(value).toFixed(2),
  },
  {
    inputId: "settingsFreeCameraSpeedRange",
    outputId: "settingsFreeCameraSpeedOutput",
    key: "freeCameraSpeed",
    labelRu: "Скорость свободной камеры",
    labelEn: "Free camera speed",
    min: 40,
    max: 260,
    step: 1,
    minLabel: "40",
    maxLabel: "260",
    format: (value) => `${Math.round(Number(value))}`,
  },
];

function renderSimulatorSettingsRange(ui, config) {
  const label = window.appLanguage.get() === "en" ? config.labelEn : config.labelRu;
  const value = ui[config.key];
  return `
    <label class="range-control range-control--compact settings-range">
      <span>${label}</span>
      <strong id="${config.outputId}">${config.format(value)}</strong>
      <input id="${config.inputId}" type="range" min="${config.min}" max="${config.max}" step="${config.step}" value="${value}" />
      <em><span>${config.minLabel}</span><span>${config.maxLabel}</span></em>
    </label>
  `;
}

function getUiSettings(snapshot = getMissionSnapshot()) {
  return {
    theme: "neon-dark",
    units: "metric",
    dataRefresh: "10s",
    density: "comfortable",
    accent: "magenta",
    forecastHorizon: "6h",
    chartSmoothing: true,
    showUncertainty: true,
    reducedMotion: false,
    planetTextures: true,
    orbitRails: true,
    highlightModules: true,
    sidebarCollapsed: false,
    planetScale: 1,
    atmosphereGlow: 0.85,
    cloudOpacity: 0.16,
    surfaceContrast: 1.45,
    nightLights: 0.22,
    sunAzimuthDeg: 38,
    sunElevationDeg: 34,
    specularBoost: 0.62,
    starfieldOpacity: 0.84,
    freeCameraSpeed: 132,
    ...(snapshot.state?.ui || {}),
  };
}

function formatTimeAgo(timestamp) {
  if (!timestamp) {
    return tr("только что", "just now");
  }
  const minutes = Math.max(0, Math.round((Date.now() - Number(timestamp)) / 60000));
  if (minutes < 1) {
    return tr("меньше минуты назад", "less than a minute ago");
  }
  if (minutes < 60) {
    return tr(`${minutes} мин назад`, `${minutes} min ago`);
  }
  const hours = Math.round(minutes / 60);
  return tr(`${hours} ч назад`, `${hours} h ago`);
}

function metricDisplayTransform(metricKey, value, snapshot, isDelta = false) {
  const units = getUiSettings(snapshot).units;
  if (units !== "imperial") {
    return value;
  }
  if (metricKey === "insideTemp" || metricKey === "outsideTemp") {
    return isDelta ? value * 1.8 : value * 1.8 + 32;
  }
  if (metricKey === "pressure") {
    return value * 0.145038;
  }
  if (metricKey === "velocity") {
    return value * 0.621371;
  }
  return value;
}

function metricUnit(metricKey, snapshot) {
  const imperial = getUiSettings(snapshot).units === "imperial";
  const units = {
    insideTemp: imperial ? "°F" : "°C",
    outsideTemp: imperial ? "°F" : "°C",
    pressure: imperial ? "psi" : tr("кПа", "kPa"),
    humidity: "%",
    co2: "%",
    powerLoad: tr("кВт", "kW"),
    velocity: imperial ? "mi/s" : tr("км/с", "km/s"),
    throughput: tr("Мбит/с", "Mbps"),
  };
  return units[metricKey] || "";
}

function formatMetric(metric, value, snapshot, isDelta = false) {
  const displayValue = metricDisplayTransform(metric.key, value, snapshot, isDelta);
  return `${formatNumber(displayValue, metric.digits)} ${metric.unit}`;
}

function getCurrentPageKey() {
  const body = document.body;
  if (body.classList.contains("template-dashboard-page")) return "home";
  if (body.classList.contains("template-simulator-page")) return "simulator";
  if (body.classList.contains("constructor-page")) return "constructor";
  if (body.classList.contains("template-orbit-page")) return "orbit";
  if (body.classList.contains("template-system-page")) return "system";
  if (body.classList.contains("template-data-page")) return "data";
  if (body.classList.contains("template-scenarios-page")) return "scenarios";
  if (body.classList.contains("template-settings-page")) return "settings";
  return "home";
}

function getScenarioById(id) {
  const state = stateApi.read();
  const custom = (state.userScenarios || []).find((scenario) => scenario.id === id);
  if (custom) {
    return custom;
  }
  return READY_SCENARIOS.find((scenario) => scenario.id === id) || READY_SCENARIOS[0];
}

function getMissionSnapshot() {
  const state = stateApi.read();
  const builder = state.builder || stateApi.summarizeBuilder();
  const scenario = getScenarioById(state.activeScenarioId);
  return { state, builder, scenario };
}

function computeOrbitStats(orbit) {
  const radiusKm = 6371 + Number(orbit.altitudeKm);
  const mu = 398600.4418;
  const periodSeconds = 2 * Math.PI * Math.sqrt((radiusKm ** 3) / mu);
  const velocityKms = Math.sqrt(mu / radiusKm);
  const eccentricity = Math.max(0.00012, Math.abs(Number(orbit.inclinationDeg) - 51.64) * 0.00008);
  return {
    periodMinutes: periodSeconds / 60,
    velocityKms,
    eccentricity,
    apogeeKm: Number(orbit.altitudeKm) + 4.6 + eccentricity * 1000,
    perigeeKm: Number(orbit.altitudeKm) - 4.1 - eccentricity * 800,
    argumentPerigee: 132.3 + (Number(orbit.altitudeKm) - 417) * 0.06,
  };
}

function getForecastModel(offsetHours = 0, snapshot = getMissionSnapshot()) {
  const { state, builder, scenario } = snapshot;
  const orbit = state.orbit;
  const phase = Date.now() / 3600000 + offsetHours;
  const moduleLoad = Math.max(0, builder.moduleCount - 6);
  const altitudeFactor = (Number(orbit.altitudeKm) - 417) / 140;
  const inclinationFactor = (Number(orbit.inclinationDeg) - 51.64) / 18;
  const thermalWave = Math.sin(phase * 1.9 + inclinationFactor * 0.8);
  const powerWave = Math.cos(phase * 1.3 + moduleLoad * 0.4);
  const linkWave = Math.sin(phase * 0.85 + 1.1);

  const insideTemp = 22.2 + moduleLoad * 0.34 + scenario.thermalBias * 0.8 + thermalWave * 0.9 - altitudeFactor * 0.25;
  const outsideTemp = -153 + thermalWave * 21 - inclinationFactor * 6 + scenario.thermalBias * 5;
  const pressure = 101.3 - moduleLoad * 0.03 + Math.sin(phase * 0.6) * 0.18;
  const humidity = 44 + moduleLoad * 0.7 + Math.sin(phase * 1.15 - 0.4) * 3.2;
  const co2 = 0.08 + moduleLoad * 0.004 + Math.max(0, scenario.thermalBias) * 0.004 + (Math.cos(phase * 0.92) + 1) * 0.004;
  const powerLoad = 12.4 + moduleLoad * 0.95 + scenario.powerBiasKw + powerWave * 1.4;
  const throughput = Math.max(
    90,
    360 + moduleLoad * 24 + scenario.linkBias + linkWave * 52 + (state.telemetry?.activeLinks || 0) * 14,
  );
  const velocity = computeOrbitStats(orbit).velocityKms;
  const illuminationState = thermalWave > -0.05 ? tr("Освещено", "Sunlit") : tr("Теневой участок", "In shadow");
  const confidence = Math.max(
    74,
    Math.min(
      97,
      92 - Math.abs(altitudeFactor) * 3 - Math.abs(inclinationFactor) * 2 - Math.max(0, moduleLoad - 3) * 1.2,
    ),
  );

  return {
    insideTemp,
    outsideTemp,
    pressure,
    humidity,
    co2,
    powerLoad,
    throughput,
    velocity,
    illuminationState,
    confidence,
  };
}

function metricValueForKey(metricKey, offsetHours, snapshot) {
  const model = getForecastModel(offsetHours, snapshot);
  const map = {
    insideTemp: model.insideTemp,
    outsideTemp: model.outsideTemp,
    pressure: model.pressure,
    humidity: model.humidity,
    co2: model.co2,
    powerLoad: model.powerLoad,
    velocity: model.velocity,
    throughput: model.throughput,
  };
  return map[metricKey] ?? 0;
}

function buildMetricDefinitions(snapshot) {
  const baseMetrics = [
    {
      key: "insideTemp",
      title: tr("Температура внутри", "Internal temperature"),
      digits: 1,
      accent: "spark--pink",
      group: tr("Термоконтур", "Thermal"),
      target: [20, 24],
    },
    {
      key: "outsideTemp",
      title: tr("Температура снаружи", "External temperature"),
      digits: 1,
      accent: "spark--cyan",
      group: tr("Внешняя среда", "External"),
      target: [-180, -95],
    },
    {
      key: "pressure",
      title: tr("Давление в модуле", "Cabin pressure"),
      digits: 1,
      accent: "spark--blue",
      group: tr("Жизнеобеспечение", "Life support"),
      target: [100.4, 102.1],
    },
    {
      key: "humidity",
      title: tr("Влажность", "Humidity"),
      unit: "%",
      digits: 1,
      accent: "spark--violet",
      group: tr("Жизнеобеспечение", "Life support"),
      target: [35, 55],
    },
    {
      key: "co2",
      title: tr("Уровень CO₂", "CO₂ level"),
      unit: "%",
      digits: 2,
      accent: "spark--cyan",
      group: tr("Атмосфера", "Atmosphere"),
      target: [0.03, 0.12],
    },
    {
      key: "powerLoad",
      title: tr("Потребляемая мощность", "Power load"),
      digits: 1,
      accent: "spark--pink",
      group: tr("Энергия", "Power"),
      target: [10, 18],
    },
    {
      key: "velocity",
      title: tr("Скорость относительно Земли", "Velocity vs Earth"),
      digits: 2,
      accent: "spark--blue",
      group: tr("Орбита", "Orbit"),
      target: [7.55, 7.75],
    },
    {
      key: "throughput",
      title: tr("Прогноз канала связи", "Link throughput"),
      digits: 0,
      accent: "spark--violet",
      group: tr("Связь", "Comms"),
      target: [280, 680],
    },
  ];

  return baseMetrics.map((metric) => {
    const current = metricValueForKey(metric.key, 0, snapshot);
    const future = metricValueForKey(metric.key, 0.5, snapshot);
    const delta = future - current;
    const targetLow = metricDisplayTransform(metric.key, metric.target[0], snapshot);
    const targetHigh = metricDisplayTransform(metric.key, metric.target[1], snapshot);
    return {
      ...metric,
      unit: metric.unit || metricUnit(metric.key, snapshot),
      current,
      displayCurrent: metricDisplayTransform(metric.key, current, snapshot),
      delta,
      displayDelta: metricDisplayTransform(metric.key, delta, snapshot, true),
      targetDisplay: [Math.min(targetLow, targetHigh), Math.max(targetLow, targetHigh)],
    };
  });
}

function buildSeries(metricKey, windowKey, snapshot) {
  const windowMeta = FORECAST_WINDOWS[windowKey] || FORECAST_WINDOWS["6h"];
  const step = windowMeta.hours / (windowMeta.points - 1);
  return Array.from({ length: windowMeta.points }, (_, index) => ({
    x: index,
    value: metricValueForKey(metricKey, index * step, snapshot),
  }));
}

function mapSeriesToChart(points, width = 520, height = 260, padding = 26) {
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 0.0001);
  const chartPoints = points.map((point, index) => {
    const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((point.value - min) / span) * (height - padding * 2);
    return { ...point, x, y };
  });
  return { chartPoints, min, max, span, width, height, padding };
}

function buildPath(points, smooth = true) {
  if (!points.length) {
    return "";
  }
  if (!smooth || points.length < 3) {
    return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
  }
  return points.map((point, index) => {
    if (index === 0) {
      return `M${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    }
    const previous = points[index - 1];
    const distance = point.x - previous.x;
    const cp1x = previous.x + distance * 0.46;
    const cp2x = point.x - distance * 0.46;
    return `C${cp1x.toFixed(2)} ${previous.y.toFixed(2)}, ${cp2x.toFixed(2)} ${point.y.toFixed(2)}, ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }).join(" ");
}

function buildAreaPath(points, baselineY) {
  if (!points.length) {
    return "";
  }
  const line = buildPath(points, true);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  return `${line} L${lastPoint.x.toFixed(2)} ${baselineY.toFixed(2)} L${firstPoint.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;
}

function buildBandPath(points, bandHeight = 10) {
  if (!points.length) {
    return "";
  }
  const upper = points.map((point) => ({ ...point, y: point.y - bandHeight }));
  const lower = [...points].reverse().map((point) => ({ ...point, y: point.y + bandHeight }));
  const upperPath = buildPath(upper, true);
  const lowerPath = lower.map((point, index) => `${index === 0 ? "L" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
  return `${upperPath} ${lowerPath} Z`;
}

function buildAxisLabels(scale, metric, snapshot) {
  const yValues = [scale.max, scale.min + scale.span / 2, scale.min];
  const xMeta = FORECAST_WINDOWS[scale.windowKey] || FORECAST_WINDOWS["6h"];
  const xLabels = [0, xMeta.hours / 2, xMeta.hours].map((hours) => {
    const suffix = hours >= 24 ? tr("д", "d") : tr("ч", "h");
    const value = hours >= 24 ? Math.round(hours / 24) : Math.round(hours);
    return value === 0 ? "0" : `+${value}${suffix}`;
  });
  return {
    y: yValues.map((value) => formatMetric(metric, value, snapshot)),
    x: xLabels,
  };
}

function getTrendState(series) {
  const first = series[0]?.value || 0;
  const last = series[series.length - 1]?.value || first;
  const delta = last - first;
  if (Math.abs(delta) < Math.max(0.04, Math.abs(first) * 0.004)) {
    return tr("стабильно", "stable");
  }
  return delta > 0 ? tr("рост", "rising") : tr("снижение", "falling");
}

function getRiskLabel(metric, values, snapshot) {
  const target = metric.targetDisplay || [0, 0];
  const convertedValues = values.map((value) => metricDisplayTransform(metric.key, value, snapshot));
  const outliers = convertedValues.filter((value) => value < target[0] || value > target[1]).length;
  const share = outliers / Math.max(convertedValues.length, 1);
  if (share > 0.34) {
    return tr("Повышенный", "Elevated");
  }
  if (share > 0.12) {
    return tr("Средний", "Moderate");
  }
  return tr("Низкий", "Low");
}

function ensureDrawer() {
  let drawer = document.querySelector(".template-drawer");
  if (drawer) {
    return drawer;
  }
  drawer = document.createElement("div");
  drawer.className = "template-drawer";
  drawer.innerHTML = `
    <button type="button" class="template-drawer__backdrop" aria-label="Close"></button>
    <section class="template-drawer__panel">
      <div class="template-drawer__header">
        <h2></h2>
        <button type="button" class="template-icon-button template-drawer__close" aria-label="Close">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div class="template-drawer__content"></div>
    </section>
  `;
  document.body.appendChild(drawer);
  drawer.querySelector(".template-drawer__backdrop").addEventListener("click", () => {
    drawer.classList.remove("is-open");
  });
  drawer.querySelector(".template-drawer__close").addEventListener("click", () => {
    drawer.classList.remove("is-open");
  });
  window.lucide?.createIcons?.();
  return drawer;
}

function openDrawer(title, html) {
  const drawer = ensureDrawer();
  drawer.querySelector("h2").textContent = title;
  drawer.querySelector(".template-drawer__content").innerHTML = html;
  drawer.classList.add("is-open");
  window.lucide?.createIcons?.();
}

function buildNotificationHtml(snapshot = getMissionSnapshot()) {
  const orbitStats = computeOrbitStats(snapshot.state.orbit);
  const forecast = getForecastModel(0.35, snapshot);
  const items = [
    {
      title: tr("Конструктор", "Builder"),
      text: tr(
        `В конфигурации ${snapshot.builder.moduleCount} модулей, расчетный запас энергии ${snapshot.builder.powerReservePct}%.`,
        `${snapshot.builder.moduleCount} modules in the configuration, estimated power reserve ${snapshot.builder.powerReservePct}%.`,
      ),
    },
    {
      title: tr("Активный сценарий", "Active scenario"),
      text: tr(snapshot.scenario.titleRu, snapshot.scenario.titleEn),
    },
    {
      title: tr("Прогноз", "Forecast"),
      text: tr(
        `Следующий тепловой пик ожидается через 20-25 минут, внутренняя температура выйдет к ${formatNumber(forecast.insideTemp + 0.6, 1)} °C.`,
        `The next thermal peak is expected in 20-25 minutes, internal temperature trends toward ${formatNumber(forecast.insideTemp + 0.6, 1)} °C.`,
      ),
    },
    {
      title: tr("Орбитальный период", "Orbit period"),
      text: tr(
        `${formatNumber(orbitStats.periodMinutes, 1)} мин на текущем профиле орбиты.`,
        `${formatNumber(orbitStats.periodMinutes, 1)} min on the current orbit profile.`,
      ),
    },
  ];

  return `
    <div class="template-drawer__list">
      ${items.map((item) => `
        <article>
          <strong>${item.title}</strong>
          <p>${item.text}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function bindTopbarActions() {
  const topbarButtons = [...document.querySelectorAll(".template-topbar__actions .template-icon-button")]
    .filter((button) => button.id !== "languageToggle");
  const notificationsButton = topbarButtons[0];
  const helpButton = topbarButtons[1];

  notificationsButton?.addEventListener("click", () => {
    openDrawer(tr("Сводка миссии", "Mission summary"), buildNotificationHtml());
  });

  helpButton?.addEventListener("click", () => {
    const pageKey = getCurrentPageKey();
    const help = PAGE_HELP[pageKey] || PAGE_HELP.home;
    openDrawer(
      tr("Подсказка по разделу", "Section help"),
      `<div class="template-drawer__prose"><p>${window.appLanguage.get() === "en" ? help.en : help.ru}</p></div>`,
    );
  });
}

function prepareHomePage() {
  const snapshot = getMissionSnapshot();
  const orbit = computeOrbitStats(snapshot.state.orbit);
  const values = [
    `${Math.round(snapshot.state.orbit.altitudeKm)} <small>${tr("км", "km")}</small>`,
    `${formatNumber(orbit.velocityKms, 2)} <small>${tr("км/с", "km/s")}</small>`,
    `${formatNumber(snapshot.state.orbit.inclinationDeg, 2)}°`,
    `${formatNumber(orbit.periodMinutes, 2)} <small>${tr("мин", "min")}</small>`,
  ];
  document.querySelectorAll(".metric-card strong").forEach((node, index) => {
    if (values[index]) {
      node.innerHTML = values[index];
    }
  });
  const copy = document.querySelector(".home-hero__copy");
  if (copy && !copy.querySelector(".home-hero__actions")) {
    const primaryLink = copy.querySelector(".template-primary-button");
    const actions = document.createElement("div");
    actions.className = "home-hero__actions";
    actions.innerHTML = `
      <a class="template-secondary-button" href="/constructor">
        ${tr("Открыть конструктор", "Open builder")}
        <i data-lucide="component"></i>
      </a>
    `;
    primaryLink?.after(actions);
  }
}

function prepareConstructorPage() {
  const panel = document.querySelector(".constructor-panel");
  if (!panel || panel.dataset.enhanced === "true") {
    return;
  }
  const stage = document.querySelector(".constructor-stage");
  if (stage && !stage.querySelector(".constructor-scene-toolbar")) {
    stage.insertAdjacentHTML("afterbegin", `
      <div class="scene-toolbar constructor-scene-toolbar">
        <div class="live-pill"><span></span>${tr("Инженерная сборка", "Engineering assembly")}</div>
        <div class="scene-toolbar__actions">
          <button type="button" class="template-icon-button" id="builderCamera" aria-label="${tr("Сбросить камеру", "Reset camera")}" title="${tr("Сбросить камеру", "Reset camera")}"><i data-lucide="camera"></i></button>
          <button type="button" class="template-icon-button" id="builderUndo" aria-label="${tr("Отменить последний модуль", "Undo last module")}" title="${tr("Отменить последний модуль", "Undo last module")}"><i data-lucide="undo-2"></i></button>
          <button type="button" class="template-icon-button" id="builderReset" aria-label="${tr("Сбросить станцию", "Reset station")}" title="${tr("Сбросить станцию", "Reset station")}"><i data-lucide="rotate-ccw"></i></button>
          <a class="template-icon-button" href="/simulator" aria-label="${tr("Открыть в симуляторе", "Open in simulator")}" title="${tr("Открыть в симуляторе", "Open in simulator")}"><i data-lucide="play"></i></a>
        </div>
      </div>
    `);
  }
  const paletteHtml = panel.querySelector(".constructor-palette-card")?.outerHTML ?? "";
  const solarAngle = panel.querySelector("#builderSolarAngle")?.value ?? "28";
  const scale = panel.querySelector("#builderScale")?.value ?? "1";
  panel.innerHTML = `
    ${paletteHtml}
    <section class="constructor-card">
      <div class="constructor-card-head">
        <span>${tr("Параметры сборки", "Assembly parameters")}</span>
      </div>
      <label class="constructor-slider">
        <span>${tr("Угол солнечных панелей", "Solar panel angle")}</span>
        <strong id="builderSolarAngleValue">${solarAngle}</strong>
        <input id="builderSolarAngle" type="range" min="0" max="90" step="1" value="${solarAngle}" />
      </label>
      <label class="constructor-slider">
        <span>${tr("Масштаб сцены", "Scene scale")}</span>
        <strong id="builderScaleValue">${Number(scale).toFixed(1)}x</strong>
        <input id="builderScale" type="range" min="0.7" max="1.6" step="0.05" value="${scale}" />
      </label>
      <label class="constructor-slider">
        <span>${tr("Тепловая нагрузка", "Thermal load bias")}</span>
        <strong id="builderThermalBiasValue">0%</strong>
        <input id="builderThermalBias" type="range" min="-25" max="55" step="1" value="0" />
      </label>
      <label class="constructor-slider">
        <span>${tr("Экипаж / нагрузка", "Crew / payload")}</span>
        <strong id="builderCrewLoadValue">3</strong>
        <input id="builderCrewLoad" type="range" min="1" max="9" step="1" value="3" />
      </label>
      <label class="constructor-slider">
        <span>${tr("Усиление связи", "Comms gain")}</span>
        <strong id="builderCommsGainValue">72%</strong>
        <input id="builderCommsGain" type="range" min="20" max="100" step="1" value="72" />
      </label>
    </section>
    <section class="constructor-card">
      <div class="constructor-card-head">
        <span>${tr("Инженерная оценка", "Engineering assessment")}</span>
      </div>
      <div class="constructor-engineering-grid">
        <article><span>${tr("Тепловой запас", "Thermal margin")}</span><strong id="builderThermalMargin">—</strong></article>
        <article><span>${tr("Связь", "Comms")}</span><strong id="builderCommsScore">—</strong></article>
        <article><span>${tr("Порты", "Ports")}</span><strong id="builderDockingCapacity">—</strong></article>
        <article><span>${tr("ΔV резерв", "Delta-V reserve")}</span><strong id="builderDeltaVReserve">—</strong></article>
      </div>
      <div class="constructor-risk-row">
        <span>${tr("Индекс риска", "Risk index")}</span>
        <strong id="builderRiskScore">—</strong>
      </div>
      <p class="constructor-advice" id="builderAssistantAdvice">${tr("Добавьте модуль, чтобы получить инженерную рекомендацию.", "Add a module to get an engineering recommendation.")}</p>
    </section>
    <section class="constructor-card constructor-selection" id="builderSelection" hidden>
      <div class="constructor-card-head">
        <span>${tr("Выбранный модуль", "Selected module")}</span>
      </div>
      <div class="constructor-selection-body">
        <dl>
          <div><dt>${tr("Модуль", "Module")}</dt><dd id="builderSelectedModule">—</dd></div>
          <div><dt>${tr("Порт", "Port")}</dt><dd id="builderSelectedPort">—</dd></div>
          <div><dt>${tr("Зависимые элементы", "Dependent elements")}</dt><dd id="builderSelectedCascade">0</dd></div>
        </dl>
        <button type="button" class="constructor-action constructor-action--danger" id="builderDeleteSelected">${tr("Удалить выбранный", "Delete selected")}</button>
      </div>
    </section>
    <section class="constructor-card">
      <div class="constructor-card-head">
        <span>${tr("Журнал сборки", "Assembly log")}</span>
      </div>
      <div class="constructor-log" id="builderLog" aria-live="polite"></div>
    </section>
  `;
  panel.dataset.enhanced = "true";
}

function prepareSimulatorPage() {
  if (getCurrentPageKey() !== "simulator") {
    return;
  }
  const toolbarButtons = document.querySelectorAll(".scene-toolbar__actions .template-icon-button");
  if (toolbarButtons[2]) {
    toolbarButtons[2].dataset.sceneAction = "fullscreen";
  }
  if (toolbarButtons[3]) {
    toolbarButtons[3].dataset.sceneAction = "sidebar";
  }

  const transportRow = document.querySelector(".transport-row");
  const externalPresetGrid = document.querySelector(".sim-presets-grid");
  if (
    transportRow
    && !externalPresetGrid?.querySelector("[data-preset]")
    && transportRow.querySelectorAll("[data-preset]").length < 3
  ) {
    const presets = [
      { id: "engineering", label: tr("Анализ", "Analysis") },
      { id: "education", label: tr("Стыковка", "Docking") },
      { id: "presentation", label: tr("Шоу", "Showcase") },
    ];
    const existing = transportRow.querySelector("[data-preset]");
    presets.forEach((preset, index) => {
      let button = index === 0 && existing ? existing : null;
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = "speed-pill";
        transportRow.appendChild(button);
      }
      button.dataset.preset = preset.id;
      button.textContent = preset.label;
    });
  }
}

function renderOrbitPage() {
  const root = document.querySelector(".orbit-page-grid");
  if (!root) {
    return;
  }
  const snapshot = getMissionSnapshot();
  const stats = computeOrbitStats(snapshot.state.orbit);
  root.innerHTML = `
    <aside class="template-panel orbit-params">
      <h2>${tr("Параметры орбиты", "Orbit parameters")}</h2>
      <dl>
        <div><dt>${tr("Высота орбиты", "Altitude")}</dt><dd>${Math.round(snapshot.state.orbit.altitudeKm)} ${tr("км", "km")}</dd></div>
        <div><dt>${tr("Наклонение", "Inclination")}</dt><dd>${formatNumber(snapshot.state.orbit.inclinationDeg, 2)}°</dd></div>
        <div><dt>${tr("Эксцентриситет", "Eccentricity")}</dt><dd>${stats.eccentricity.toFixed(6)}</dd></div>
        <div><dt>${tr("Аргумент перигея", "Argument of perigee")}</dt><dd>${formatNumber(stats.argumentPerigee, 1)}°</dd></div>
        <div><dt>${tr("Период обращения", "Orbital period")}</dt><dd>${formatNumber(stats.periodMinutes, 2)} ${tr("мин", "min")}</dd></div>
      </dl>
      <button type="button" class="template-secondary-button" id="orbitResetButton">${tr("Сбросить параметры", "Reset parameters")}</button>
    </aside>

    <article class="template-panel orbit-visual-card">
      <div class="panel-tabs" id="orbitModeTabs">
        <button type="button" class="is-active" data-orbit-mode="visual3d">3D ${tr("вид", "view")}</button>
        <button type="button" data-orbit-mode="projection">2D ${tr("проекция", "projection")}</button>
        <button type="button" data-orbit-mode="table">${tr("Таблица", "Table")}</button>
      </div>
      <div class="orbit-mode-panel" data-orbit-panel="visual3d">
        <div class="orbit-diagram" aria-hidden="true">
          <div class="orbit-path orbit-path--cyan"></div>
          <div class="orbit-path orbit-path--pink"></div>
          <div class="orbit-earth"></div>
          <span class="orbit-point orbit-point--a"></span>
          <span class="orbit-point orbit-point--b"></span>
          <div class="orbit-label orbit-label--a"><span>${tr("Апогей", "Apogee")}</span><strong>${formatNumber(stats.apogeeKm, 1)} ${tr("км", "km")}</strong></div>
          <div class="orbit-label orbit-label--b"><span>${tr("Перигей", "Perigee")}</span><strong>${formatNumber(stats.perigeeKm, 1)} ${tr("км", "km")}</strong></div>
        </div>
      </div>
      <div class="orbit-mode-panel" data-orbit-panel="projection" hidden>
        <div class="orbit-table">
          <div><span>${tr("Центральное тело", "Primary body")}</span><strong>${snapshot.state.orbit.hostBody}</strong></div>
          <div><span>${tr("Время модели", "Time scale")}</span><strong>${formatNumber(snapshot.state.orbit.timeScale, 1)}x</strong></div>
          <div><span>${tr("Скорость", "Velocity")}</span><strong>${formatNumber(stats.velocityKms, 2)} ${tr("км/с", "km/s")}</strong></div>
          <div><span>${tr("Точка следующего подъема", "Next rise point")}</span><strong>${tr("через 12 мин", "in 12 min")}</strong></div>
        </div>
      </div>
      <div class="orbit-mode-panel" data-orbit-panel="table" hidden>
        <div class="orbit-table">
          <div><span>Alt</span><strong>${Math.round(snapshot.state.orbit.altitudeKm)} km</strong></div>
          <div><span>Inc</span><strong>${formatNumber(snapshot.state.orbit.inclinationDeg, 2)}°</strong></div>
          <div><span>${tr("Период", "Period")}</span><strong>${formatNumber(stats.periodMinutes, 2)} ${tr("мин", "min")}</strong></div>
          <div><span>${tr("Апоцентр", "Apocenter")}</span><strong>${formatNumber(stats.apogeeKm, 1)} km</strong></div>
          <div><span>${tr("Перицентр", "Pericenter")}</span><strong>${formatNumber(stats.perigeeKm, 1)} km</strong></div>
          <div><span>${tr("Аргумент", "Argument")}</span><strong>${formatNumber(stats.argumentPerigee, 1)}°</strong></div>
        </div>
      </div>
      <div class="orbit-stat-row">
        <article><span>${tr("Апогей", "Apogee")}</span><strong>${formatNumber(stats.apogeeKm, 1)} ${tr("км", "km")}</strong></article>
        <article><span>${tr("Перигей", "Perigee")}</span><strong>${formatNumber(stats.perigeeKm, 1)} ${tr("км", "km")}</strong></article>
        <article><span>${tr("Скорость", "Velocity")}</span><strong>${formatNumber(stats.velocityKms, 2)} ${tr("км/с", "km/s")}</strong></article>
        <article><span>${tr("Период", "Period")}</span><strong>${formatNumber(stats.periodMinutes, 2)} ${tr("мин", "min")}</strong></article>
      </div>
    </article>
  `;
}

function renderSystemPage(selectedKey = "zvezda") {
  const root = document.querySelector(".system-page-grid");
  if (!root) {
    return;
  }
  const snapshot = getMissionSnapshot();
  const builderModules = snapshot.builder.modules.slice(0, 4);
  const moduleButtons = SYSTEM_MODULES.map((module) => `
    <button class="${module.key === selectedKey ? "is-active" : ""}" type="button" data-system-module="${module.key}">
      <span></span>
      <strong>${window.appLanguage.get() === "en" ? module.nameEn : module.nameRu}</strong>
      <small>${window.appLanguage.get() === "en" ? module.roleEn : module.roleRu}</small>
    </button>
  `).join("");
  const selected = SYSTEM_MODULES.find((module) => module.key === selectedKey) || SYSTEM_MODULES[1];
  const powerState = snapshot.builder.powerReservePct > 85 ? tr("Нормально", "Nominal") : tr("На контроле", "Watch");
  const thermalState = snapshot.scenario.thermalBias > 1 ? tr("Повышенная нагрузка", "Higher load") : tr("Нормально", "Nominal");
  const commState = snapshot.scenario.linkBias > 25 ? tr("Расширенный режим", "Expanded mode") : tr("Нормально", "Nominal");
  root.innerHTML = `
    <aside class="template-panel module-list-card">
      <h2>${tr("Модули", "Modules")}</h2>
      <div class="module-list" id="systemModuleList">
        ${moduleButtons}
        <button type="button" data-system-action="constructor">
          <span></span>
          <strong>${tr("Собранная конфигурация", "Built configuration")}</strong>
          <small>${snapshot.builder.moduleCount} ${tr("модулей", "modules")} · ${snapshot.builder.massT} ${tr("т", "t")}</small>
        </button>
      </div>
    </aside>

    <article class="template-panel station-blueprint">
      <div class="station-assembly" aria-hidden="true">
        <div class="station-truss"></div>
        <div class="station-module station-module--core"></div>
        <div class="station-module station-module--lab"></div>
        <div class="station-array station-array--left"></div>
        <div class="station-array station-array--right"></div>
        <div class="station-node"></div>
      </div>
      <div class="system-builder-summary">
        <strong>${tr("Пользовательские модули", "User modules")}</strong>
        <p>${builderModules.length ? builderModules.map((module) => module.label).join(", ") : tr("Пока используется базовая конфигурация.", "Baseline configuration is active.")}</p>
      </div>
    </article>

    <aside class="template-panel module-details-card">
      <h2 id="systemModuleName">${window.appLanguage.get() === "en" ? selected.nameEn : selected.nameRu}</h2>
      <p id="systemModuleRole">${window.appLanguage.get() === "en" ? selected.roleEn : selected.roleRu}</p>
      <dl id="systemModuleDetails">
        <div><dt>${tr("Масса", "Mass")}</dt><dd>${selected.massKg.toLocaleString("ru-RU")} ${tr("кг", "kg")}</dd></div>
        <div><dt>${tr("Длина", "Length")}</dt><dd>${selected.lengthM} ${tr("м", "m")}</dd></div>
        <div><dt>${tr("Диаметр", "Diameter")}</dt><dd>${selected.diameterM} ${tr("м", "m")}</dd></div>
        <div><dt>${tr("Объем", "Volume")}</dt><dd>${selected.volumeM3} ${tr("м³", "m³")}</dd></div>
        <div><dt>${tr("Экипаж", "Crew")}</dt><dd>${selected.crew || "—"}</dd></div>
        <div><dt>${tr("Состояние", "State")}</dt><dd class="is-nominal">${window.appLanguage.get() === "en" ? selected.stateEn : selected.stateRu}</dd></div>
      </dl>
      <div class="system-detail-actions">
        <button type="button" class="template-secondary-button" id="systemInspectButton">${tr("Открыть конструктор", "Open builder")} <i data-lucide="arrow-right"></i></button>
      </div>
    </aside>

    <section class="system-status-row">
      <article class="template-panel"><span>${tr("Энергоснабжение", "Power")}</span><strong>${powerState}</strong></article>
      <article class="template-panel"><span>${tr("Терморегуляция", "Thermal control")}</span><strong>${thermalState}</strong></article>
      <article class="template-panel"><span>${tr("Связь", "Communications")}</span><strong>${commState}</strong></article>
      <article class="template-panel"><span>${tr("Двигательная установка", "Propulsion")}</span><strong>${tr("Готовность", "Ready")}</strong></article>
    </section>
  `;
}

function renderDataPage() {
  const root = document.querySelector(".data-page-grid");
  if (!root) {
    return;
  }
  const snapshot = getMissionSnapshot();
  const settings = getUiSettings(snapshot);
  const metrics = buildMetricDefinitions(snapshot);
  const forecast = getForecastModel(0, snapshot);
  const confidence = Math.round(forecast.confidence);
  const orbitStats = computeOrbitStats(snapshot.state.orbit);
  const selectedWindow = FORECAST_WINDOWS[settings.forecastHorizon] ? settings.forecastHorizon : "6h";
  const scenarioTitle = window.appLanguage.get() === "en" ? snapshot.scenario.titleEn : snapshot.scenario.titleRu;
  const windowLabel = window.appLanguage.get() === "en" ? FORECAST_WINDOWS[selectedWindow].labelEn : FORECAST_WINDOWS[selectedWindow].labelRu;
  root.innerHTML = `
    <article class="template-panel data-board">
      <div class="panel-tabs" id="dataViewTabs">
        <button type="button" class="is-active" data-data-view="telemetry">${tr("Телеметрия", "Telemetry")}</button>
        <button type="button" data-data-view="graphs">${tr("Графики", "Graphs")}</button>
        <button type="button" data-data-view="journals">${tr("Журналы", "Journals")}</button>
        <button type="button" data-data-view="export">${tr("Экспорт", "Export")}</button>
      </div>
      <div class="forecast-banner">
        <div>
          <strong>${tr("Прогнозная модель активна", "Forecast model active")}</strong>
          <p>${tr("Числа синтезируются на основе орбиты, сценария, состава станции и связи. Доверие модели", "Values are synthesized from orbit, scenario, station composition and communications. Model confidence")} ${confidence}%.</p>
        </div>
        <button type="button" class="template-secondary-button" id="refreshForecastButton"><i data-lucide="refresh-cw"></i>${tr("Пересчитать", "Recalculate")}</button>
      </div>
      <section class="data-view-panel" data-data-panel="telemetry">
        <div class="data-health-strip">
          <article><span>${tr("Активный сценарий", "Active scenario")}</span><strong>${scenarioTitle}</strong></article>
          <article><span>${tr("Телеметрия обновлена", "Telemetry updated")}</span><strong>${formatTimeAgo(snapshot.state.telemetry.updatedAt)}</strong></article>
          <article><span>${tr("Период орбиты", "Orbit period")}</span><strong>${formatNumber(orbitStats.periodMinutes, 1)} ${tr("мин", "min")}</strong></article>
        </div>
        <div class="data-tile-grid" id="forecastTileGrid">
          ${metrics.map((metric, index) => `
            <article class="${index === 0 ? "is-active" : ""}" data-metric-card="${metric.key}">
              <span>${metric.title}</span>
              <strong>${formatNumber(metric.displayCurrent, metric.digits)} ${metric.unit}</strong>
              <small class="forecast-delta ${metric.displayDelta >= 0 ? "is-positive" : "is-negative"}">
                ${metric.displayDelta >= 0 ? "+" : ""}${formatNumber(metric.displayDelta, metric.digits)} ${tr("за 30 мин", "next 30 min")}
              </small>
              <em class="spark ${metric.accent}"></em>
            </article>
          `).join("")}
        </div>
      </section>
      <section class="data-view-panel" data-data-panel="graphs" hidden>
        <div class="forecast-chip-grid">
          <article><span>${tr("Сценарий", "Scenario")}</span><strong>${scenarioTitle}</strong></article>
          <article><span>${tr("Модули станции", "Station modules")}</span><strong>${snapshot.builder.moduleCount}</strong></article>
          <article><span>${tr("Запас энергии", "Power reserve")}</span><strong>${snapshot.builder.powerReservePct}%</strong></article>
          <article><span>${tr("Профиль связи", "Relay shell")}</span><strong>${snapshot.state.telemetry.relayCount} ${tr("ретрансляторов", "relays")}</strong></article>
        </div>
        <div class="metric-selector-grid" id="graphMetricSelector">
          ${metrics.slice(0, 6).map((metric) => `
            <button type="button" data-graph-metric="${metric.key}">
              <span>${metric.group}</span>
              <strong>${metric.title}</strong>
              <small>${tr("Норма", "Target")} ${formatNumber(metric.targetDisplay[0], metric.digits)}-${formatNumber(metric.targetDisplay[1], metric.digits)} ${metric.unit}</small>
            </button>
          `).join("")}
        </div>
      </section>
      <section class="data-view-panel" data-data-panel="journals" hidden>
        <div class="data-journal" id="forecastJournal"></div>
      </section>
      <section class="data-view-panel" data-data-panel="export" hidden>
        <div class="export-actions">
          <button type="button" class="template-secondary-button" id="exportJsonButton">${tr("Экспорт JSON", "Export JSON")}</button>
          <button type="button" class="template-secondary-button" id="exportCsvButton">${tr("Экспорт CSV", "Export CSV")}</button>
        </div>
        <pre class="export-preview" id="exportPreview"></pre>
      </section>
    </article>

    <article class="template-panel chart-card" data-selected-metric="insideTemp" data-selected-window="${selectedWindow}">
      <div class="chart-card__head">
        <div>
          <h2 id="forecastChartTitle">${tr("Тепловой прогноз", "Thermal forecast")}</h2>
          <p class="template-microcopy" id="forecastChartSubtitle">${tr("Окно прогноза", "Forecast window")} ${windowLabel} · ${scenarioTitle}</p>
        </div>
        <div class="panel-tabs panel-tabs--small" id="forecastWindowTabs">
          ${Object.keys(FORECAST_WINDOWS).map((key) => `<button type="button" class="${key === selectedWindow ? "is-active" : ""}" data-window="${key}">${key}</button>`).join("")}
        </div>
      </div>
      <div class="forecast-legend">
        <span><i class="legend-line legend-line--main"></i>${tr("Прогноз", "Forecast")}</span>
        <span><i class="legend-line legend-line--band"></i>${tr("Диапазон доверия", "Confidence band")}</span>
        <span id="forecastTrendLabel">${tr("Тренд", "Trend")}: —</span>
      </div>
      <div class="line-chart">
        <svg viewBox="0 0 520 260" role="img" id="forecastChartSvg">
          <defs>
            <linearGradient id="chartLineForecast" x1="0" x2="1">
              <stop offset="0%" stop-color="#ff2fcf" />
              <stop offset="100%" stop-color="#28c9ff" />
            </linearGradient>
            <linearGradient id="chartAreaForecast" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#28c9ff" stop-opacity="0.24" />
              <stop offset="100%" stop-color="#ff2fcf" stop-opacity="0.02" />
            </linearGradient>
          </defs>
          <g class="chart-grid-lines">
            <path d="M26 26H494M26 78H494M26 130H494M26 182H494M26 234H494"></path>
            <path d="M26 26V234M143 26V234M260 26V234M377 26V234M494 26V234"></path>
          </g>
          <path id="forecastBandPath"></path>
          <path id="forecastAreaPath"></path>
          <path id="forecastChartPath"></path>
          <g class="chart-dots" id="forecastDotLayer"></g>
          <g class="chart-axis-labels chart-axis-labels--y">
            <text id="forecastYMax" x="30" y="20">—</text>
            <text id="forecastYMid" x="30" y="134">—</text>
            <text id="forecastYMin" x="30" y="252">—</text>
          </g>
          <g class="chart-axis-labels chart-axis-labels--x">
            <text id="forecastXStart" x="28" y="252">0</text>
            <text id="forecastXMid" x="246" y="252">—</text>
            <text id="forecastXEnd" x="464" y="252">—</text>
          </g>
        </svg>
      </div>
      <div class="forecast-summary">
        <article><span>${tr("Следующий пик", "Next peak")}</span><strong id="forecastPeakValue">—</strong></article>
        <article><span>${tr("Риск аномалии", "Anomaly risk")}</span><strong id="forecastRiskValue">—</strong></article>
        <article><span>${tr("Доверие", "Confidence")}</span><strong id="forecastConfidenceValue">${confidence}%</strong></article>
        <article><span>${tr("Средний дрейф", "Mean drift")}</span><strong id="forecastDriftValue">—</strong></article>
      </div>
    </article>
  `;
}

function renderScenariosPage() {
  const root = document.querySelector(".scenario-page-grid");
  if (!root) {
    return;
  }
  root.innerHTML = `
    <article class="template-panel scenario-list-card">
      <div class="panel-tabs" id="scenarioScopeTabs">
        <button type="button" class="is-active" data-scenario-scope="ready">${tr("Готовые сценарии", "Ready scenarios")}</button>
        <button type="button" data-scenario-scope="user">${tr("Мои сценарии", "My scenarios")}</button>
      </div>
      <div class="scenario-list" id="scenarioList"></div>
      <button type="button" class="create-scenario" id="createScenarioButton"><i data-lucide="plus-circle"></i> ${tr("Создать новый сценарий", "Create new scenario")}</button>
    </article>
    <aside class="template-panel scenario-params-card">
      <h2>${tr("Параметры сценария", "Scenario parameters")}</h2>
      <dl id="scenarioDetails"></dl>
      <p class="template-microcopy" id="scenarioSummary"></p>
      <div class="scenario-actions">
        <button type="button" class="template-secondary-button" id="previewScenarioButton">${tr("Применить параметры", "Preview parameters")}</button>
        <button type="button" class="template-primary-button" id="launchScenarioButton">${tr("Запустить сценарий", "Launch scenario")}</button>
      </div>
    </aside>
  `;
}

function renderSettingsPage() {
  const root = document.querySelector(".settings-page-grid");
  if (!root) {
    return;
  }
  const state = stateApi.read();
  const ui = getUiSettings({ state });
  const sceneRanges = SIMULATOR_SETTINGS_RANGES.slice(0, 5)
    .map((config) => renderSimulatorSettingsRange(ui, config))
    .join("");
  const lightingRanges = SIMULATOR_SETTINGS_RANGES.slice(5)
    .map((config) => renderSimulatorSettingsRange(ui, config))
    .join("");
  root.innerHTML = `
    <article class="template-panel settings-card">
      <h2>${tr("Интерфейс", "Interface")}</h2>
      <label class="settings-field"><span>${tr("Тема", "Theme")}</span>
        <select id="settingsThemeSelect">
          <option value="neon-dark"${ui.theme === "neon-dark" ? " selected" : ""}>${tr("Неоновая темная", "Neon dark")}</option>
          <option value="contrast"${ui.theme === "contrast" ? " selected" : ""}>${tr("Контрастная", "High contrast")}</option>
        </select>
      </label>
      <label class="settings-field"><span>${tr("Плотность панелей", "Panel density")}</span>
        <select id="settingsDensitySelect">
          <option value="comfortable"${ui.density === "comfortable" ? " selected" : ""}>${tr("Комфортная", "Comfortable")}</option>
          <option value="compact"${ui.density === "compact" ? " selected" : ""}>${tr("Компактная", "Compact")}</option>
        </select>
      </label>
      <label class="settings-field"><span>${tr("Акцент интерфейса", "Interface accent")}</span>
        <select id="settingsAccentSelect">
          <option value="magenta"${ui.accent === "magenta" ? " selected" : ""}>${tr("Маджента / циан", "Magenta / cyan")}</option>
          <option value="cyan"${ui.accent === "cyan" ? " selected" : ""}>${tr("Циан / зеленый", "Cyan / green")}</option>
          <option value="blue"${ui.accent === "blue" ? " selected" : ""}>${tr("Синий / фиолетовый", "Blue / violet")}</option>
        </select>
      </label>
      <label class="settings-toggle"><input id="settingsSidebarToggle" type="checkbox"${ui.sidebarCollapsed ? " checked" : ""} /> <span>${tr("Компактная боковая панель", "Compact sidebar")}</span></label>
      <label class="settings-toggle"><input id="settingsReducedMotionToggle" type="checkbox"${ui.reducedMotion ? " checked" : ""} /> <span>${tr("Уменьшить анимации", "Reduce motion")}</span></label>
    </article>
    <article class="template-panel settings-card">
      <h2>${tr("Данные и прогнозы", "Data and forecasts")}</h2>
      <label class="settings-field"><span>${tr("Единицы измерения", "Units")}</span>
        <select id="settingsUnitsSelect">
          <option value="metric"${ui.units === "metric" ? " selected" : ""}>${tr("Километры и метры", "Kilometers and meters")}</option>
          <option value="imperial"${ui.units === "imperial" ? " selected" : ""}>${tr("Мили и фаренгейт", "Miles and Fahrenheit")}</option>
        </select>
      </label>
      <label class="settings-field"><span>${tr("Обновление данных", "Data refresh")}</span>
        <select id="settingsRefreshSelect">
          <option value="10s"${ui.dataRefresh === "10s" ? " selected" : ""}>${tr("Каждые 10 секунд", "Every 10 seconds")}</option>
          <option value="30s"${ui.dataRefresh === "30s" ? " selected" : ""}>${tr("Каждые 30 секунд", "Every 30 seconds")}</option>
          <option value="manual"${ui.dataRefresh === "manual" ? " selected" : ""}>${tr("Вручную", "Manual")}</option>
        </select>
      </label>
      <label class="settings-field"><span>${tr("Горизонт графика", "Chart horizon")}</span>
        <select id="settingsForecastHorizonSelect">
          ${Object.entries(FORECAST_WINDOWS).map(([key, meta]) => `<option value="${key}"${ui.forecastHorizon === key ? " selected" : ""}>${window.appLanguage.get() === "en" ? meta.labelEn : meta.labelRu}</option>`).join("")}
        </select>
      </label>
      <label class="settings-toggle"><input id="settingsSmoothingToggle" type="checkbox"${ui.chartSmoothing ? " checked" : ""} /> <span>${tr("Сглаживать линии графиков", "Smooth chart lines")}</span></label>
      <label class="settings-toggle"><input id="settingsUncertaintyToggle" type="checkbox"${ui.showUncertainty ? " checked" : ""} /> <span>${tr("Показывать диапазон доверия", "Show confidence band")}</span></label>
    </article>
    <article class="template-panel settings-card">
      <h2>${tr("Симулятор", "Simulator")}</h2>
      <label class="settings-toggle"><input id="settingsTexturesToggle" type="checkbox"${ui.planetTextures ? " checked" : ""} /> <span>${tr("Реальные текстуры планет", "Photoreal planet textures")}</span></label>
      <label class="settings-toggle"><input id="settingsOrbitLinesToggle" type="checkbox"${ui.orbitRails ? " checked" : ""} /> <span>${tr("Орбитальные линии", "Orbit rails")}</span></label>
      <label class="settings-toggle"><input id="settingsHighlightToggle" type="checkbox"${ui.highlightModules ? " checked" : ""} /> <span>${tr("Подсветка активных модулей", "Highlight active modules")}</span></label>
      <p class="template-microcopy">${tr("Визуал планеты, свет и скорость свободной камеры вынесены в этот раздел. В симуляторе остались только операционные контролы.", "Planet render, lighting, and free camera speed now live here. The simulator keeps only operational controls.")}</p>
    </article>
    <article class="template-panel settings-card settings-card--sim-tuning">
      <h2>${tr("Рендер планеты", "Planet render")}</h2>
      <p class="template-microcopy">${tr("Контраст, облака и атмосфера теперь настраиваются отдельно, без перегруза основной сцены.", "Contrast, clouds, and atmosphere now tune separately without cluttering the main scene.")}</p>
      ${sceneRanges}
    </article>
    <article class="template-panel settings-card settings-card--sim-tuning">
      <h2>${tr("Свет и свободная камера", "Lighting and free camera")}</h2>
      <p class="template-microcopy">${tr("Солнечная схема, звездное поле и скорость облета сцены сохраняются как часть инженерного профиля.", "Sun rig, starfield, and fly-through speed are now saved as part of your engineering profile.")}</p>
      ${lightingRanges}
    </article>
    <article class="template-panel settings-card settings-card--summary">
      <h2>${tr("Текущее состояние", "Current state")}</h2>
      <div class="settings-summary-grid">
        <article><span>${tr("Сценарий", "Scenario")}</span><strong>${window.appLanguage.get() === "en" ? getScenarioById(state.activeScenarioId).titleEn : getScenarioById(state.activeScenarioId).titleRu}</strong></article>
        <article><span>${tr("Модули", "Modules")}</span><strong>${state.builder?.moduleCount || stateApi.summarizeBuilder().moduleCount}</strong></article>
        <article><span>${tr("Орбита", "Orbit")}</span><strong>${Math.round(state.orbit.altitudeKm)} ${tr("км", "km")}</strong></article>
        <article><span>${tr("Обновление", "Refresh")}</span><strong>${ui.dataRefresh === "manual" ? tr("вручную", "manual") : ui.dataRefresh}</strong></article>
      </div>
      <button type="button" class="template-secondary-button" id="settingsResetButton">${tr("Сбросить настройки интерфейса", "Reset UI settings")}</button>
    </article>
  `;
}

function bindOrbitPage() {
  document.querySelectorAll("#orbitModeTabs [data-orbit-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.orbitMode;
      document.querySelectorAll("#orbitModeTabs button").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      document.querySelectorAll("[data-orbit-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.orbitPanel !== mode;
      });
    });
  });

  document.getElementById("orbitResetButton")?.addEventListener("click", () => {
    stateApi.update((state) => {
      state.orbit = {
        hostBody: "earth",
        altitudeKm: 417,
        inclinationDeg: 51.64,
        timeScale: 1.8,
      };
      state.activeScenarioId = "engineering";
      return state;
    }, "orbit");
    renderOrbitPage();
    bindOrbitPage();
    stateApi.showToast(tr("Орбитальные параметры возвращены к инженерному профилю.", "Orbit parameters restored to the engineering profile."));
  });
}

function bindSystemPage() {
  document.querySelectorAll("[data-system-module]").forEach((button) => {
    button.addEventListener("click", () => {
      renderSystemPage(button.dataset.systemModule);
      bindSystemPage();
      window.lucide?.createIcons?.();
    });
  });

  document.querySelector('[data-system-action="constructor"]')?.addEventListener("click", () => {
    window.location.assign("/constructor");
  });
  document.getElementById("systemInspectButton")?.addEventListener("click", () => {
    window.location.assign("/constructor");
  });
}

function updateForecastChart(metricKey, windowKey) {
  const chartCard = document.querySelector(".chart-card");
  if (!chartCard) {
    return;
  }
  chartCard.dataset.selectedMetric = metricKey;
  chartCard.dataset.selectedWindow = windowKey;
  const snapshot = getMissionSnapshot();
  const settings = getUiSettings(snapshot);
  const metrics = buildMetricDefinitions(snapshot);
  const metric = metrics.find((entry) => entry.key === metricKey) || metrics[0];
  const series = buildSeries(metric.key, windowKey, snapshot);
  const scale = mapSeriesToChart(series);
  scale.windowKey = windowKey;
  const path = buildPath(scale.chartPoints, settings.chartSmoothing);
  const areaPath = buildAreaPath(scale.chartPoints, scale.height - scale.padding);
  const bandPath = buildBandPath(scale.chartPoints, settings.showUncertainty ? 12 : 0);
  const values = series.map((point) => point.value);
  const peak = Math.max(...values);
  const drift = values[values.length - 1] - values[0];
  const axisLabels = buildAxisLabels(scale, metric, snapshot);
  const windowMeta = FORECAST_WINDOWS[windowKey] || FORECAST_WINDOWS["6h"];
  const risk = getRiskLabel(metric, values, snapshot);
  const visibleDots = scale.chartPoints.filter((_, index) => index % Math.max(1, Math.floor(scale.chartPoints.length / 8)) === 0);
  const trend = getTrendState(series);

  document.getElementById("forecastBandPath").setAttribute("d", settings.showUncertainty ? bandPath : "");
  document.getElementById("forecastAreaPath").setAttribute("d", areaPath);
  document.getElementById("forecastChartPath").setAttribute("d", path);
  document.getElementById("forecastChartPath").setAttribute("stroke", 'url("#chartLineForecast")');
  document.getElementById("forecastChartPath").setAttribute("fill", "none");
  document.getElementById("forecastChartPath").setAttribute("stroke-width", "4");
  document.getElementById("forecastChartPath").setAttribute("stroke-linecap", "round");
  document.getElementById("forecastDotLayer").innerHTML = visibleDots.map((point) => `<circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="3.2"></circle>`).join("");
  document.getElementById("forecastChartTitle").textContent = metric.title;
  document.getElementById("forecastChartSubtitle").textContent = tr(
    `${windowMeta.labelRu} · сценарий “${snapshot.scenario.titleRu}” · ${settings.units === "imperial" ? "английские единицы" : "метрические единицы"}`,
    `${windowMeta.labelEn} · scenario “${snapshot.scenario.titleEn}” · ${settings.units === "imperial" ? "imperial units" : "metric units"}`,
  );
  document.getElementById("forecastPeakValue").textContent = formatMetric(metric, peak, snapshot);
  document.getElementById("forecastRiskValue").textContent = risk;
  document.getElementById("forecastConfidenceValue").textContent = `${Math.round(getForecastModel(0, snapshot).confidence)}%`;
  document.getElementById("forecastDriftValue").textContent = `${drift >= 0 ? "+" : ""}${formatMetric(metric, drift, snapshot, true)}`;
  document.getElementById("forecastTrendLabel").textContent = `${tr("Тренд", "Trend")}: ${trend}`;
  document.getElementById("forecastYMax").textContent = axisLabels.y[0];
  document.getElementById("forecastYMid").textContent = axisLabels.y[1];
  document.getElementById("forecastYMin").textContent = axisLabels.y[2];
  document.getElementById("forecastXStart").textContent = axisLabels.x[0];
  document.getElementById("forecastXMid").textContent = axisLabels.x[1];
  document.getElementById("forecastXEnd").textContent = axisLabels.x[2];
}

function fillForecastJournal() {
  const journal = document.getElementById("forecastJournal");
  if (!journal) {
    return;
  }
  const snapshot = getMissionSnapshot();
  const forecast = getForecastModel(0.5, snapshot);
  const metrics = buildMetricDefinitions(snapshot);
  const byKey = (key) => metrics.find((metric) => metric.key === key);
  const entries = [
    [tr("+08 мин", "+08 min"), tr(`Станция выйдет на более освещенный участок, внешний контур прогреется до ${formatMetric(byKey("outsideTemp"), forecast.outsideTemp + 7, snapshot)}.`, `The station enters a brighter segment and the outer contour warms to ${formatMetric(byKey("outsideTemp"), forecast.outsideTemp + 7, snapshot)}.`)],
    [tr("+17 мин", "+17 min"), tr(`Связной контур выйдет на пик ${formatMetric(byKey("throughput"), forecast.throughput + 18, snapshot)} благодаря расширенному углу обзора.`, `The communications shell peaks near ${formatMetric(byKey("throughput"), forecast.throughput + 18, snapshot)} thanks to wider geometry.`)],
    [tr("+29 мин", "+29 min"), tr(`Ожидается максимальная тепловая нагрузка: внутренняя температура приблизится к ${formatMetric(byKey("insideTemp"), forecast.insideTemp + 0.6, snapshot)}.`, `Peak thermal load expected: internal temperature approaches ${formatMetric(byKey("insideTemp"), forecast.insideTemp + 0.6, snapshot)}.`)],
    [tr("+42 мин", "+42 min"), tr(`Модель прогнозирует стабилизацию потребления мощности около ${formatMetric(byKey("powerLoad"), forecast.powerLoad - 0.8, snapshot)}.`, `The model forecasts power draw stabilization near ${formatMetric(byKey("powerLoad"), forecast.powerLoad - 0.8, snapshot)}.`)],
  ];
  journal.innerHTML = entries.map(([time, text]) => `
    <article class="data-journal__row">
      <time>${time}</time>
      <p>${text}</p>
    </article>
  `).join("");
}

function updateExportPreview() {
  const preview = document.getElementById("exportPreview");
  if (!preview) {
    return;
  }
  const snapshot = getMissionSnapshot();
  const forecast = getForecastModel(0, snapshot);
  const settings = getUiSettings(snapshot);
  const metrics = buildMetricDefinitions(snapshot).map((metric) => ({
    key: metric.key,
    label: metric.title,
    value: Number(metric.displayCurrent.toFixed(metric.digits)),
    delta30m: Number(metric.displayDelta.toFixed(metric.digits)),
    unit: metric.unit,
  }));
  preview.textContent = JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      scenario: snapshot.scenario.id,
      orbit: snapshot.state.orbit,
      builder: snapshot.builder,
      settings: {
        units: settings.units,
        forecastHorizon: settings.forecastHorizon,
        chartSmoothing: settings.chartSmoothing,
        showUncertainty: settings.showUncertainty,
      },
      metrics,
      forecast,
    },
    null,
    2,
  );
}

function downloadText(filename, text, mimeType) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function activateDataPanel(view) {
  document.querySelectorAll("#dataViewTabs button").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.dataView === view);
  });
  document.querySelectorAll("[data-data-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.dataPanel !== view;
  });
}

function syncMetricSelection(metricKey) {
  document.querySelectorAll("[data-metric-card]").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.metricCard === metricKey);
  });
  document.querySelectorAll("[data-graph-metric]").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.graphMetric === metricKey);
  });
}

function refreshDataPageView(showToast = false) {
  const chartCard = document.querySelector(".chart-card");
  const activeView = document.querySelector("#dataViewTabs .is-active")?.dataset.dataView || "telemetry";
  const selectedMetric = chartCard?.dataset.selectedMetric || "insideTemp";
  const selectedWindow = chartCard?.dataset.selectedWindow || getUiSettings().forecastHorizon || "6h";
  renderDataPage();
  bindDataPage();
  activateDataPanel(activeView);
  syncMetricSelection(selectedMetric);
  updateForecastChart(selectedMetric, selectedWindow);
  window.lucide?.createIcons?.();
  if (showToast) {
    stateApi.showToast(tr("Прогноз пересчитан по текущему состоянию.", "Forecast recalculated from the current state."));
  }
}

function startDataRefreshLoop() {
  window.clearInterval(window.__issDataRefreshTimer);
  const settings = getUiSettings();
  if (settings.dataRefresh === "manual") {
    window.__issDataRefreshTimer = null;
    return;
  }
  const intervalMs = settings.dataRefresh === "30s" ? 30000 : 10000;
  window.__issDataRefreshTimer = window.setInterval(() => {
    if (getCurrentPageKey() === "data") {
      refreshDataPageView(false);
    }
  }, intervalMs);
}

function bindDataPage() {
  const chartCard = document.querySelector(".chart-card");
  if (!chartCard) {
    return;
  }
  updateForecastChart(chartCard.dataset.selectedMetric || "insideTemp", chartCard.dataset.selectedWindow || "6h");
  fillForecastJournal();
  updateExportPreview();

  document.querySelectorAll("#forecastTileGrid [data-metric-card]").forEach((card) => {
    card.addEventListener("click", () => {
      syncMetricSelection(card.dataset.metricCard);
      updateForecastChart(card.dataset.metricCard, chartCard.dataset.selectedWindow || "6h");
    });
  });

  document.querySelectorAll("#graphMetricSelector [data-graph-metric]").forEach((button) => {
    button.addEventListener("click", () => {
      syncMetricSelection(button.dataset.graphMetric);
      updateForecastChart(button.dataset.graphMetric, chartCard.dataset.selectedWindow || "6h");
    });
  });

  document.querySelectorAll("#forecastWindowTabs [data-window]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("#forecastWindowTabs button").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      updateForecastChart(chartCard.dataset.selectedMetric || "insideTemp", button.dataset.window);
      stateApi.update((state) => {
        state.ui.forecastHorizon = button.dataset.window;
        return state;
      }, "data-window");
    });
  });

  document.querySelectorAll("#dataViewTabs [data-data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      activateDataPanel(button.dataset.dataView);
    });
  });

  document.getElementById("refreshForecastButton")?.addEventListener("click", () => {
    refreshDataPageView(true);
  });

  document.getElementById("exportJsonButton")?.addEventListener("click", () => {
    downloadText("iss-forecast.json", document.getElementById("exportPreview").textContent, "application/json");
    stateApi.showToast(tr("JSON-прогноз выгружен.", "JSON forecast exported."));
  });

  document.getElementById("exportCsvButton")?.addEventListener("click", () => {
    const snapshot = getMissionSnapshot();
    const metrics = buildMetricDefinitions(snapshot);
    const rows = [["metric", "value", "unit", "delta_30m"]].concat(
      metrics.map((metric) => [
        metric.key,
        metric.displayCurrent.toFixed(metric.digits),
        metric.unit,
        metric.displayDelta.toFixed(metric.digits),
      ]),
    );
    downloadText("iss-forecast.csv", rows.map((row) => row.join(",")).join("\n"), "text/csv");
    stateApi.showToast(tr("CSV-прогноз выгружен.", "CSV forecast exported."));
  });
  startDataRefreshLoop();
}

function renderScenarioList(scope = "ready", selectedId = null) {
  const list = document.getElementById("scenarioList");
  if (!list) {
    return;
  }
  const state = stateApi.read();
  const scenarios = scope === "user" ? state.userScenarios || [] : READY_SCENARIOS;
  const activeId = selectedId || state.pendingScenario?.id || state.activeScenarioId || scenarios[0]?.id;

  if (!scenarios.length) {
    list.innerHTML = `<div class="scenario-empty">${tr("Пользовательских сценариев пока нет. Сохраните текущую конфигурацию кнопкой ниже.", "No user scenarios yet. Save the current configuration with the button below.")}</div>`;
    return null;
  }

  list.innerHTML = scenarios.map((scenario) => `
    <article class="${scenario.id === activeId ? "is-selected" : ""}" data-scenario-id="${scenario.id}">
      <div>
        <h2>${window.appLanguage.get() === "en" ? scenario.titleEn : scenario.titleRu}</h2>
        <p>${window.appLanguage.get() === "en" ? scenario.descriptionEn : scenario.descriptionRu}</p>
      </div>
      <span class="difficulty">${window.appLanguage.get() === "en" ? scenario.difficultyEn : scenario.difficultyRu}</span>
      <button type="button" data-scenario-select="${scenario.id}">${tr("Выбрать", "Select")}</button>
    </article>
  `).join("");
  return scenarios.find((scenario) => scenario.id === activeId) || scenarios[0];
}

function fillScenarioDetails(scenario) {
  if (!scenario) {
    return;
  }
  const details = document.getElementById("scenarioDetails");
  const summary = document.getElementById("scenarioSummary");
  details.innerHTML = `
    <div><dt>${tr("Длительность", "Duration")}</dt><dd>${String(Math.floor(scenario.durationMinutes / 60)).padStart(2, "0")}:${String(scenario.durationMinutes % 60).padStart(2, "0")}:00</dd></div>
    <div><dt>${tr("Ускорение времени", "Time scale")}</dt><dd>${scenario.timeScale}x</dd></div>
    <div><dt>${tr("Начальные условия", "Initial conditions")}</dt><dd>${scenario.altitudeKm} ${tr("км", "km")} · ${scenario.inclinationDeg}°</dd></div>
    <div><dt>${tr("Внешние факторы", "External factors")}</dt><dd>${window.appLanguage.get() === "en" ? scenario.externalFactorsEn : scenario.externalFactorsRu}</dd></div>
  `;
  summary.textContent = window.appLanguage.get() === "en" ? scenario.summaryEn : scenario.summaryRu;
}

function createUserScenario() {
  const snapshot = getMissionSnapshot();
  const state = stateApi.read();
  const nextIndex = (state.userScenarios || []).length + 1;
  const scenario = {
    id: `custom-${Date.now()}`,
    preset: "engineering",
    titleRu: `Пользовательский сценарий ${nextIndex}`,
    titleEn: `Custom scenario ${nextIndex}`,
    descriptionRu: `Сохраненная конфигурация: ${snapshot.builder.moduleCount} модулей, орбита ${Math.round(snapshot.state.orbit.altitudeKm)} км.`,
    descriptionEn: `Saved configuration: ${snapshot.builder.moduleCount} modules, orbit ${Math.round(snapshot.state.orbit.altitudeKm)} km.`,
    difficultyRu: snapshot.builder.moduleCount > 9 ? "Средний" : "Легкий",
    difficultyEn: snapshot.builder.moduleCount > 9 ? "Medium" : "Easy",
    durationMinutes: 60,
    timeScale: snapshot.state.orbit.timeScale,
    altitudeKm: snapshot.state.orbit.altitudeKm,
    inclinationDeg: snapshot.state.orbit.inclinationDeg,
    externalFactorsRu: "Параметры зафиксированы по текущему состоянию",
    externalFactorsEn: "Parameters frozen from the current state",
    summaryRu: `Сценарий создан из текущей конфигурации конструктора (${snapshot.builder.moduleCount} модулей, ${snapshot.builder.massT} т).`,
    summaryEn: `Scenario created from the current builder state (${snapshot.builder.moduleCount} modules, ${snapshot.builder.massT} t).`,
    thermalBias: snapshot.builder.moduleCount > 10 ? 0.9 : 0.2,
    powerBiasKw: Math.max(0.4, (snapshot.builder.moduleCount - 6) * 0.4),
    linkBias: Math.max(10, snapshot.builder.moduleCount * 4),
  };
  stateApi.update((current) => {
    current.userScenarios = [...(current.userScenarios || []), scenario];
    current.pendingScenario = scenario;
    return current;
  }, "scenario");
  return scenario;
}

function previewScenario(scenario) {
  stateApi.update((state) => {
    state.activeScenarioId = scenario.id;
    state.pendingScenario = scenario;
    state.orbit = {
      ...state.orbit,
      altitudeKm: scenario.altitudeKm,
      inclinationDeg: scenario.inclinationDeg,
      timeScale: scenario.timeScale,
    };
    return state;
  }, "scenario-preview");
  stateApi.showToast(tr("Параметры сценария применены к общему состоянию.", "Scenario parameters applied to shared state."));
}

function launchScenario(scenario) {
  previewScenario(scenario);
  window.location.assign(`/simulator?scenario=${encodeURIComponent(scenario.preset || scenario.id)}`);
}

function bindScenariosPage() {
  const card = document.querySelector(".scenario-list-card");
  if (!card) {
    return;
  }

  const refresh = (nextScope = card.dataset.scope || "ready", nextSelectedId = card.dataset.selectedId || null) => {
    card.dataset.scope = nextScope;
    document.querySelectorAll("#scenarioScopeTabs button").forEach((item) => {
      item.classList.toggle("is-active", item.dataset.scenarioScope === nextScope);
    });
    const selectedScenario = renderScenarioList(nextScope, nextSelectedId);
    if (selectedScenario) {
      card.dataset.selectedId = selectedScenario.id;
      fillScenarioDetails(selectedScenario);
    }
    return selectedScenario;
  };

  refresh();

  if (card.dataset.bound === "true") {
    return;
  }
  card.dataset.bound = "true";

  document.getElementById("scenarioScopeTabs")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-scenario-scope]");
    if (!button) {
      return;
    }
    refresh(button.dataset.scenarioScope, null);
  });

  document.getElementById("scenarioList")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-scenario-select]");
    if (!button) {
      return;
    }
    refresh(card.dataset.scope || "ready", button.dataset.scenarioSelect);
  });

  document.getElementById("createScenarioButton")?.addEventListener("click", () => {
    const scenario = createUserScenario();
    refresh("user", scenario.id);
    stateApi.showToast(tr("Пользовательский сценарий сохранен.", "Custom scenario saved."));
  });

  document.getElementById("previewScenarioButton")?.addEventListener("click", () => {
    const selected = getScenarioById(card.dataset.selectedId);
    if (selected) {
      previewScenario(selected);
    }
  });
  document.getElementById("launchScenarioButton")?.addEventListener("click", () => {
    const selected = getScenarioById(card.dataset.selectedId);
    if (selected) {
      launchScenario(selected);
    }
  });
}

function bindSettingsPage() {
  const saveUiValue = (key, value, source = "settings", options = {}) => {
    const { toast = true } = options;
    stateApi.update((state) => {
      state.ui[key] = value;
      return state;
    }, source);
    if (toast) {
      stateApi.showToast(tr("Настройка сохранена.", "Setting saved."));
    }
  };

  [
    ["settingsThemeSelect", "theme"],
    ["settingsDensitySelect", "density"],
    ["settingsAccentSelect", "accent"],
    ["settingsUnitsSelect", "units"],
    ["settingsRefreshSelect", "dataRefresh"],
    ["settingsForecastHorizonSelect", "forecastHorizon"],
  ].forEach(([id, key]) => {
    document.getElementById(id)?.addEventListener("change", (event) => {
      saveUiValue(key, event.target.value, key);
    });
  });

  [
    ["settingsSidebarToggle", "sidebarCollapsed"],
    ["settingsReducedMotionToggle", "reducedMotion"],
    ["settingsSmoothingToggle", "chartSmoothing"],
    ["settingsUncertaintyToggle", "showUncertainty"],
    ["settingsTexturesToggle", "planetTextures"],
    ["settingsOrbitLinesToggle", "orbitRails"],
    ["settingsHighlightToggle", "highlightModules"],
  ].forEach(([id, key]) => {
    document.getElementById(id)?.addEventListener("change", (event) => {
      saveUiValue(key, event.target.checked, key);
      if (key === "sidebarCollapsed") {
        stateApi.setSidebarCollapsed(event.target.checked, false);
      }
    });
  });

  SIMULATOR_SETTINGS_RANGES.forEach((config) => {
    const slider = document.getElementById(config.inputId);
    const output = document.getElementById(config.outputId);
    if (!slider || !output) {
      return;
    }
    slider.addEventListener("input", (event) => {
      output.textContent = config.format(Number(event.target.value));
    });
    slider.addEventListener("change", (event) => {
      saveUiValue(config.key, Number(event.target.value), config.key, { toast: false });
    });
  });

  document.getElementById("settingsResetButton")?.addEventListener("click", () => {
    stateApi.update((state) => {
      state.ui = {
        ...state.ui,
        theme: "neon-dark",
        units: "metric",
        dataRefresh: "10s",
        density: "comfortable",
        accent: "magenta",
        forecastHorizon: "6h",
        chartSmoothing: true,
        showUncertainty: true,
        reducedMotion: false,
        planetTextures: true,
        orbitRails: true,
        highlightModules: true,
        sidebarCollapsed: false,
        planetScale: 1,
        atmosphereGlow: 0.85,
        cloudOpacity: 0.16,
        surfaceContrast: 1.45,
        nightLights: 0.22,
        sunAzimuthDeg: 38,
        sunElevationDeg: 34,
        specularBoost: 0.62,
        starfieldOpacity: 0.84,
        freeCameraSpeed: 132,
      };
      return state;
    }, "settings-reset");
    renderSettingsPage();
    bindSettingsPage();
    stateApi.showToast(tr("Интерфейсные настройки сброшены.", "Interface settings reset."));
  });
}

function toggleFullscreen(element) {
  if (!document.fullscreenElement) {
    element.requestFullscreen?.();
    return;
  }
  document.exitFullscreen?.();
}

function nudgeRange(id, delta) {
  const slider = document.getElementById(id);
  if (!slider) {
    return;
  }
  const nextValue = Math.max(Number(slider.min), Math.min(Number(slider.max), Number(slider.value) + delta));
  slider.value = `${nextValue}`;
  slider.dispatchEvent(new Event("input", { bubbles: true }));
}

function applyPendingScenarioToSimulator() {
  const url = new URL(window.location.href);
  const requestedPreset = url.searchParams.get("scenario");
  const pendingScenario = stateApi.read().pendingScenario;
  const preset = requestedPreset || pendingScenario?.preset;
  if (!preset) {
    return;
  }

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    const presetButton = document.querySelector(`[data-preset="${preset}"]`);
    const hostOptionsReady = document.querySelector("#hostBodyOptions [data-value]");
    if (presetButton && hostOptionsReady) {
      presetButton.click();
      if (pendingScenario?.altitudeKm) {
        const altitude = document.getElementById("altitudeKm");
        const inclination = document.getElementById("inclinationDeg");
        const timeScale = document.getElementById("timeScale");
        altitude.value = `${pendingScenario.altitudeKm}`;
        inclination.value = `${pendingScenario.inclinationDeg}`;
        timeScale.value = `${pendingScenario.timeScale}`;
        altitude.dispatchEvent(new Event("input", { bubbles: true }));
        inclination.dispatchEvent(new Event("input", { bubbles: true }));
        timeScale.dispatchEvent(new Event("input", { bubbles: true }));
      }
      stateApi.update((state) => {
        state.pendingScenario = null;
        state.activeScenarioId = pendingScenario?.id || preset;
        return state;
      }, "simulator-scenario");
      if (requestedPreset) {
        url.searchParams.delete("scenario");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
      stateApi.showToast(tr("Сценарий применен к симулятору.", "Scenario applied to the simulator."));
      window.clearInterval(timer);
      return;
    }
    if (attempts > 24) {
      window.clearInterval(timer);
    }
  }, 180);
}

function bindSimulatorPage() {
  const sceneCard = document.querySelector(".simulator-scene-card");
  document
    .querySelectorAll(".simulator-panel-stack--left, .simulator-panel-stack--right")
    .forEach((panel) => {
      panel.addEventListener(
        "wheel",
        (event) => {
          if (panel.scrollHeight <= panel.clientHeight) {
            return;
          }
          panel.scrollTop += event.deltaY;
          event.preventDefault();
        },
        { passive: false },
      );
    });
  document.querySelector('[data-scene-action="fullscreen"]')?.addEventListener("click", () => {
    if (sceneCard) {
      toggleFullscreen(sceneCard);
    }
  });
  document.querySelector('[data-scene-action="sidebar"]')?.addEventListener("click", () => {
    const collapsed = !document.body.classList.contains("template-sidebar-collapsed");
    stateApi.setSidebarCollapsed(collapsed);
  });

  const controls = document.querySelectorAll(".orientation-widget button");
  controls[0]?.addEventListener("click", () => nudgeRange("pitchDeg", 4));
  controls[1]?.addEventListener("click", () => nudgeRange("yawDeg", -6));
  controls[2]?.addEventListener("click", () => nudgeRange("yawDeg", 6));
  controls[3]?.addEventListener("click", () => nudgeRange("pitchDeg", -4));

  applyPendingScenarioToSimulator();
}

function preparePageMarkup() {
  prepareHomePage();
  prepareConstructorPage();
  prepareSimulatorPage();
  if (getCurrentPageKey() === "orbit") renderOrbitPage();
  if (getCurrentPageKey() === "system") renderSystemPage();
  if (getCurrentPageKey() === "data") renderDataPage();
  if (getCurrentPageKey() === "scenarios") renderScenariosPage();
  if (getCurrentPageKey() === "settings") renderSettingsPage();
}

function bindCurrentPage() {
  const page = getCurrentPageKey();
  if (page === "orbit") bindOrbitPage();
  if (page === "system") bindSystemPage();
  if (page === "data") bindDataPage();
  if (page === "scenarios") bindScenariosPage();
  if (page === "settings") bindSettingsPage();
  if (page === "simulator") bindSimulatorPage();
}

preparePageMarkup();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    bindTopbarActions();
    bindCurrentPage();
    window.lucide?.createIcons?.();
  });
} else {
  bindTopbarActions();
  bindCurrentPage();
  window.lucide?.createIcons?.();
}

window.addEventListener("app-language-change", () => {
  const page = getCurrentPageKey();
  if (["orbit", "system", "data", "scenarios", "settings"].includes(page)) {
    preparePageMarkup();
    bindCurrentPage();
    window.lucide?.createIcons?.();
  }
});
