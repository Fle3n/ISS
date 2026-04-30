import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


const BASE_WORLD_RADIUS = 42;
const STATION_COLLISION_RADIUS_WORLD = 34;
const ORBIT_SURFACE_CLEARANCE_WORLD = 8;
const MAX_RELAYS = 18;
const MISSION_START_UTC_MS = Date.UTC(2024, 4, 20, 0, 0, 0);
const TRANSPORT_STEP_SECONDS = 10 * 60;
const DOCK_RING_EXTENSION = 0.35;
const DOCK_RING_OVERLAP = DOCK_RING_EXTENSION * 2;
const BUILDER_STORAGE_KEY = "iss-constructor-state-v1";
const BASE_CORE_LENGTH = 11.5;
const BASE_LAB_LENGTH = 9.8;
const BASE_HAB_LENGTH = 8.5;
const BASE_NODE_RADIUS = 4.35;
const BASE_TRUSS_LENGTH = 25;
const BASE_SOLAR_OFFSET = 14.8;
const SOLAR_PANEL_HALF_DEPTH = 0.18;
const BASE_LAB_X = getDockedModuleCenter(BASE_CORE_LENGTH, BASE_LAB_LENGTH);
const BASE_HAB_X = -getDockedModuleCenter(BASE_CORE_LENGTH, BASE_HAB_LENGTH);
const SIDE_PORT_OFFSET = BASE_SOLAR_OFFSET + SOLAR_PANEL_HALF_DEPTH + DOCK_RING_EXTENSION;
const DIAGONAL_PORT_OFFSET = BASE_NODE_RADIUS + 1.9;
const PORTS = {
  forward: {
    dir: new THREE.Vector3(1, 0, 0),
    baseOffset: BASE_LAB_X + getModuleVisualHalf(BASE_LAB_LENGTH),
  },
  aft: {
    dir: new THREE.Vector3(-1, 0, 0),
    baseOffset: Math.abs(BASE_HAB_X) + getModuleVisualHalf(BASE_HAB_LENGTH),
  },
  zenith: { dir: new THREE.Vector3(0, 1, 0), baseOffset: BASE_NODE_RADIUS + DOCK_RING_EXTENSION },
  nadir: { dir: new THREE.Vector3(0, -1, 0), baseOffset: BASE_NODE_RADIUS + DOCK_RING_EXTENSION },
  starboard: { dir: new THREE.Vector3(0, 0, 1), baseOffset: SIDE_PORT_OFFSET },
  port: { dir: new THREE.Vector3(0, 0, -1), baseOffset: SIDE_PORT_OFFSET },
  forwardZenith: { dir: new THREE.Vector3(1, 1, 0), baseOffset: DIAGONAL_PORT_OFFSET },
  forwardNadir: { dir: new THREE.Vector3(1, -1, 0), baseOffset: DIAGONAL_PORT_OFFSET },
  aftZenith: { dir: new THREE.Vector3(-1, 1, 0), baseOffset: DIAGONAL_PORT_OFFSET },
  aftNadir: { dir: new THREE.Vector3(-1, -1, 0), baseOffset: DIAGONAL_PORT_OFFSET },
};

const PLANET_TEXTURES = {
  earth: "/static/textures/planets/earth_blue_marble_atmos_2048.jpg",
  moon: "/static/textures/planets/moon_lroc_color_2k.jpg",
  mars: "/static/textures/planets/mars_jpl_viking.jpg",
  venus: "/static/textures/planets/venus_jpl_magellan.jpg",
  jupiter: "/static/textures/planets/jupiter_jpl_voyager.jpg",
  saturn: "/static/textures/planets/saturn_jpl_atmosphere.jpg",
};

const TEXTURE_SOURCES = [
  {
    name: "Three.js Planet Texture - Earth Atmosphere",
    usage: "Blue Marble style Earth texture for the central planet",
    url: "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
  },
  {
    name: "JPL/Caltech Planetary Texture Maps",
    usage: "Planet texture maps for Venus, Mars, Jupiter, and Saturn",
    url: "https://space.jpl.nasa.gov/tmaps/",
  },
  {
    name: "NASA SVS CGI Moon Kit",
    usage: "LRO-derived Moon color map",
    url: "https://svs.gsfc.nasa.gov/4720/",
  },
];

const PLANET_TEXTURE_FILTERS = {
  earth: "contrast(150%) saturate(128%) brightness(90%)",
  moon: "contrast(132%) saturate(112%) brightness(92%)",
  mars: "contrast(145%) saturate(142%) brightness(92%)",
  venus: "contrast(138%) saturate(130%) brightness(92%)",
  jupiter: "contrast(150%) saturate(135%) brightness(90%)",
  saturn: "contrast(145%) saturate(128%) brightness(92%)",
};

function configureTexture(texture, maxAnisotropy = 8) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  if (texture.image) {
    texture.needsUpdate = true;
  }
}

function applyEnhancedImageToTexture(texture, image, bodyKey, maxAnisotropy) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const ctx = canvas.getContext("2d");
  ctx.filter = PLANET_TEXTURE_FILTERS[bodyKey] || "contrast(135%) saturate(125%)";
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  texture.image = canvas;
  if (texture.source) {
    texture.source.data = canvas;
  }
  configureTexture(texture, maxAnisotropy);
}

function enablePanelWheelScroll(panel) {
  if (!panel) {
    return;
  }

  panel.addEventListener(
    "wheel",
    (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") {
        return;
      }

      // When the cursor is over a slider, some browsers/devices change its value
      // instead of scrolling the panel, which feels like the panel can't scroll.
      if (!target.closest('input[type="range"]')) {
        return;
      }

      if (!event.deltaY) {
        return;
      }

      event.preventDefault();
      panel.scrollTop += event.deltaY;
    },
    { passive: false }
  );
}

function createAtmosphereShaderMaterial(color, intensity = 1) {
  return new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(color) },
      intensity: { value: intensity },
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float intensity;
      varying vec3 vNormal;
      void main() {
        float rim = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.15);
        gl_FragColor = vec4(glowColor, rim * 0.42 * intensity);
      }
    `,
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function createSpecularSweepMaterial(color, intensity = 0.62) {
  return new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(color) },
      lightDirection: { value: new THREE.Vector3(1, 0.35, 0.7).normalize() },
      intensity: { value: intensity },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform vec3 lightDirection;
      uniform float intensity;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(lightDirection);
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float dayMask = smoothstep(0.02, 0.22, dot(normal, lightDir));
        vec3 reflected = reflect(-lightDir, normal);
        float spec = pow(max(dot(reflected, viewDir), 0.0), 28.0) * dayMask;
        float horizon = pow(max(dot(normal, lightDir), 0.0), 4.0) * 0.22;
        float alpha = (spec * 0.58 + horizon) * intensity;
        gl_FragColor = vec4(glowColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function createNightLightsTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const clusters = [
    [0.57, 0.42, 110],
    [0.63, 0.45, 90],
    [0.48, 0.38, 78],
    [0.26, 0.39, 68],
    [0.30, 0.50, 54],
    [0.72, 0.55, 52],
  ];
  clusters.forEach(([cx, cy, count]) => {
    for (let i = 0; i < count; i += 1) {
      const x = (cx + (Math.random() - 0.5) * 0.12) * canvas.width;
      const y = (cy + (Math.random() - 0.5) * 0.08) * canvas.height;
      const radius = 0.7 + Math.random() * 1.8;
      const alpha = 0.18 + Math.random() * 0.55;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 5);
      gradient.addColorStop(0, `rgba(255, 229, 156, ${alpha})`);
      gradient.addColorStop(0.35, `rgba(56, 189, 248, ${alpha * 0.22})`);
      gradient.addColorStop(1, "rgba(255, 229, 156, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  const texture = new THREE.CanvasTexture(canvas);
  configureTexture(texture, 8);
  return texture;
}

const I18N = {
  ru: {
    kicker: "Этап 4 · 3D-прототип",
    title: "Цифровой двойник модульной орбитальной станции",
    subtitle:
      "Управляйте орбитой, модулями, стыковкой и межспутниковой связью в реальном времени.",
    simulatorHelpTitle: "Как пользоваться симулятором",
    simulatorHelpBody:
      "Слева меняются параметры орбиты, ориентации и состава станции. Справа запускается стыковка, настраивается сеть ретрансляторов и отображается телеметрия.",
    presetsHint: "Быстрые режимы настройки сцены",
    cameraReset: "Сбросить камеру",
    presetsTitle: "Сценарии",
    presetEngineering: "Инженерный анализ",
    presetEducation: "Обучение стыковке",
    presetPresentation: "Презентационное расширение",
    orbitTitle: "Орбита и планета",
    orbitHint: "Высота, наклонение и скорость",
    hostBody: "Центральное тело",
    altitude: "Высота орбиты, км",
    inclination: "Наклонение, °",
    timeScale: "Скорость времени",
    attitudeTitle: "Ориентация станции",
    attitudeHint: "Yaw / Pitch / Roll и солнечные панели",
    yaw: "Рыскание Y, °",
    pitch: "Тангаж X, °",
    roll: "Крен Z, °",
    solarSpread: "Угол солнечных панелей, °",
    moduleTitle: "Модули станции",
    moduleHint: "Включение и скрытие секций станции",
    moduleCore: "Базовый",
    moduleLab: "Лабораторный",
    moduleHab: "Жилой",
    modulePower: "Энергетический",
    moduleDock: "Узловой",
    moduleAntenna: "Связь",
    sceneLabel: "Симуляция",
    fpsLabel: "FPS",
    missionClock: "T+",
    dockingTitle: "Стыковка и расширение",
    dockingHint: "Выбор модуля, порта и скорости сближения",
    dockingMode: "Режим стыковки",
    dockingModeStatus: "Режим стыковки: нажмите на МКС",
    dockingModeEnabled: "Режим стыковки включён. Время симуляции остановлено.",
    dockingModeDisabled: "Режим стыковки выключен. Время симуляции возобновлено.",
    playbackPause: "Пауза",
    playbackResume: "Продолжить",
    playbackPaused: "Симуляция поставлена на паузу",
    playbackResumed: "Симуляция продолжена",
    playbackReset: "Время симуляции сброшено",
    playbackStepBack: "Шаг назад на 10 минут",
    playbackStepForward: "Шаг вперёд на 10 минут",
    moduleType: "Тип нового модуля",
    dockScience: "Научный модуль",
    dockHabitat: "Жилой модуль",
    dockCargo: "Грузовой модуль",
    dockPower: "Солнечная ферма",
    dockRelay: "Антенный модуль",
    dockNode: "Узловой модуль",
    dockAirlock: "Шлюзовой модуль",
    dockRadiator: "Радиаторный блок",
    dockPropulsion: "Двигательный модуль",
    dockCupola: "Обзорный купол",
    dockPort: "Узел стыковки",
    portForward: "Передний",
    portAft: "Задний",
    portZenith: "Зенит",
    portNadir: "Надир",
    portStarboard: "Правый борт",
    portLeft: "Левый борт",
    portForwardZenith: "Передний верхний",
    portForwardNadir: "Передний нижний",
    portAftZenith: "Задний верхний",
    portAftNadir: "Задний нижний",
    approachSpeed: "Скорость сближения",
    launchDocking: "Запустить стыковку",
    resetStation: "Сбросить станцию",
    commsTitle: "Межспутниковая связь",
    commsHint: "Ретрансляторы, дальность, мощность и помехи",
    relayCount: "Число спутников-ретрансляторов",
    linkRange: "Дальность радиолинии, км",
    antennaPower: "Мощность антенн, %",
    packetRate: "Пакетный поток, Мбит/с",
    interference: "Помехи / радиационная буря, %",
    showLinks: "Показывать радиолинии",
    showOrbitRails: "Показывать орбитальные траектории",
    telemetryTitle: "Телеметрия",
    telemetryHint: "Период, скорость, каналы связи и состояние стыковки",
    telemetryPeriod: "Период орбиты",
    telemetryVelocity: "Орбитальная скорость",
    telemetryLinks: "Активные радиолинии",
    telemetryThroughput: "Пропускная способность",
    telemetryModules: "Модулей в составе",
    telemetryDocking: "Состояние стыковки",
    logTitle: "Журнал событий",
    logHint: "Последние действия пользователя и станции",
    sourceTitle: "Открытые данные",
    sourceHint: "Источники справочных параметров и TLE-контекста",
    idle: "ОЖИДАНИЕ",
    issLive: "Live данные",
    issUnavailable: "Нет данных",
    freeCameraActive: "СВОБОДНАЯ КАМЕРА",
    freeCameraFollow: "FOLLOW",
    freeCameraLog: "Свободная камера: Shift + WASD/QE, drag для обзора",
    approach: "СБЛИЖЕНИЕ",
    capture: "ЗАХВАТ",
    locked: "СТЫКОВКА ЗАВЕРШЕНА",
    orbitReady: "Круговая орбита готова",
    aroundBody: (name) => `Орбита вокруг тела: ${name}`,
    presetApplied: (name) => `Применён сценарий: ${name}`,
    dockingStarted: (moduleType, port) =>
      `Запущена стыковка: ${moduleType} → ${port}`,
    dockingFinished: (moduleType, port) =>
      `Модуль интегрирован в станцию: ${moduleType} / ${port}`,
    stationReset: "Конфигурация станции сброшена к базовой архитектуре",
    constructorLoaded: (count) => `Загружена сборка из конструктора: ${count} мод.`,
    loadingError:
      "Не удалось загрузить 3D-прототип. Проверьте соединение с CDN Three.js.",
    sourceLabel: "Использование",
    liveMode: "Режим в реальном времени",
    visualization3d: "3D-визуализация",
    orbitParametersTitle: "Параметры орбиты",
    simulationTimeTitle: "Время симуляции",
    vectorControlTitle: "Управление ориентацией",
    freeCameraTitle: "Свободная камера",
    freeCameraHint: "Shift + drag + WASD / Q E",
    latitude: "Широта",
    longitude: "Долгота",
    altitudeShort: "Высота",
    velocityShort: "Скорость",
    missionHealthTitle: "Инженерная оценка",
    missionHealthHint: "Сводная устойчивость конфигурации",
    riskIndexTitle: "Риск",
    engineerPowerLabel: "Энергия",
    engineerThermalLabel: "Тепло",
    engineerCommsLabel: "Связь",
    engineerDockingLabel: "Стыковка",
    engineerRecommendationIdle: "Живая инженерная оценка появится после инициализации сцены.",
    engineerNominal: "Штатный",
    engineerPower: "Энергосбережение",
    engineerComms: "Приоритет связи",
    visualTuningTitle: "Визуальный контур",
    lightingRigTitle: "Свет и камера",
    planetScaleLabel: "Масштаб планеты",
    atmosphereGlowLabel: "Свечение атмосферы",
    cloudOpacityLabel: "Облачный слой",
    surfaceContrastLabel: "Контраст поверхности",
    nightLightsLabel: "Ночные огни",
    sunAzimuthLabel: "Азимут Солнца",
    sunElevationLabel: "Высота Солнца",
    specularBoostLabel: "Зеркальный отклик",
    starfieldOpacityLabel: "Плотность звёздного поля",
    freeCameraSpeedLabel: "Скорость свободной камеры",
    sceneSettingsMovedTitle: "Настройки сцены",
    sceneSettingsMovedBody: "Параметры планеты, света, орбитальных линий и скорости свободной камеры перенесены в настройки проекта.",
    orbitRailsMovedHint: "Орбитальные траектории теперь переключаются в настройках интерфейса.",
    openSettings: "Открыть настройки",
    fullscreen: "Полный экран",
    toggleSidebar: "Свернуть боковую панель",
    transportReset: "К началу сценария",
    transportStepBack: "Шаг назад",
    transportStepForward: "Шаг вперёд",
    rollShort: "Крен",
    pitchShort: "Тангаж",
    yawShort: "Рыскание",
    orientUp: "Вверх",
    orientLeft: "Влево",
    orientRight: "Вправо",
    orientDown: "Вниз",
  },
  en: {
    kicker: "Stage 4 · 3D Prototype",
    title: "Digital Twin of a Modular Orbital Station",
    subtitle:
      "Control orbit, modules, docking, and inter-satellite communication in realtime.",
    simulatorHelpTitle: "How to use the simulator",
    simulatorHelpBody:
      "Left-side panels control orbit, attitude, and station composition. Right-side panels launch docking, tune relay networking, and display telemetry.",
    presetsHint: "Fast scene configuration presets",
    cameraReset: "Reset camera",
    presetsTitle: "Scenarios",
    presetEngineering: "Engineering analysis",
    presetEducation: "Docking training",
    presetPresentation: "Presentation expansion",
    orbitTitle: "Orbit and planet",
    orbitHint: "Altitude, inclination, and time scale",
    hostBody: "Central body",
    altitude: "Orbit altitude, km",
    inclination: "Inclination, °",
    timeScale: "Time scale",
    attitudeTitle: "Station attitude",
    attitudeHint: "Yaw / Pitch / Roll and solar panel angle",
    yaw: "Yaw Y, °",
    pitch: "Pitch X, °",
    roll: "Roll Z, °",
    solarSpread: "Solar panel angle, °",
    moduleTitle: "Station modules",
    moduleHint: "Enable or hide station sections",
    moduleCore: "Core",
    moduleLab: "Laboratory",
    moduleHab: "Habitat",
    modulePower: "Power",
    moduleDock: "Node",
    moduleAntenna: "Comms",
    sceneLabel: "Simulation",
    fpsLabel: "FPS",
    missionClock: "T+",
    dockingTitle: "Docking and expansion",
    dockingHint: "Choose module, port, and approach speed",
    dockingMode: "Docking mode",
    dockingModeStatus: "Docking mode: click the ISS",
    dockingModeEnabled: "Docking mode enabled. Simulation time is paused.",
    dockingModeDisabled: "Docking mode disabled. Simulation time resumed.",
    playbackPause: "Pause",
    playbackResume: "Resume",
    playbackPaused: "Simulation paused",
    playbackResumed: "Simulation resumed",
    playbackReset: "Simulation time reset",
    playbackStepBack: "Stepped back 10 minutes",
    playbackStepForward: "Stepped forward 10 minutes",
    moduleType: "New module type",
    dockScience: "Science module",
    dockHabitat: "Habitation module",
    dockCargo: "Cargo module",
    dockPower: "Solar wing",
    dockRelay: "Antenna module",
    dockNode: "Docking node",
    dockAirlock: "Airlock module",
    dockRadiator: "Radiator block",
    dockPropulsion: "Propulsion module",
    dockCupola: "Observation cupola",
    dockPort: "Docking port",
    portForward: "Forward",
    portAft: "Aft",
    portZenith: "Zenith",
    portNadir: "Nadir",
    portStarboard: "Starboard",
    portLeft: "Port",
    portForwardZenith: "Forward upper",
    portForwardNadir: "Forward lower",
    portAftZenith: "Aft upper",
    portAftNadir: "Aft lower",
    approachSpeed: "Approach speed",
    launchDocking: "Launch docking",
    resetStation: "Reset station",
    commsTitle: "Inter-satellite communication",
    commsHint: "Relays, range, antenna power, and interference",
    relayCount: "Relay satellite count",
    linkRange: "Radio link range, km",
    antennaPower: "Antenna power, %",
    packetRate: "Packet flow, Mbps",
    interference: "Interference / radiation storm, %",
    showLinks: "Show RF links",
    showOrbitRails: "Show orbital trajectories",
    telemetryTitle: "Telemetry",
    telemetryHint: "Period, velocity, RF links, and docking state",
    telemetryPeriod: "Orbital period",
    telemetryVelocity: "Orbital velocity",
    telemetryLinks: "Active RF links",
    telemetryThroughput: "Throughput",
    telemetryModules: "Modules assembled",
    telemetryDocking: "Docking status",
    logTitle: "Event log",
    logHint: "Latest user and station events",
    sourceTitle: "Open data",
    sourceHint: "Reference datasets and TLE context",
    idle: "IDLE",
    issLive: "Live data",
    issUnavailable: "No data",
    freeCameraActive: "FREE CAMERA",
    freeCameraFollow: "FOLLOW",
    freeCameraLog: "Free camera: Shift + WASD/QE, drag to look",
    approach: "APPROACH",
    capture: "SOFT CAPTURE",
    locked: "DOCKED",
    orbitReady: "Circular orbit simulation ready",
    aroundBody: (name) => `Orbiting host body: ${name}`,
    presetApplied: (name) => `Scenario applied: ${name}`,
    dockingStarted: (moduleType, port) =>
      `Docking sequence started: ${moduleType} → ${port}`,
    dockingFinished: (moduleType, port) =>
      `Module integrated into station: ${moduleType} / ${port}`,
    stationReset: "Station configuration reset to baseline architecture",
    constructorLoaded: (count) => `Builder configuration loaded: ${count} modules`,
    loadingError:
      "Could not load the 3D prototype. Check the Three.js CDN connection.",
    sourceLabel: "Usage",
    liveMode: "Realtime mode",
    visualization3d: "3D visualization",
    orbitParametersTitle: "Orbit parameters",
    simulationTimeTitle: "Simulation time",
    vectorControlTitle: "Attitude control",
    freeCameraTitle: "Free camera",
    freeCameraHint: "Shift + drag + WASD / Q E",
    latitude: "Latitude",
    longitude: "Longitude",
    altitudeShort: "Altitude",
    velocityShort: "Velocity",
    missionHealthTitle: "Engineering assessment",
    missionHealthHint: "Composite stability envelope",
    riskIndexTitle: "Risk",
    engineerPowerLabel: "Power",
    engineerThermalLabel: "Thermal",
    engineerCommsLabel: "Comms",
    engineerDockingLabel: "Docking",
    engineerRecommendationIdle: "Live engineering assessment will appear after scene initialization.",
    engineerNominal: "Nominal",
    engineerPower: "Power save",
    engineerComms: "Comms focus",
    visualTuningTitle: "Visual tuning",
    lightingRigTitle: "Lighting and camera",
    planetScaleLabel: "Planet scale",
    atmosphereGlowLabel: "Atmosphere glow",
    cloudOpacityLabel: "Cloud layer",
    surfaceContrastLabel: "Surface contrast",
    nightLightsLabel: "Night lights",
    sunAzimuthLabel: "Sun azimuth",
    sunElevationLabel: "Sun elevation",
    specularBoostLabel: "Specular boost",
    starfieldOpacityLabel: "Starfield density",
    freeCameraSpeedLabel: "Free camera speed",
    sceneSettingsMovedTitle: "Scene settings",
    sceneSettingsMovedBody: "Planet render, lighting, orbit rails, and free camera speed now live in project settings.",
    orbitRailsMovedHint: "Orbital trajectories are now controlled from interface settings.",
    openSettings: "Open settings",
    fullscreen: "Fullscreen",
    toggleSidebar: "Collapse sidebar",
    transportReset: "Reset to scenario start",
    transportStepBack: "Step backward",
    transportStepForward: "Step forward",
    rollShort: "Roll",
    pitchShort: "Pitch",
    yawShort: "Yaw",
    orientUp: "Up",
    orientLeft: "Left",
    orientRight: "Right",
    orientDown: "Down",
  },
};

const MODULE_I18N_KEY = {
  science: "dockScience",
  habitat: "dockHabitat",
  cargo: "dockCargo",
  power: "dockPower",
  relay: "dockRelay",
  node: "dockNode",
  airlock: "dockAirlock",
  radiator: "dockRadiator",
  propulsion: "dockPropulsion",
  cupola: "dockCupola",
};

const BUILDER_TO_SIM_MODULE = {
  solar: "power",
  science: "science",
  habitat: "habitat",
  cargo: "cargo",
  antenna: "relay",
  node: "node",
  airlock: "airlock",
  radiator: "radiator",
  propulsion: "propulsion",
  cupola: "cupola",
};

const CLICK_DOCKING_MODULE_SEQUENCE = [
  "science",
  "habitat",
  "cargo",
  "power",
  "relay",
  "node",
  "airlock",
  "radiator",
  "propulsion",
  "cupola",
];

const PORT_I18N_KEY = {
  forward: "portForward",
  aft: "portAft",
  zenith: "portZenith",
  nadir: "portNadir",
  starboard: "portStarboard",
  port: "portLeft",
  forwardZenith: "portForwardZenith",
  forwardNadir: "portForwardNadir",
  aftZenith: "portAftZenith",
  aftNadir: "portAftNadir",
};

const $ = (id) => document.getElementById(id);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function formatClock(seconds) {
  const isNegative = seconds < 0;
  const safeSeconds = Math.floor(Math.abs(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const sec = safeSeconds % 60;
  const sign = isNegative ? "-" : "";
  if (hours > 0) {
    return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${sign}${String(minutes).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function getMissionUtcDate(seconds) {
  return new Date(MISSION_START_UTC_MS + Math.floor(Number(seconds) || 0) * 1000);
}

function formatUtcDate(date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function formatUtcTime(date) {
  return [
    String(date.getUTCHours()).padStart(2, "0"),
    String(date.getUTCMinutes()).padStart(2, "0"),
    String(date.getUTCSeconds()).padStart(2, "0"),
  ].join(":");
}

function parseHexColor(color) {
  const clean = color.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function mixChannel(a, b, t) {
  return Math.round(a + (b - a) * clamp(t, 0, 1));
}

function mixColor(colorA, colorB, t) {
  const a = parseHexColor(colorA);
  const b = parseHexColor(colorB);
  return `rgb(${mixChannel(a.r, b.r, t)}, ${mixChannel(a.g, b.g, t)}, ${mixChannel(a.b, b.b, t)})`;
}

function createPlanetTexture(bodyKey, body) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const rand = seededRandom(
    [...bodyKey].reduce((sum, char) => sum + char.charCodeAt(0), 0) + 73,
  );

  const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGradient.addColorStop(0, body.colorA);
  bgGradient.addColorStop(1, body.colorB);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (bodyKey === "earth") {
    ctx.fillStyle = "#163ea8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 180; i += 1) {
      const x = rand() * canvas.width;
      const y = rand() * canvas.height;
      const w = 40 + rand() * 220;
      const h = 18 + rand() * 120;
      ctx.fillStyle = mixColor("#14532d", "#facc15", rand() * 0.6);
      ctx.beginPath();
      ctx.ellipse(x, y, w, h, rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(0, 0, canvas.width, 34);
    ctx.fillRect(0, canvas.height - 34, canvas.width, 34);
  } else if (bodyKey === "jupiter" || bodyKey === "saturn" || bodyKey === "venus") {
    for (let y = 0; y < canvas.height; y += 16) {
      const tone = 0.25 + 0.65 * rand();
      ctx.fillStyle = mixColor(body.colorA, body.colorB, tone);
      const waveHeight = 10 + rand() * 28;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= canvas.width; x += 64) {
        ctx.lineTo(x, y + Math.sin(x * 0.012 + rand() * 5) * waveHeight);
      }
      ctx.lineTo(canvas.width, y + 18);
      ctx.lineTo(0, y + 18);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    for (let i = 0; i < 520; i += 1) {
      const x = rand() * canvas.width;
      const y = rand() * canvas.height;
      const r = 3 + rand() * 24;
      ctx.fillStyle = mixColor(body.colorA, body.colorB, rand());
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      if (rand() > 0.76) {
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function createCloudTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const rand = seededRandom(2087);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 260; i += 1) {
    const x = rand() * canvas.width;
    const y = rand() * canvas.height;
    const w = 30 + rand() * 170;
    const h = 18 + rand() * 70;
    const alpha = 0.08 + rand() * 0.2;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createSpriteLabel(text, color = "#f8fafc") {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(2,6,23,0.5)";
  ctx.strokeStyle = "rgba(103,232,249,0.45)";
  ctx.lineWidth = 4;
  const radius = 24;
  ctx.beginPath();
  ctx.roundRect(12, 24, 360, 80, radius);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = '28px "Times New Roman", Times, serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    }),
  );
  sprite.scale.set(28, 9.3, 1);
  return sprite;
}

function createStars(count = 9000) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();
  const rand = seededRandom(913);

  for (let i = 0; i < count; i += 1) {
    const radius = 780 + rand() * 920;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    color.setHSL(0.54 + rand() * 0.2, 0.3 + rand() * 0.35, 0.7 + rand() * 0.25);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 2.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
}

function createModuleCore(length, radius, bodyColor, accentColor) {
  const group = new THREE.Group();
  const shellMaterial = new THREE.MeshStandardMaterial({
    color: bodyColor,
    metalness: 0.7,
    roughness: 0.28,
    emissive: new THREE.Color(accentColor).multiplyScalar(0.14),
  });
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, length, 32),
    shellMaterial,
  );
  body.rotation.z = Math.PI / 2;
  group.add(body);

  const ringMaterial = new THREE.MeshStandardMaterial({
    color: accentColor,
    metalness: 0.85,
    roughness: 0.22,
    emissive: new THREE.Color(accentColor).multiplyScalar(0.3),
  });

  [-length * 0.32, 0, length * 0.32].forEach((xPos) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius + 0.18, 0.18, 14, 32),
      ringMaterial,
    );
    ring.rotation.y = Math.PI / 2;
    ring.position.x = xPos;
    group.add(ring);
  });

  const dockRingA = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.82, radius * 0.82, 0.7, 32),
    ringMaterial,
  );
  dockRingA.rotation.z = Math.PI / 2;
  dockRingA.position.x = length / 2;
  const dockRingB = dockRingA.clone();
  dockRingB.position.x = -length / 2;
  group.add(dockRingA, dockRingB);

  group.userData.length = length;
  return group;
}

function createBoxModuleCore(length, width, height, bodyColor, accentColor) {
  const group = new THREE.Group();
  const shellMaterial = new THREE.MeshStandardMaterial({
    color: bodyColor,
    metalness: 0.62,
    roughness: 0.34,
    emissive: new THREE.Color(accentColor).multiplyScalar(0.1),
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: accentColor,
    metalness: 0.82,
    roughness: 0.22,
    emissive: new THREE.Color(accentColor).multiplyScalar(0.24),
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(length, height, width), shellMaterial);
  group.add(body);

  [-length * 0.34, 0, length * 0.34].forEach((xPos) => {
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.32, height + 0.14, width + 0.14), accentMaterial);
    band.position.x = xPos;
    group.add(band);
  });

  [-length * 0.5, length * 0.5].forEach((xPos) => {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(height * 0.34, height * 0.34, 0.58, 28), accentMaterial);
    cap.rotation.z = Math.PI / 2;
    cap.position.x = xPos;
    group.add(cap);
  });

  group.userData.length = length;
  return group;
}

function createSphericalModuleCore(length, radius, bodyColor, accentColor) {
  const group = new THREE.Group();
  const shellMaterial = new THREE.MeshStandardMaterial({
    color: bodyColor,
    metalness: 0.7,
    roughness: 0.26,
    emissive: new THREE.Color(accentColor).multiplyScalar(0.14),
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: accentColor,
    metalness: 0.86,
    roughness: 0.2,
    emissive: new THREE.Color(accentColor).multiplyScalar(0.28),
  });
  const body = new THREE.Mesh(new THREE.SphereGeometry(radius, 36, 28), shellMaterial);
  const belt = new THREE.Mesh(new THREE.TorusGeometry(radius + 0.12, 0.14, 14, 42), accentMaterial);
  belt.rotation.y = Math.PI / 2;
  group.add(body, belt);

  [-length * 0.5, length * 0.5].forEach((xPos) => {
    const dock = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.34, radius * 0.34, 0.76, 28), accentMaterial);
    dock.rotation.z = Math.PI / 2;
    dock.position.x = xPos;
    group.add(dock);
  });

  group.userData.length = length;
  return group;
}

function createTrussModuleCore(length, bodyColor, accentColor) {
  const group = new THREE.Group();
  const shellMaterial = new THREE.MeshStandardMaterial({
    color: bodyColor,
    metalness: 0.72,
    roughness: 0.3,
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: accentColor,
    metalness: 0.78,
    roughness: 0.24,
    emissive: new THREE.Color(accentColor).multiplyScalar(0.18),
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(length, 0.82, 0.82), shellMaterial);
  group.add(beam);

  for (let i = -2; i <= 2; i += 1) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.15, 2.15), accentMaterial);
    rib.position.x = (length / 4) * i;
    group.add(rib);
  }

  [-length * 0.5, length * 0.5].forEach((xPos) => {
    const dock = new THREE.Mesh(new THREE.BoxGeometry(0.58, 1.42, 1.42), accentMaterial);
    dock.position.x = xPos;
    group.add(dock);
  });

  group.userData.length = length;
  return group;
}

function createSolarPanels(span = 14, height = 6, color = 0x2563eb) {
  const group = new THREE.Group();
  const panelMaterial = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.5,
    roughness: 0.38,
    emissive: 0x0f172a,
  });
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xdbe4ea,
    metalness: 0.78,
    roughness: 0.34,
  });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(span, height, 0.32), panelMaterial);
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(span + 0.45, height + 0.45, 0.15),
    frameMaterial,
  );
  frame.position.z = -0.1;
  group.add(panel, frame);

  for (let i = -2; i <= 2; i += 1) {
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, height + 0.4, 0.35),
      frameMaterial,
    );
    rib.position.x = (span / 4) * i;
    group.add(rib);
  }

  return group;
}

function createDish(radius = 2.8) {
  const group = new THREE.Group();
  const dishMaterial = new THREE.MeshStandardMaterial({
    color: 0xe5e7eb,
    metalness: 0.88,
    roughness: 0.22,
    side: THREE.DoubleSide,
  });
  const dish = new THREE.Mesh(
    new THREE.ConeGeometry(radius, radius * 0.48, 32, 1, true),
    dishMaterial,
  );
  dish.rotation.z = Math.PI / 2;
  group.add(dish);

  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, radius * 1.5, 14),
    new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.7,
      roughness: 0.3,
    }),
  );
  mast.position.x = -radius * 0.5;
  mast.rotation.z = Math.PI / 2;
  group.add(mast);

  return group;
}

function createDockableModule(type) {
  const moduleType = BUILDER_TO_SIM_MODULE[type] || type;
  const configs = {
    science: { length: 12, radius: 2.5, body: 0x99f6e4, accent: 0x22d3ee },
    habitat: { length: 10.5, radius: 3.15, body: 0xf8fafc, accent: 0xfbbf24 },
    cargo: { length: 9.2, radius: 2.35, body: 0xd6d3d1, accent: 0xfb7185 },
    power: { length: 8.5, radius: 1.8, body: 0xb0bec5, accent: 0x60a5fa },
    relay: { length: 7.8, radius: 1.9, body: 0xe2e8f0, accent: 0x67e8f9 },
    node: { length: 6.6, radius: 2.75, body: 0xdbeafe, accent: 0xa78bfa },
    airlock: { length: 7.2, radius: 2.05, body: 0xe5e7eb, accent: 0xf97316 },
    radiator: { length: 8.4, radius: 1.65, body: 0xcbd5e1, accent: 0xf43f5e },
    propulsion: { length: 8.8, radius: 2.2, body: 0xc7d2fe, accent: 0x818cf8 },
    cupola: { length: 6.8, radius: 2.15, body: 0xe0f2fe, accent: 0x38bdf8 },
  };
  const cfg = configs[moduleType] || configs.science;
  let group;
  if (moduleType === "cargo") {
    group = createBoxModuleCore(cfg.length, cfg.radius * 2.05, cfg.radius * 1.7, cfg.body, cfg.accent);
  } else if (moduleType === "node") {
    group = createSphericalModuleCore(cfg.length, cfg.radius, cfg.body, cfg.accent);
  } else if (moduleType === "radiator") {
    group = createTrussModuleCore(cfg.length, cfg.body, cfg.accent);
  } else {
    group = createModuleCore(cfg.length, cfg.radius, cfg.body, cfg.accent);
  }
  group.userData.moduleType = moduleType;
  group.userData.solarMounts = [];

  if (moduleType === "power") {
    const leftPanel = new THREE.Group();
    const rightPanel = new THREE.Group();
    leftPanel.position.set(0, 0, 9.2);
    rightPanel.position.set(0, 0, -9.2);
    leftPanel.add(createSolarPanels(14, 5.2, 0x1d4ed8));
    rightPanel.add(createSolarPanels(14, 5.2, 0x1d4ed8));
    group.userData.solarMounts.push(leftPanel, rightPanel);
    group.add(leftPanel, rightPanel);
  }

  if (moduleType === "relay") {
    const dishTop = createDish(2.2);
    dishTop.position.set(cfg.length * 0.15, cfg.radius + 2.5, 0);
    group.add(dishTop);
  }

  if (moduleType === "habitat") {
    const observation = new THREE.Mesh(
      new THREE.SphereGeometry(1.35, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.5,
        roughness: 0.18,
        metalness: 0.75,
      }),
    );
    observation.position.set(1.2, cfg.radius + 0.7, 0);
    group.add(observation);
  }

  if (moduleType === "node") {
    const sidePortMaterial = new THREE.MeshStandardMaterial({
      color: 0xc4b5fd,
      metalness: 0.86,
      roughness: 0.22,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.22,
    });
    const sidePorts = [
      { position: [0, cfg.radius + 0.55, 0], rotation: [0, 0, 0] },
      { position: [0, -cfg.radius - 0.55, 0], rotation: [0, 0, 0] },
      { position: [0, 0, cfg.radius + 0.55], rotation: [Math.PI / 2, 0, 0] },
      { position: [0, 0, -cfg.radius - 0.55], rotation: [Math.PI / 2, 0, 0] },
    ].map(({ position, rotation }) => {
      const port = new THREE.Mesh(
        new THREE.CylinderGeometry(0.82, 0.82, 1.15, 24),
        sidePortMaterial,
      );
      port.position.set(...position);
      port.rotation.set(...rotation);
      return port;
    });
    group.add(...sidePorts);
  }

  if (moduleType === "airlock") {
    const hatchMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.82,
      roughness: 0.22,
      emissive: 0xf97316,
      emissiveIntensity: 0.32,
    });
    const hatch = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.22, 28), hatchMaterial);
    hatch.rotation.z = Math.PI / 2;
    hatch.position.x = cfg.length * 0.52;
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.78,
      roughness: 0.28,
    });
    const rails = [-0.92, 0.92].map((zPos) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(cfg.length * 0.66, 0.12, 0.12), handleMaterial);
      rail.position.set(0, cfg.radius + 0.22, zPos);
      return rail;
    });
    group.add(hatch, ...rails);
  }

  if (moduleType === "radiator") {
    const leftRadiator = new THREE.Group();
    const rightRadiator = new THREE.Group();
    leftRadiator.position.z = 5.8;
    rightRadiator.position.z = -5.8;
    leftRadiator.add(createSolarPanels(10.5, 4.4, 0xbe123c));
    rightRadiator.add(createSolarPanels(10.5, 4.4, 0xbe123c));
    group.add(leftRadiator, rightRadiator);
  }

  if (moduleType === "propulsion") {
    const nozzleMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.82,
      roughness: 0.2,
      emissive: 0x312e81,
      emissiveIntensity: 0.26,
    });
    const nozzles = [
      [0, -0.95],
      [0.85, 0.55],
      [-0.85, 0.55],
    ].map(([yPos, zPos]) => {
      const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.45, 28), nozzleMaterial);
      nozzle.rotation.z = Math.PI / 2;
      nozzle.position.set(-cfg.length * 0.5 - 0.42, yPos, zPos);
      return nozzle;
    });
    const tankMaterial = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      metalness: 0.65,
      roughness: 0.28,
      emissive: 0x312e81,
      emissiveIntensity: 0.2,
    });
    const tanks = [-1.45, 1.45].map((zPos) => {
      const tank = new THREE.Mesh(new THREE.SphereGeometry(0.72, 20, 20), tankMaterial);
      tank.position.set(-1.45, cfg.radius + 0.1, zPos);
      return tank;
    });
    group.add(...nozzles, ...tanks);
  }

  if (moduleType === "cupola") {
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.62,
      roughness: 0.12,
      metalness: 0.78,
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.55, 28, 18), glassMaterial);
    dome.scale.y = 0.62;
    dome.position.set(0.75, cfg.radius + 0.72, 0);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(1.66, 0.12, 12, 32),
      new THREE.MeshStandardMaterial({
        color: 0x67e8f9,
        metalness: 0.86,
        roughness: 0.2,
        emissive: 0x0e7490,
        emissiveIntensity: 0.24,
      }),
    );
    rim.position.copy(dome.position);
    rim.rotation.x = Math.PI / 2;
    group.add(dome, rim);
  }

  return group;
}

function createRelaySatellite(index) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.6, 1.6),
    new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      metalness: 0.8,
      roughness: 0.28,
      emissive: 0x082f49,
    }),
  );
  const leftPanel = createSolarPanels(4.8, 1.4, index % 2 ? 0x1d4ed8 : 0x0e7490);
  const rightPanel = createSolarPanels(4.8, 1.4, index % 2 ? 0x1d4ed8 : 0x0e7490);
  leftPanel.position.z = 3.3;
  rightPanel.position.z = -3.3;
  const dish = createDish(1.2);
  dish.position.set(1.4, 0.7, 0);
  group.add(body, leftPanel, rightPanel, dish);
  group.userData = {
    phaseSeed: index * 0.79,
    radiusScale: 1.11 + (index % 4) * 0.045,
    planeTilt: -0.45 + (index % 5) * 0.22,
    speedScale: 0.78 + (index % 6) * 0.05,
  };
  return group;
}

function createOrbitRing(radius, color = 0x38bdf8, opacity = 0.45) {
  const points = [];
  for (let i = 0; i <= 256; i += 1) {
    const t = (i / 256) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
    }),
  );
}

function lineBlockedByPlanet(start, end, radius) {
  const direction = end.clone().sub(start);
  const a = direction.dot(direction);
  const b = 2 * start.dot(direction);
  const c = start.dot(start) - radius * radius;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) {
    return false;
  }
  const sqrtDisc = Math.sqrt(discriminant);
  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);
  return (t1 > 0 && t1 < 1) || (t2 > 0 && t2 < 1);
}

function disposeObjectTree(root) {
  root.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose?.();
    }
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose?.());
      } else {
        child.material.dispose?.();
      }
    }
  });
}

function getModuleVisualHalf(length) {
  return length * 0.5 + DOCK_RING_EXTENSION;
}

function getDockedModuleCenter(previousLength, nextLength) {
  return getModuleVisualHalf(previousLength) + getModuleVisualHalf(nextLength) - DOCK_RING_OVERLAP;
}

function getModuleChainStep(length) {
  return length + DOCK_RING_EXTENSION * 2 - DOCK_RING_OVERLAP;
}

function readBuilderConfiguration() {
  try {
    const raw = window.localStorage.getItem(BUILDER_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.modules)) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn("Could not read ISS constructor configuration", error);
    return null;
  }
}

class SpaceTwinApp {
  constructor(profile) {
    this.profile = profile;
    this.lang = window.appLanguage?.get?.() || "ru";
    this.mount = $("sceneMount");
    this.textureCache = new Map();
    this.textureLoader = new THREE.TextureLoader();
    this.dynamicModules = [];
    this.extraSolarMounts = [];
    this.portExtension = {};
    this.relays = [];
    this.linkLines = [];
    this.eventMessages = [];
    this.missionElapsedSec = 0;
    this.lastFpsSample = performance.now();
    this.framesSinceSample = 0;
    this.fpsValue = 60;
    this.activeDocking = null;
    this.lockedHoldSec = 0;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.scenePointerDown = null;
    this.lastIssTelemetry = null;
    this.issTelemetryTimer = null;
    this.preferences = window.issDashboardState?.read?.().ui || {};
    const preferenceNumber = (key, fallback) => {
      const value = Number(this.preferences?.[key]);
      return Number.isFinite(value) ? value : fallback;
    };

    this.sim = {
      hostBody: profile.defaultHost,
      altitudeKm: profile.stationPresets.engineering.altitudeKm,
      inclinationDeg: profile.stationPresets.engineering.inclinationDeg,
      timeScale: profile.stationPresets.engineering.timeScale,
      isPlaying: true,
      planetScale: preferenceNumber("planetScale", 1),
      atmosphereGlow: preferenceNumber("atmosphereGlow", 0.85),
      cloudOpacity: preferenceNumber("cloudOpacity", 0.16),
      surfaceContrast: preferenceNumber("surfaceContrast", 1.45),
      nightLights: preferenceNumber("nightLights", 0.22),
      sunAzimuthDeg: preferenceNumber("sunAzimuthDeg", 38),
      sunElevationDeg: preferenceNumber("sunElevationDeg", 34),
      specularBoost: preferenceNumber("specularBoost", 0.62),
      starfieldOpacity: preferenceNumber("starfieldOpacity", 0.84),
      yawDeg: 0,
      pitchDeg: 0,
      rollDeg: 0,
      solarSpreadDeg: 28,
      relayCount: profile.stationPresets.engineering.relayCount,
      linkRangeKm: profile.stationPresets.engineering.linkRangeKm,
      antennaPowerPct: 84,
      packetRateMbps: profile.stationPresets.engineering.packetRateMbps,
      interferencePct: 12,
      approachSpeed: 1.4,
      showLinks: true,
      showOrbitRails: this.preferences.orbitRails !== false,
      dockingState: "idle",
      dockingMode: false,
      activeLinks: 0,
      throughputMbps: 0,
      moduleCount: 6,
    };
    this.freeCamera = {
      active: false,
      pointerId: null,
      lastX: 0,
      lastY: 0,
      keys: new Set(),
      speed: preferenceNumber("freeCameraSpeed", 132),
      lookSensitivity: 0.0024,
    };

    Object.keys(PORTS).forEach((key) => {
      this.portExtension[key] = 0;
    });

    this.ui = this.collectUi();
    this.buildScene();
    this.buildStation();
    this.loadBuilderConfiguration();
    this.renderHostOptions();
    this.renderSourceList();
    this.bindUi();
    enablePanelWheelScroll(document.querySelector(".simulator-panel-stack--right"));
    enablePanelWheelScroll(document.querySelector(".simulator-panel-stack--left"));
    this.applyDashboardPreferences(this.preferences, false);
    this.applyLanguage();
    this.applyPlanetBody();
    this.updateModuleVisibility();
    this.updateStationAttitude();
    this.updateSolarPanels();
    this.rebuildRelays();
    this.resize();
    this.resetCamera();
    this.logEvent(I18N[this.lang].orbitReady);
    this.fetchIssTelemetry();
    this.issTelemetryTimer = window.setInterval(() => this.fetchIssTelemetry(), 10000);
    this.syncDashboardState("simulator-init");

    window.addEventListener("resize", () => this.resize());
    window.addEventListener("iss-dashboard-state-change", (event) => {
      this.applyDashboardPreferences(event.detail?.state?.ui || {}, true);
    });
    this.renderer.setAnimationLoop(() => this.animate());
  }

  applyDashboardPreferences(nextPreferences = {}, sync = true) {
    const previousTextureMode = this.preferences?.planetTextures !== false;
    this.preferences = {
      ...this.preferences,
      ...nextPreferences,
    };

    const numericPreference = (key, fallback) => {
      const value = Number(this.preferences?.[key]);
      return Number.isFinite(value) ? value : fallback;
    };

    const showOrbitRails = this.preferences.orbitRails !== false;
    this.sim.showOrbitRails = showOrbitRails;
    if (this.ui?.showOrbitRails) {
      this.ui.showOrbitRails.checked = showOrbitRails;
    }
    if (this.orbitGuide) {
      this.orbitGuide.visible = showOrbitRails;
    }
    if (this.relayOrbitShell) {
      this.relayOrbitShell.visible = showOrbitRails;
    }
    const nextTextureMode = this.preferences.planetTextures !== false;
    let needsPlanetBodyRefresh = sync && previousTextureMode !== nextTextureMode && this.hostShell;
    let needsPlanetVisualRefresh = false;
    let needsLightingRefresh = false;
    let needsOrbitRefresh = false;

    const nextPlanetScale = numericPreference("planetScale", 1);
    if (this.sim.planetScale !== nextPlanetScale) {
      this.sim.planetScale = nextPlanetScale;
      this.setSliderValue(this.ui.planetScale, this.ui.planetScaleValue, this.sim.planetScale, (value) => value.toFixed(2));
      needsPlanetBodyRefresh = true;
      needsOrbitRefresh = true;
    }
    const nextAtmosphereGlow = numericPreference("atmosphereGlow", 0.85);
    if (this.sim.atmosphereGlow !== nextAtmosphereGlow) {
      this.sim.atmosphereGlow = nextAtmosphereGlow;
      this.setSliderValue(this.ui.atmosphereGlow, this.ui.atmosphereGlowValue, this.sim.atmosphereGlow, (value) => value.toFixed(2));
      needsPlanetVisualRefresh = true;
    }
    const nextCloudOpacity = numericPreference("cloudOpacity", 0.16);
    if (this.sim.cloudOpacity !== nextCloudOpacity) {
      this.sim.cloudOpacity = nextCloudOpacity;
      this.setSliderValue(this.ui.cloudOpacity, this.ui.cloudOpacityValue, this.sim.cloudOpacity, (value) => value.toFixed(2));
      needsPlanetVisualRefresh = true;
    }
    const nextSurfaceContrast = numericPreference("surfaceContrast", 1.45);
    if (this.sim.surfaceContrast !== nextSurfaceContrast) {
      this.sim.surfaceContrast = nextSurfaceContrast;
      this.setSliderValue(this.ui.surfaceContrast, this.ui.surfaceContrastValue, this.sim.surfaceContrast, (value) => `${value.toFixed(2)}x`);
      needsPlanetVisualRefresh = true;
    }
    const nextNightLights = numericPreference("nightLights", 0.22);
    if (this.sim.nightLights !== nextNightLights) {
      this.sim.nightLights = nextNightLights;
      this.setSliderValue(this.ui.nightLights, this.ui.nightLightsValue, this.sim.nightLights, (value) => value.toFixed(2));
      needsPlanetVisualRefresh = true;
    }
    const nextSunAzimuth = numericPreference("sunAzimuthDeg", 38);
    if (this.sim.sunAzimuthDeg !== nextSunAzimuth) {
      this.sim.sunAzimuthDeg = nextSunAzimuth;
      this.setSliderValue(this.ui.sunAzimuth, this.ui.sunAzimuthValue, this.sim.sunAzimuthDeg, (value) => `${Math.round(value)}`);
      needsLightingRefresh = true;
    }
    const nextSunElevation = numericPreference("sunElevationDeg", 34);
    if (this.sim.sunElevationDeg !== nextSunElevation) {
      this.sim.sunElevationDeg = nextSunElevation;
      this.setSliderValue(this.ui.sunElevation, this.ui.sunElevationValue, this.sim.sunElevationDeg, (value) => `${Math.round(value)}`);
      needsLightingRefresh = true;
    }
    const nextSpecularBoost = numericPreference("specularBoost", 0.62);
    if (this.sim.specularBoost !== nextSpecularBoost) {
      this.sim.specularBoost = nextSpecularBoost;
      this.setSliderValue(this.ui.specularBoost, this.ui.specularBoostValue, this.sim.specularBoost, (value) => value.toFixed(2));
      needsPlanetVisualRefresh = true;
      needsLightingRefresh = true;
    }
    const nextStarfieldOpacity = numericPreference("starfieldOpacity", 0.84);
    if (this.sim.starfieldOpacity !== nextStarfieldOpacity) {
      this.sim.starfieldOpacity = nextStarfieldOpacity;
      this.setSliderValue(this.ui.starfieldOpacity, this.ui.starfieldOpacityValue, this.sim.starfieldOpacity, (value) => value.toFixed(2));
      needsLightingRefresh = true;
    }
    const nextFreeCameraSpeed = numericPreference("freeCameraSpeed", 132);
    if (this.freeCamera.speed !== nextFreeCameraSpeed) {
      this.freeCamera.speed = nextFreeCameraSpeed;
      this.setSliderValue(this.ui.freeCameraSpeed, this.ui.freeCameraSpeedValue, this.freeCamera.speed, (value) => `${Math.round(value)}`);
    }

    if (needsPlanetBodyRefresh && this.hostShell) {
      this.applyPlanetBody();
      this.updatePlanetVisuals();
      needsPlanetVisualRefresh = false;
    } else if (needsPlanetVisualRefresh) {
      this.updatePlanetVisuals();
    }
    if (needsLightingRefresh) {
      this.updateLightingRig();
    }
    if (needsOrbitRefresh) {
      this.recomputeOrbitState();
    }
  }

  collectUi() {
    return {
      languageToggle: $("languageToggle"),
      cameraHome: $("cameraHome"),
      dockingModeToggle: $("dockingModeToggle"),
      hostBody: $("hostBodyOptions"),
      altitudeKm: $("altitudeKm"),
      altitudeValue: $("altitudeValue"),
      inclinationDeg: $("inclinationDeg"),
      inclinationValue: $("inclinationValue"),
      timeScale: $("timeScale"),
      timeScaleValue: $("timeScaleValue"),
      planetScale: $("planetScale"),
      planetScaleValue: $("planetScaleValue"),
      atmosphereGlow: $("atmosphereGlow"),
      atmosphereGlowValue: $("atmosphereGlowValue"),
      cloudOpacity: $("cloudOpacity"),
      cloudOpacityValue: $("cloudOpacityValue"),
      surfaceContrast: $("surfaceContrast"),
      surfaceContrastValue: $("surfaceContrastValue"),
      nightLights: $("nightLights"),
      nightLightsValue: $("nightLightsValue"),
      freeCameraStatus: $("freeCameraStatus"),
      freeCameraSpeed: $("freeCameraSpeed"),
      freeCameraSpeedValue: $("freeCameraSpeedValue"),
      sunAzimuth: $("sunAzimuth"),
      sunAzimuthValue: $("sunAzimuthValue"),
      sunElevation: $("sunElevation"),
      sunElevationValue: $("sunElevationValue"),
      specularBoost: $("specularBoost"),
      specularBoostValue: $("specularBoostValue"),
      starfieldOpacity: $("starfieldOpacity"),
      starfieldOpacityValue: $("starfieldOpacityValue"),
      yawDeg: $("yawDeg"),
      yawValue: $("yawValue"),
      pitchDeg: $("pitchDeg"),
      pitchValue: $("pitchValue"),
      rollDeg: $("rollDeg"),
      rollValue: $("rollValue"),
      solarSpread: $("solarSpread"),
      solarSpreadValue: $("solarSpreadValue"),
      showCore: $("showCore"),
      showLab: $("showLab"),
      showHab: $("showHab"),
      showPower: $("showPower"),
      showDock: $("showDock"),
      showAntenna: $("showAntenna"),
      dockModuleType: $("dockModuleTypeOptions"),
      dockPort: $("dockPortOptions"),
      approachSpeed: $("approachSpeed"),
      approachSpeedValue: $("approachSpeedValue"),
      launchDocking: $("launchDocking"),
      resetStation: $("resetStation"),
      relayCount: $("relayCount"),
      relayCountValue: $("relayCountValue"),
      linkRangeKm: $("linkRangeKm"),
      linkRangeValue: $("linkRangeValue"),
      antennaPower: $("antennaPower"),
      antennaPowerValue: $("antennaPowerValue"),
      packetRateMbps: $("packetRateMbps"),
      packetRateValue: $("packetRateValue"),
      interferencePct: $("interferencePct"),
      interferenceValue: $("interferenceValue"),
      showLinks: $("showLinks"),
      showOrbitRails: $("showOrbitRails"),
      sceneStatus: $("sceneStatus"),
      fpsValue: $("fpsValue"),
      missionDate: $("missionDate"),
      missionClock: $("missionClock"),
      missionElapsedValue: $("missionElapsedValue"),
      timeScaleReadout: $("timeScaleReadout"),
      transportReset: $("transportReset"),
      transportStepBack: $("transportStepBack"),
      transportPlayPause: $("transportPlayPause"),
      transportStepForward: $("transportStepForward"),
      orbitPeriodValue: $("orbitPeriodValue"),
      orbitPeriodValueMirror: $("orbitPeriodValueMirror"),
      orbitalVelocityValue: $("orbitalVelocityValue"),
      orbitalVelocityValueMirror: $("orbitalVelocityValueMirror"),
      activeLinksValue: $("activeLinksValue"),
      throughputValue: $("throughputValue"),
      moduleCountValue: $("moduleCountValue"),
      dockingStateValue: $("dockingStateValue"),
      engineerPowerScore: $("engineerPowerScore"),
      engineerThermalScore: $("engineerThermalScore"),
      engineerCommsScore: $("engineerCommsScore"),
      engineerDockingScore: $("engineerDockingScore"),
      engineerRiskValue: $("engineerRiskValue"),
      engineerRecommendation: $("engineerRecommendation"),
      engineerNominal: $("engineerNominal"),
      engineerPower: $("engineerPower"),
      engineerComms: $("engineerComms"),
      issLatitudeValue: $("issLatitudeValue"),
      issLongitudeValue: $("issLongitudeValue"),
      issAltitudeValue: $("issAltitudeValue"),
      issVelocityValue: $("issVelocityValue"),
      issTelemetryStatus: $("issTelemetryStatus"),
      eventLog: $("eventLog"),
      sourceList: $("sourceList"),
      presetButtons: [...document.querySelectorAll("[data-preset]")],
    };
  }

  buildScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617);
    this.scene.fog = new THREE.FogExp2(0x020617, 0.0003);

    const rect = this.mount.getBoundingClientRect();
    this.camera = new THREE.PerspectiveCamera(
      55,
      rect.width / Math.max(rect.height, 1),
      0.1,
      5000,
    );
    this.camera.position.set(0, 30, 170);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(rect.width, rect.height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.mount.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 30;
    this.controls.maxDistance = 640;
    this.controls.target.set(0, 0, 0);

    this.clock = new THREE.Clock();

    const ambient = new THREE.AmbientLight(0xa0c4ff, 1.8);
    const sun = new THREE.DirectionalLight(0xffffff, 3.8);
    sun.position.set(180, 120, 220);
    this.fillLight = ambient;
    this.sunLight = sun;
    this.scene.add(ambient, sun);

    const sunMarker = new THREE.Mesh(
      new THREE.SphereGeometry(8, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xfef3c7 }),
    );
    sunMarker.position.copy(sun.position.clone().normalize().multiplyScalar(480));
    this.sunMarker = sunMarker;
    this.scene.add(sunMarker);

    this.stars = createStars(11000);
    this.scene.add(this.stars);
    this.updateLightingRig();

    this.hostShell = new THREE.Group();
    this.scene.add(this.hostShell);

    this.ambientShell = new THREE.Group();
    this.scene.add(this.ambientShell);

    this.inclinationShell = new THREE.Group();
    this.scene.add(this.inclinationShell);

    this.stationOrbitRotor = new THREE.Group();
    this.inclinationShell.add(this.stationOrbitRotor);

    this.stationPivot = new THREE.Group();
    this.stationOrbitRotor.add(this.stationPivot);

    this.stationAttitude = new THREE.Group();
    this.stationPivot.add(this.stationAttitude);

    this.relayShell = new THREE.Group();
    this.scene.add(this.relayShell);

    this.relayOrbitShell = new THREE.Group();
    this.scene.add(this.relayOrbitShell);

    this.orbitGuide = createOrbitRing(50, 0x67e8f9, 0.38);
    this.inclinationShell.add(this.orbitGuide);

    this.dockingGuide = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3(1, 1, 1),
      ]),
      new THREE.LineBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.dockingGuide.visible = false;
    this.stationAttitude.add(this.dockingGuide);
  }

  buildStation() {
    this.stationCoreGroup = new THREE.Group();
    this.stationLabGroup = new THREE.Group();
    this.stationHabGroup = new THREE.Group();
    this.stationPowerGroup = new THREE.Group();
    this.stationDockGroup = new THREE.Group();
    this.stationAntennaGroup = new THREE.Group();

    const core = createModuleCore(BASE_CORE_LENGTH, 3.25, 0xe2e8f0, 0x67e8f9);
    this.stationCoreGroup.add(core);

    const lab = createModuleCore(BASE_LAB_LENGTH, 2.6, 0xc4f1f9, 0x22d3ee);
    lab.position.x = BASE_LAB_X;
    const labWindow = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.6,
        roughness: 0.22,
        metalness: 0.7,
      }),
    );
    labWindow.position.set(14.5, 2.6, 0);
    this.stationLabGroup.add(lab, labWindow);

    const hab = createModuleCore(BASE_HAB_LENGTH, 3.05, 0xf8fafc, 0xfbbf24);
    hab.position.x = BASE_HAB_X;
    this.stationHabGroup.add(hab);

    const node = new THREE.Mesh(
      new THREE.SphereGeometry(BASE_NODE_RADIUS, 36, 36),
      new THREE.MeshStandardMaterial({
        color: 0xdbe4ea,
        metalness: 0.78,
        roughness: 0.24,
        emissive: 0x082f49,
      }),
    );
    const nodeCollar = new THREE.Mesh(
      new THREE.TorusGeometry(4.55, 0.34, 16, 40),
      new THREE.MeshStandardMaterial({
        color: 0x67e8f9,
        metalness: 0.92,
        roughness: 0.28,
        emissive: 0x0e7490,
      }),
    );
    nodeCollar.rotation.x = Math.PI / 2;
    this.stationDockGroup.add(node, nodeCollar);

    const truss = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 1.7, BASE_TRUSS_LENGTH),
      new THREE.MeshStandardMaterial({
        color: 0xb0bec5,
        metalness: 0.74,
        roughness: 0.35,
      }),
    );
    this.leftSolarMount = new THREE.Group();
    this.rightSolarMount = new THREE.Group();
    const leftPanel = createSolarPanels(18, 6.8, 0x1d4ed8);
    const rightPanel = createSolarPanels(18, 6.8, 0x1d4ed8);
    this.leftSolarMount.position.z = -BASE_SOLAR_OFFSET;
    this.rightSolarMount.position.z = BASE_SOLAR_OFFSET;
    this.leftSolarMount.add(leftPanel);
    this.rightSolarMount.add(rightPanel);
    this.stationPowerGroup.add(truss, this.leftSolarMount, this.rightSolarMount);

    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 9.2, 18),
      new THREE.MeshStandardMaterial({
        color: 0xe5e7eb,
        metalness: 0.74,
        roughness: 0.34,
      }),
    );
    mast.position.y = 8.6;
    const dishTop = createDish(3.3);
    dishTop.position.set(0, 14.2, 0);
    dishTop.rotation.z = -0.5;
    const dishSide = createDish(2.2);
    dishSide.position.set(3.2, 7.2, 0);
    this.stationAntennaGroup.add(mast, dishTop, dishSide);

    const stationLabel = createSpriteLabel("МКС / ROSS Digital Twin", "#f8fafc");
    stationLabel.position.set(0, 18, 0);
    this.stationClickProxy = new THREE.Mesh(
      new THREE.SphereGeometry(34, 32, 24),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    this.stationClickProxy.userData.isStationClickProxy = true;
    this.stationAttitude.add(
      this.stationCoreGroup,
      this.stationLabGroup,
      this.stationHabGroup,
      this.stationPowerGroup,
      this.stationDockGroup,
      this.stationAntennaGroup,
      this.stationClickProxy,
      stationLabel,
    );
  }

  renderHostOptions() {
    const current = this.sim.hostBody;
    this.ui.hostBody.innerHTML = "";
    Object.entries(this.profile.planets).forEach(([key, body]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option-button";
      button.dataset.value = key;
      button.textContent = this.lang === "ru" ? body.nameRu : body.nameEn;
      this.ui.hostBody.appendChild(button);
    });
    this.setOptionGroupValue(this.ui.hostBody, current);
  }

  setOptionGroupValue(group, value) {
    if (!group || !value) {
      return;
    }
    group.dataset.value = value;
    group.querySelectorAll("[data-value]").forEach((button) => {
      const isActive = button.dataset.value === value;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  getOptionGroupValue(group, fallback = "") {
    return (
      group?.dataset.value ||
      group?.querySelector("[data-value].is-active")?.dataset.value ||
      group?.querySelector("[data-value]")?.dataset.value ||
      fallback
    );
  }

  bindOptionGroup(group, onChange, fallback = "") {
    if (!group) {
      return;
    }
    this.setOptionGroupValue(group, this.getOptionGroupValue(group, fallback));
    group.addEventListener("click", (event) => {
      const button = event.target.closest("[data-value]");
      if (!button || !group.contains(button)) {
        return;
      }
      const nextValue = button.dataset.value;
      if (group.dataset.value === nextValue) {
        return;
      }
      this.setOptionGroupValue(group, nextValue);
      onChange(nextValue);
      this.updateTelemetry();
    });
  }

  renderSourceList() {
    if (!this.ui.sourceList) {
      return;
    }
    this.ui.sourceList.innerHTML = "";
    [...this.profile.openDataSources, ...TEXTURE_SOURCES].forEach((source) => {
      const link = document.createElement("a");
      link.className = "source-link";
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.innerHTML = `
        <strong>${source.name}</strong>
        <span>${I18N[this.lang].sourceLabel}: ${source.usage}</span>
      `;
      this.ui.sourceList.appendChild(link);
    });
  }

  bindUi() {
    this.bindRange(this.ui.altitudeKm, this.ui.altitudeValue, (value) => {
      this.sim.altitudeKm = value;
      this.recomputeOrbitState();
    });

    this.bindRange(
      this.ui.inclinationDeg,
      this.ui.inclinationValue,
      (value) => {
        this.sim.inclinationDeg = value;
        this.recomputeOrbitState();
      },
      (value) => value.toFixed(1),
    );

    this.bindRange(
      this.ui.timeScale,
      this.ui.timeScaleValue,
      (value) => {
        this.sim.timeScale = value;
        if (this.ui.timeScaleReadout) {
          this.ui.timeScaleReadout.textContent = `${value.toFixed(1)}x`;
        }
      },
      (value) => `${value.toFixed(1)}x`,
    );

    this.bindRange(
      this.ui.planetScale,
      this.ui.planetScaleValue,
      (value) => {
        this.sim.planetScale = value;
        this.applyPlanetBody();
      },
      (value) => value.toFixed(2),
    );
    this.bindRange(
      this.ui.atmosphereGlow,
      this.ui.atmosphereGlowValue,
      (value) => {
        this.sim.atmosphereGlow = value;
        this.updatePlanetVisuals();
      },
      (value) => value.toFixed(2),
    );
    this.bindRange(
      this.ui.cloudOpacity,
      this.ui.cloudOpacityValue,
      (value) => {
        this.sim.cloudOpacity = value;
        this.updatePlanetVisuals();
      },
      (value) => value.toFixed(2),
    );
    this.bindRange(
      this.ui.surfaceContrast,
      this.ui.surfaceContrastValue,
      (value) => {
        this.sim.surfaceContrast = value;
        this.updatePlanetVisuals();
      },
      (value) => `${value.toFixed(2)}x`,
    );
    this.bindRange(
      this.ui.nightLights,
      this.ui.nightLightsValue,
      (value) => {
        this.sim.nightLights = value;
        this.updatePlanetVisuals();
      },
      (value) => value.toFixed(2),
    );
    this.bindRange(
      this.ui.freeCameraSpeed,
      this.ui.freeCameraSpeedValue,
      (value) => {
        this.freeCamera.speed = value;
      },
      (value) => `${Math.round(value)}`,
    );
    this.bindRange(
      this.ui.sunAzimuth,
      this.ui.sunAzimuthValue,
      (value) => {
        this.sim.sunAzimuthDeg = value;
        this.updateLightingRig();
      },
      (value) => `${Math.round(value)}`,
    );
    this.bindRange(
      this.ui.sunElevation,
      this.ui.sunElevationValue,
      (value) => {
        this.sim.sunElevationDeg = value;
        this.updateLightingRig();
      },
      (value) => `${Math.round(value)}`,
    );
    this.bindRange(
      this.ui.specularBoost,
      this.ui.specularBoostValue,
      (value) => {
        this.sim.specularBoost = value;
        this.updatePlanetVisuals();
        this.updateLightingRig();
      },
      (value) => value.toFixed(2),
    );
    this.bindRange(
      this.ui.starfieldOpacity,
      this.ui.starfieldOpacityValue,
      (value) => {
        this.sim.starfieldOpacity = value;
        this.updateLightingRig();
      },
      (value) => value.toFixed(2),
    );

    this.bindRange(this.ui.yawDeg, this.ui.yawValue, (value) => {
      this.sim.yawDeg = value;
      this.updateStationAttitude();
    });
    this.bindRange(this.ui.pitchDeg, this.ui.pitchValue, (value) => {
      this.sim.pitchDeg = value;
      this.updateStationAttitude();
    });
    this.bindRange(this.ui.rollDeg, this.ui.rollValue, (value) => {
      this.sim.rollDeg = value;
      this.updateStationAttitude();
    });
    this.bindRange(this.ui.solarSpread, this.ui.solarSpreadValue, (value) => {
      this.sim.solarSpreadDeg = value;
      this.updateSolarPanels();
    });

    [
      this.ui.showCore,
      this.ui.showLab,
      this.ui.showHab,
      this.ui.showPower,
      this.ui.showDock,
      this.ui.showAntenna,
    ].filter(Boolean).forEach((checkbox) =>
      checkbox.addEventListener("change", () => this.updateModuleVisibility()),
    );

    this.bindRange(
      this.ui.approachSpeed,
      this.ui.approachSpeedValue,
      (value) => {
        this.sim.approachSpeed = value;
      },
      (value) => `${value.toFixed(1)}x`,
    );

    this.bindRange(this.ui.relayCount, this.ui.relayCountValue, (value) => {
      this.sim.relayCount = Math.round(value);
      this.rebuildRelays();
    });
    this.bindRange(this.ui.linkRangeKm, this.ui.linkRangeValue, (value) => {
      this.sim.linkRangeKm = value;
    });
    this.bindRange(this.ui.antennaPower, this.ui.antennaPowerValue, (value) => {
      this.sim.antennaPowerPct = value;
    });
    this.bindRange(this.ui.packetRateMbps, this.ui.packetRateValue, (value) => {
      this.sim.packetRateMbps = value;
    });
    this.bindRange(this.ui.interferencePct, this.ui.interferenceValue, (value) => {
      this.sim.interferencePct = value;
    });

    this.ui.showLinks?.addEventListener("change", () => {
      this.sim.showLinks = this.ui.showLinks.checked;
      this.syncDashboardState("simulator-view");
    });
    this.ui.showOrbitRails?.addEventListener("change", () => {
      this.sim.showOrbitRails = this.ui.showOrbitRails.checked;
      this.orbitGuide.visible = this.sim.showOrbitRails;
      this.relayOrbitShell.visible = this.sim.showOrbitRails;
      this.syncDashboardState("simulator-view");
    });

    this.bindOptionGroup(this.ui.hostBody, (value) => {
      this.sim.hostBody = value;
      this.applyPlanetBody();
      const name =
        this.lang === "ru"
          ? this.profile.planets[this.sim.hostBody].nameRu
          : this.profile.planets[this.sim.hostBody].nameEn;
      this.logEvent(I18N[this.lang].aroundBody(name));
      this.syncDashboardState("simulator-host");
    }, this.sim.hostBody);
    this.bindOptionGroup(this.ui.dockModuleType, () => {}, "science");
    this.bindOptionGroup(this.ui.dockPort, () => {}, "forward");

    window.addEventListener("app-language-change", (event) => {
      const nextLang = event.detail?.lang === "en" ? "en" : "ru";
      if (nextLang !== this.lang) {
        this.lang = nextLang;
        this.applyLanguage();
      }
    });
    if (this.ui.cameraHome) {
      this.ui.cameraHome.addEventListener("click", () => this.resetCamera());
    }
    this.ui.dockingModeToggle?.addEventListener("click", () => {
      this.setDockingMode(!this.sim.dockingMode);
    });
    this.ui.transportReset?.addEventListener("click", () => {
      this.setPlayback(false, { silent: true });
      this.setMissionElapsed(0);
      this.logEvent(I18N[this.lang].playbackReset);
    });
    this.ui.transportStepBack?.addEventListener("click", () => {
      this.setPlayback(false, { silent: true });
      this.shiftMissionElapsed(-TRANSPORT_STEP_SECONDS);
      this.logEvent(I18N[this.lang].playbackStepBack);
    });
    this.ui.transportPlayPause?.addEventListener("click", () => {
      this.setPlayback(!this.sim.isPlaying);
    });
    this.ui.transportStepForward?.addEventListener("click", () => {
      this.setPlayback(false, { silent: true });
      this.shiftMissionElapsed(TRANSPORT_STEP_SECONDS);
      this.logEvent(I18N[this.lang].playbackStepForward);
    });
    this.ui.launchDocking?.addEventListener("click", () => this.startDocking());
    this.ui.resetStation?.addEventListener("click", () => this.resetStation());
    this.ui.engineerNominal?.addEventListener("click", () => this.applyEngineerAction("nominal"));
    this.ui.engineerPower?.addEventListener("click", () => this.applyEngineerAction("power"));
    this.ui.engineerComms?.addEventListener("click", () => this.applyEngineerAction("comms"));
    window.addEventListener("keydown", (event) => this.handleFreeCameraKeyDown(event));
    window.addEventListener("keyup", (event) => this.handleFreeCameraKeyUp(event));
    window.addEventListener("blur", () => this.setFreeCameraActive(false));
    this.mount.addEventListener("pointerdown", (event) => {
      if (this.handleFreeCameraPointerDown(event)) {
        return;
      }
      this.handleScenePointerDown(event);
    });
    this.mount.addEventListener("pointermove", (event) => this.handleFreeCameraPointerMove(event));
    this.mount.addEventListener("pointerup", (event) => {
      if (this.handleFreeCameraPointerUp(event)) {
        return;
      }
      this.handleScenePointerUp(event);
    });
    this.mount.addEventListener("pointercancel", (event) => this.handleFreeCameraPointerUp(event));
    this.mount.addEventListener("click", (event) => this.handleSceneClick(event));

    this.ui.presetButtons.forEach((button) => {
      button.addEventListener("click", () => this.applyPreset(button.dataset.preset));
    });
  }

  bindRange(slider, output, onChange, formatter = (value) => `${value}`) {
    if (!slider || !output) {
      return;
    }
    const emit = () => {
      const numericValue = Number(slider.value);
      output.textContent = formatter(numericValue);
      onChange(numericValue);
      this.updateTelemetry();
      this.syncDashboardState("simulator-range");
    };
    slider.addEventListener("input", emit);
    emit();
  }

  applyLanguage() {
    document.documentElement.lang = this.lang;
    const dict = I18N[this.lang];
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.dataset.i18n;
      if (typeof dict[key] === "string") {
        node.textContent = dict[key];
      }
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
      const key = node.dataset.i18nAriaLabel;
      if (typeof dict[key] === "string") {
        node.setAttribute("aria-label", dict[key]);
      }
    });
    document.querySelectorAll("[data-i18n-title]").forEach((node) => {
      const key = node.dataset.i18nTitle;
      if (typeof dict[key] === "string") {
        node.setAttribute("title", dict[key]);
      }
    });
    if (this.ui.languageToggle) {
      this.ui.languageToggle.dataset.currentLang = this.lang;
      this.ui.languageToggle.setAttribute(
        "aria-label",
        this.lang === "ru" ? "Switch language to English" : "Переключить язык на русский",
      );
      const options = this.ui.languageToggle.querySelectorAll("[data-lang-option]");
      if (options.length > 0) {
        options.forEach((option) => {
          option.classList.toggle("is-active", option.dataset.langOption === this.lang);
        });
      } else {
        this.ui.languageToggle.textContent = this.lang === "ru" ? "EN" : "RU";
      }
    }
    this.renderHostOptions();
    this.renderSourceList();
    this.updateDockingModeUi();
    this.updatePlaybackButtonUi();
    if (this.ui.freeCameraStatus) {
      this.ui.freeCameraStatus.textContent = this.freeCamera.active
        ? dict.freeCameraActive
        : dict.freeCameraFollow;
    }
    this.updateIssStatusCard(this.lastIssTelemetry);
    this.updateTelemetry();
    const hostName =
      this.lang === "ru"
        ? this.profile.planets[this.sim.hostBody].nameRu
        : this.profile.planets[this.sim.hostBody].nameEn;
    this.ui.sceneStatus.textContent = dict.aroundBody(hostName);
  }

  setDockingMode(isEnabled) {
    if (this.sim.dockingMode === isEnabled) {
      return;
    }
    this.sim.dockingMode = isEnabled;
    this.updateDockingModeUi();
    this.logEvent(
      isEnabled
        ? I18N[this.lang].dockingModeEnabled
        : I18N[this.lang].dockingModeDisabled,
    );
  }

  updateDockingModeUi() {
    if (!this.ui.dockingModeToggle) {
      return;
    }
    this.ui.dockingModeToggle.classList.toggle("is-active", this.sim.dockingMode);
    this.ui.dockingModeToggle.setAttribute(
      "aria-pressed",
      this.sim.dockingMode ? "true" : "false",
    );
    this.ui.dockingModeToggle.setAttribute("aria-label", I18N[this.lang].dockingMode);
  }

  setPlayback(isPlaying, options = {}) {
    if (this.sim.isPlaying === isPlaying) {
      return;
    }
    this.sim.isPlaying = isPlaying;
    this.updatePlaybackButtonUi();
    if (!options.silent) {
      this.logEvent(isPlaying ? I18N[this.lang].playbackResumed : I18N[this.lang].playbackPaused);
    }
  }

  updatePlaybackButtonUi() {
    if (!this.ui.transportPlayPause) {
      return;
    }
    const dict = I18N[this.lang];
    const label = this.sim.isPlaying ? dict.playbackPause : dict.playbackResume;
    const icon = this.sim.isPlaying ? "pause" : "play";
    this.ui.transportPlayPause.classList.toggle("is-paused", !this.sim.isPlaying);
    this.ui.transportPlayPause.setAttribute("aria-label", label);
    this.ui.transportPlayPause.setAttribute("title", label);
    this.ui.transportPlayPause.innerHTML = `<i data-lucide="${icon}"></i>`;
    window.lucide?.createIcons?.({
      attrs: {
        "stroke-width": 1.7,
      },
    });
  }

  isFormInteraction(event) {
    const tag = event.target?.tagName?.toLowerCase();
    return ["input", "textarea", "select", "button"].includes(tag);
  }

  handleFreeCameraKeyDown(event) {
    if (event.key === "Shift" && !this.isFormInteraction(event)) {
      this.setFreeCameraActive(true);
      return;
    }
    if (!this.freeCamera.active) {
      return;
    }
    const code = event.code;
    if (
      ["KeyW", "KeyA", "KeyS", "KeyD", "KeyQ", "KeyE", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(code)
    ) {
      this.freeCamera.keys.add(code);
      event.preventDefault();
    }
  }

  handleFreeCameraKeyUp(event) {
    if (event.key === "Shift") {
      this.setFreeCameraActive(false);
      return;
    }
    this.freeCamera.keys.delete(event.code);
  }

  setFreeCameraActive(isActive) {
    if (this.freeCamera.active === isActive) {
      return;
    }
    this.freeCamera.active = isActive;
    this.freeCamera.keys.clear();
    this.freeCamera.pointerId = null;
    this.controls.enabled = !isActive;
    this.mount.classList.toggle("is-free-camera", isActive);
    if (this.ui.freeCameraStatus) {
      this.ui.freeCameraStatus.textContent = isActive
        ? I18N[this.lang].freeCameraActive
        : I18N[this.lang].freeCameraFollow;
    }
    if (isActive) {
      this.logEvent(I18N[this.lang].freeCameraLog);
    }
  }

  handleFreeCameraPointerDown(event) {
    if (!this.freeCamera.active || event.button !== 0) {
      return false;
    }
    this.freeCamera.pointerId = event.pointerId;
    this.freeCamera.lastX = event.clientX;
    this.freeCamera.lastY = event.clientY;
    this.mount.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    return true;
  }

  handleFreeCameraPointerMove(event) {
    if (!this.freeCamera.active || this.freeCamera.pointerId !== event.pointerId) {
      return false;
    }
    const dx = event.clientX - this.freeCamera.lastX;
    const dy = event.clientY - this.freeCamera.lastY;
    this.freeCamera.lastX = event.clientX;
    this.freeCamera.lastY = event.clientY;
    const euler = new THREE.Euler().setFromQuaternion(this.camera.quaternion, "YXZ");
    euler.y -= dx * this.freeCamera.lookSensitivity;
    euler.x = clamp(
      euler.x - dy * this.freeCamera.lookSensitivity,
      -Math.PI * 0.48,
      Math.PI * 0.48,
    );
    this.camera.quaternion.setFromEuler(euler);
    return true;
  }

  handleFreeCameraPointerUp(event) {
    if (this.freeCamera.pointerId !== event.pointerId) {
      return false;
    }
    this.mount.releasePointerCapture?.(event.pointerId);
    this.freeCamera.pointerId = null;
    return this.freeCamera.active;
  }

  updateFreeCamera(deltaSeconds) {
    if (!this.freeCamera.active) {
      return;
    }
    const keys = this.freeCamera.keys;
    const movement = new THREE.Vector3();
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, this.camera.up).normalize();
    const up = this.camera.up.clone().normalize();
    if (keys.has("KeyW") || keys.has("ArrowUp")) movement.add(forward);
    if (keys.has("KeyS") || keys.has("ArrowDown")) movement.sub(forward);
    if (keys.has("KeyD") || keys.has("ArrowRight")) movement.add(right);
    if (keys.has("KeyA") || keys.has("ArrowLeft")) movement.sub(right);
    if (keys.has("KeyE")) movement.add(up);
    if (keys.has("KeyQ")) movement.sub(up);
    if (movement.lengthSq() > 0) {
      movement.normalize().multiplyScalar(this.freeCamera.speed * deltaSeconds);
      this.camera.position.add(movement);
    }
    const target = this.camera.position.clone().add(forward.multiplyScalar(80));
    this.controls.target.copy(target);
  }

  setSliderValue(slider, output, value, formatter = (numericValue) => `${numericValue}`) {
    if (slider) {
      slider.value = `${value}`;
    }
    if (output) {
      output.textContent = formatter(Number(value));
    }
  }

  applySimulationPatch(patch, source = "engineer") {
    if (!patch || typeof patch !== "object") {
      return;
    }
    let needsOrbitRefresh = false;
    let needsSolarRefresh = false;
    let needsRelayRefresh = false;
    let needsLightingRefresh = false;
    let needsPlanetRefresh = false;

    if (Number.isFinite(patch.timeScale)) {
      this.sim.timeScale = Number(patch.timeScale);
      this.setSliderValue(this.ui.timeScale, this.ui.timeScaleValue, this.sim.timeScale, (value) => `${value.toFixed(1)}x`);
    }
    if (Number.isFinite(patch.altitudeKm)) {
      this.sim.altitudeKm = Number(patch.altitudeKm);
      this.setSliderValue(this.ui.altitudeKm, this.ui.altitudeValue, this.sim.altitudeKm, (value) => `${Math.round(value)}`);
      needsOrbitRefresh = true;
    }
    if (Number.isFinite(patch.inclinationDeg)) {
      this.sim.inclinationDeg = Number(patch.inclinationDeg);
      this.setSliderValue(this.ui.inclinationDeg, this.ui.inclinationValue, this.sim.inclinationDeg, (value) => value.toFixed(1));
      needsOrbitRefresh = true;
    }
    if (Number.isFinite(patch.solarSpreadDeg)) {
      this.sim.solarSpreadDeg = Number(patch.solarSpreadDeg);
      this.setSliderValue(this.ui.solarSpread, this.ui.solarSpreadValue, this.sim.solarSpreadDeg, (value) => `${Math.round(value)}`);
      needsSolarRefresh = true;
    }
    if (Number.isFinite(patch.relayCount)) {
      this.sim.relayCount = Math.round(Number(patch.relayCount));
      this.setSliderValue(this.ui.relayCount, this.ui.relayCountValue, this.sim.relayCount, (value) => `${Math.round(value)}`);
      needsRelayRefresh = true;
    }
    if (Number.isFinite(patch.linkRangeKm)) {
      this.sim.linkRangeKm = Number(patch.linkRangeKm);
      this.setSliderValue(this.ui.linkRangeKm, this.ui.linkRangeValue, this.sim.linkRangeKm, (value) => `${Math.round(value)}`);
    }
    if (Number.isFinite(patch.antennaPowerPct)) {
      this.sim.antennaPowerPct = Number(patch.antennaPowerPct);
      this.setSliderValue(this.ui.antennaPower, this.ui.antennaPowerValue, this.sim.antennaPowerPct, (value) => `${Math.round(value)}`);
    }
    if (Number.isFinite(patch.packetRateMbps)) {
      this.sim.packetRateMbps = Number(patch.packetRateMbps);
      this.setSliderValue(this.ui.packetRateMbps, this.ui.packetRateValue, this.sim.packetRateMbps, (value) => `${Math.round(value)}`);
    }
    if (Number.isFinite(patch.interferencePct)) {
      this.sim.interferencePct = Number(patch.interferencePct);
      this.setSliderValue(this.ui.interferencePct, this.ui.interferenceValue, this.sim.interferencePct, (value) => `${Math.round(value)}`);
    }
    if (Number.isFinite(patch.nightLights)) {
      this.sim.nightLights = Number(patch.nightLights);
      this.setSliderValue(this.ui.nightLights, this.ui.nightLightsValue, this.sim.nightLights, (value) => value.toFixed(2));
      needsPlanetRefresh = true;
    }
    if (Number.isFinite(patch.atmosphereGlow)) {
      this.sim.atmosphereGlow = Number(patch.atmosphereGlow);
      this.setSliderValue(this.ui.atmosphereGlow, this.ui.atmosphereGlowValue, this.sim.atmosphereGlow, (value) => value.toFixed(2));
      needsPlanetRefresh = true;
    }
    if (Number.isFinite(patch.surfaceContrast)) {
      this.sim.surfaceContrast = Number(patch.surfaceContrast);
      this.setSliderValue(this.ui.surfaceContrast, this.ui.surfaceContrastValue, this.sim.surfaceContrast, (value) => `${value.toFixed(2)}x`);
      needsPlanetRefresh = true;
    }
    if (Number.isFinite(patch.cloudOpacity)) {
      this.sim.cloudOpacity = Number(patch.cloudOpacity);
      this.setSliderValue(this.ui.cloudOpacity, this.ui.cloudOpacityValue, this.sim.cloudOpacity, (value) => value.toFixed(2));
      needsPlanetRefresh = true;
    }
    if (Number.isFinite(patch.sunAzimuthDeg)) {
      this.sim.sunAzimuthDeg = Number(patch.sunAzimuthDeg);
      this.setSliderValue(this.ui.sunAzimuth, this.ui.sunAzimuthValue, this.sim.sunAzimuthDeg, (value) => `${Math.round(value)}`);
      needsLightingRefresh = true;
    }
    if (Number.isFinite(patch.sunElevationDeg)) {
      this.sim.sunElevationDeg = Number(patch.sunElevationDeg);
      this.setSliderValue(this.ui.sunElevation, this.ui.sunElevationValue, this.sim.sunElevationDeg, (value) => `${Math.round(value)}`);
      needsLightingRefresh = true;
    }
    if (Number.isFinite(patch.specularBoost)) {
      this.sim.specularBoost = Number(patch.specularBoost);
      this.setSliderValue(this.ui.specularBoost, this.ui.specularBoostValue, this.sim.specularBoost, (value) => value.toFixed(2));
      needsLightingRefresh = true;
      needsPlanetRefresh = true;
    }
    if (Number.isFinite(patch.starfieldOpacity)) {
      this.sim.starfieldOpacity = Number(patch.starfieldOpacity);
      this.setSliderValue(this.ui.starfieldOpacity, this.ui.starfieldOpacityValue, this.sim.starfieldOpacity, (value) => value.toFixed(2));
      needsLightingRefresh = true;
    }

    if (needsOrbitRefresh) {
      this.recomputeOrbitState();
    }
    if (needsSolarRefresh) {
      this.updateSolarPanels();
    }
    if (needsRelayRefresh) {
      this.rebuildRelays();
    }
    if (needsPlanetRefresh) {
      this.updatePlanetVisuals();
    }
    if (needsLightingRefresh) {
      this.updateLightingRig();
    }
    this.updateTelemetry();
    this.syncDashboardState(source);
  }

  getBuilderEngineeringState() {
    const config = readBuilderConfiguration();
    const engineering = config?.engineering || {};
    return {
      thermalBiasPct: Number.isFinite(Number(engineering.thermalBiasPct)) ? Number(engineering.thermalBiasPct) : 0,
      crewLoad: Number.isFinite(Number(engineering.crewLoad)) ? Number(engineering.crewLoad) : 3,
      commsGainPct: Number.isFinite(Number(engineering.commsGainPct)) ? Number(engineering.commsGainPct) : 72,
    };
  }

  getStationModuleCounts() {
    const counts = {
      science: 1,
      habitat: 1,
      cargo: 0,
      power: 1,
      relay: 1,
      node: 1,
      airlock: 0,
      radiator: 0,
      propulsion: 0,
      cupola: 0,
    };
    this.dynamicModules.forEach((moduleGroup) => {
      const moduleType = moduleGroup.userData?.moduleType || "science";
      counts[moduleType] = (counts[moduleType] || 0) + 1;
    });
    return counts;
  }

  getScoreState(score) {
    if (score >= 78) {
      return "nominal";
    }
    if (score >= 56) {
      return "watch";
    }
    return "risk";
  }

  computeEngineeringState() {
    const counts = this.getStationModuleCounts();
    const builder = this.getBuilderEngineeringState();
    const occupiedPorts = Object.values(this.portExtension).filter((distance) => distance > 0).length;
    const dynamicCount = this.dynamicModules.length;
    const solarTracking = clamp(
      Math.cos(THREE.MathUtils.degToRad(this.sim.solarSpreadDeg - 12)) * 0.5 + 0.55,
      0.28,
      1.05,
    );
    const sunFactor = clamp(smoothstep(-8, 60, this.sim.sunElevationDeg) * 0.82 + 0.22, 0.22, 1.05);
    const hostThermalFactor = {
      venus: 1.18,
      mars: 0.92,
      moon: 0.97,
      jupiter: 1.04,
      saturn: 1.02,
      earth: 1,
    }[this.sim.hostBody] || 1;

    const powerGeneration = 118 + counts.power * 82 * solarTracking * sunFactor + counts.relay * 6;
    const powerLoad =
      96
      + counts.science * 14
      + counts.habitat * 9
      + counts.relay * 4.5
      + counts.propulsion * 12
      + counts.cargo * 3
      + this.relays.length * 1.4
      + this.sim.packetRateMbps * 0.032
      + this.sim.antennaPowerPct * 0.18
      + builder.crewLoad * 3.8;
    const powerMargin = powerGeneration - powerLoad;
    const powerScore = clamp(58 + powerMargin * 0.55, 0, 100);

    const thermalCapacity =
      74
      + counts.radiator * 30
      + counts.power * 5
      + counts.cupola * 2
      + this.sim.cloudOpacity * 10
      + this.sim.atmosphereGlow * 7;
    const thermalLoad =
      (
        60
        + counts.science * 12
        + counts.habitat * 10
        + counts.propulsion * 15
        + builder.thermalBiasPct * 0.7
        + this.sim.sunElevationDeg * 0.16
        + this.sim.surfaceContrast * 6
        + this.sim.nightLights * 7
      ) * hostThermalFactor;
    const thermalMargin = thermalCapacity - thermalLoad;
    const thermalScore = clamp(54 + thermalMargin * 1.12, 0, 100);

    const linkBudget =
      42
      + counts.relay * 15
      + counts.node * 5
      + this.sim.antennaPowerPct * 0.44
      + this.sim.linkRangeKm / 360
      + builder.commsGainPct * 0.14;
    const linkDemand =
      40
      + this.sim.packetRateMbps * 0.067
      + this.sim.interferencePct * 0.9
      + counts.cargo * 2.5
      + counts.science * 3
      + dynamicCount * 1.4;
    const commsMargin = linkBudget - linkDemand;
    const commsScore = clamp(55 + commsMargin * 0.95, 0, 100);

    const freePorts = Math.max(0, Object.keys(PORTS).length - occupiedPorts);
    const dockingComplexity =
      dynamicCount * 4.2
      + (this.activeDocking ? 14 : 0)
      + (this.sim.dockingMode ? 8 : 0)
      + Math.max(0, occupiedPorts - 6) * 3;
    const dockingScore = clamp(88 - dockingComplexity + freePorts * 2.6, 8, 100);

    const riskScore = clamp(
      Math.round(100 - (powerScore * 0.28 + thermalScore * 0.28 + commsScore * 0.24 + dockingScore * 0.2)),
      0,
      100,
    );

    let recommendation = this.lang === "ru"
      ? "Система в коридоре устойчивости. Продолжайте мониторинг узких мест."
      : "System remains inside the stability envelope. Keep watching the weakest subsystem.";
    const weakest = [
      { key: "power", score: powerScore },
      { key: "thermal", score: thermalScore },
      { key: "comms", score: commsScore },
      { key: "docking", score: dockingScore },
    ].sort((left, right) => left.score - right.score)[0];

    if (weakest.key === "power") {
      recommendation = this.lang === "ru"
        ? "Запас мощности тонкий. Разверните панели ближе к Солнцу или уменьшите пакетный поток."
        : "Power margin is thin. Point the arrays closer to the sun or reduce packet throughput.";
    } else if (weakest.key === "thermal") {
      recommendation = this.lang === "ru"
        ? "Тепловая нагрузка доминирует. Снизьте контраст подсветки, разгрузите полезную нагрузку или поднимите облачный слой."
        : "Thermal load dominates. Ease the visual load, reduce payload stress, or increase cloud shielding.";
    } else if (weakest.key === "comms") {
      recommendation = this.lang === "ru"
        ? "Связь близка к пределу. Поднимите мощность антенн, ослабьте помехи или добавьте ретрансляторы."
        : "Communications are near the limit. Raise antenna power, cut interference, or add relays.";
    } else if (weakest.key === "docking") {
      recommendation = this.lang === "ru"
        ? "Стыковочный коридор тесный. Освободите порты или переведите станцию в штатный режим перед новой стыковкой."
        : "Docking geometry is tight. Free ports or return the station to nominal mode before the next approach.";
    }

    return {
      powerScore,
      thermalScore,
      commsScore,
      dockingScore,
      riskScore,
      powerMargin,
      thermalMargin,
      commsMargin,
      freePorts,
      recommendation,
    };
  }

  updateEngineeringPanel(metrics = this.computeEngineeringState()) {
    const powerState = this.getScoreState(metrics.powerScore);
    const thermalState = this.getScoreState(metrics.thermalScore);
    const commsState = this.getScoreState(metrics.commsScore);
    const dockingState = this.getScoreState(metrics.dockingScore);
    const riskState = metrics.riskScore <= 24 ? "nominal" : metrics.riskScore <= 48 ? "watch" : "risk";

    if (this.ui.engineerPowerScore) {
      this.ui.engineerPowerScore.textContent = `${Math.round(metrics.powerScore)}`;
      this.ui.engineerPowerScore.dataset.state = powerState;
    }
    if (this.ui.engineerThermalScore) {
      this.ui.engineerThermalScore.textContent = `${Math.round(metrics.thermalScore)}`;
      this.ui.engineerThermalScore.dataset.state = thermalState;
    }
    if (this.ui.engineerCommsScore) {
      this.ui.engineerCommsScore.textContent = `${Math.round(metrics.commsScore)}`;
      this.ui.engineerCommsScore.dataset.state = commsState;
    }
    if (this.ui.engineerDockingScore) {
      this.ui.engineerDockingScore.textContent = `${Math.round(metrics.dockingScore)}`;
      this.ui.engineerDockingScore.dataset.state = dockingState;
    }
    if (this.ui.engineerRiskValue) {
      this.ui.engineerRiskValue.textContent = `${metrics.riskScore}%`;
      this.ui.engineerRiskValue.dataset.state = riskState;
    }
    if (this.ui.engineerRecommendation) {
      this.ui.engineerRecommendation.textContent = metrics.recommendation;
    }
  }

  applyEngineerAction(mode) {
    const actionMap = {
      nominal: {
        patch: {
          timeScale: 1,
          solarSpreadDeg: 18,
          relayCount: Math.max(8, this.sim.relayCount),
          linkRangeKm: Math.max(14000, this.sim.linkRangeKm),
          antennaPowerPct: 78,
          packetRateMbps: 360,
          interferencePct: 10,
        },
        label: this.lang === "ru" ? "Применён штатный инженерный профиль." : "Nominal engineering profile applied.",
      },
      power: {
        patch: {
          solarSpreadDeg: 6,
          antennaPowerPct: 68,
          packetRateMbps: 280,
          interferencePct: 8,
        },
        label: this.lang === "ru" ? "Включён режим экономии мощности." : "Power-saving tuning applied.",
      },
      comms: {
        patch: {
          relayCount: Math.max(10, this.sim.relayCount),
          linkRangeKm: Math.max(18500, this.sim.linkRangeKm),
          antennaPowerPct: 94,
          packetRateMbps: 560,
          interferencePct: 6,
          solarSpreadDeg: 12,
        },
        label: this.lang === "ru" ? "Включён усиленный профиль связи." : "Communications-focused tuning applied.",
      },
    };
    const config = actionMap[mode];
    if (!config) {
      return;
    }
    this.applySimulationPatch(config.patch, `engineer-${mode}`);
    this.logEvent(config.label);
  }

  getSunDirection() {
    const azimuth = THREE.MathUtils.degToRad(this.sim.sunAzimuthDeg);
    const elevation = THREE.MathUtils.degToRad(this.sim.sunElevationDeg);
    return new THREE.Vector3(
      Math.cos(elevation) * Math.cos(azimuth),
      Math.sin(elevation),
      Math.cos(elevation) * Math.sin(azimuth),
    ).normalize();
  }

  updateLightingRig() {
    const direction = this.getSunDirection();
    const elevationMix = smoothstep(-10, 70, this.sim.sunElevationDeg);
    if (this.sunLight) {
      this.sunLight.position.copy(direction.clone().multiplyScalar(420));
      this.sunLight.intensity = 2.7 + elevationMix * 2.1 + this.sim.specularBoost * 0.55;
      this.sunLight.color.setHSL(0.11 - elevationMix * 0.02, 0.76, 0.72 + elevationMix * 0.08);
    }
    if (this.fillLight) {
      this.fillLight.intensity = 1.15 + (1 - elevationMix) * 0.85;
      this.fillLight.color.setHSL(0.58, 0.42, 0.74);
    }
    if (this.sunMarker) {
      this.sunMarker.position.copy(direction.clone().multiplyScalar(480));
    }
    if (this.stars?.material) {
      this.stars.material.opacity = clamp(this.sim.starfieldOpacity, 0.15, 1.2);
    }
    if (this.hostSpecular?.material?.uniforms) {
      this.hostSpecular.material.uniforms.lightDirection.value.copy(direction);
      this.hostSpecular.material.uniforms.intensity.value =
        this.sim.specularBoost * (this.sim.hostBody === "moon" ? 0.42 : 1);
    }
  }

  setMissionElapsed(seconds) {
    this.missionElapsedSec = Number(seconds) || 0;
    const stats = this.getCircularOrbitStats();
    this.stationOrbitRotor.rotation.y = stats.meanMotionRadSec * this.missionElapsedSec;
    this.updateRelays(0);
    this.updateTelemetry();
  }

  shiftMissionElapsed(deltaSeconds) {
    this.setMissionElapsed(this.missionElapsedSec + deltaSeconds);
  }

  advanceMissionTime(deltaSeconds) {
    if (deltaSeconds <= 0) {
      return;
    }
    this.missionElapsedSec += deltaSeconds;
    const stats = this.getCircularOrbitStats();
    this.stationOrbitRotor.rotation.y = stats.meanMotionRadSec * this.missionElapsedSec;
  }

  async fetchIssTelemetry() {
    try {
      const response = await fetch("/api/iss-now", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`ISS telemetry request failed: ${response.status}`);
      }
      const payload = await response.json();
      if (payload.status !== "ok") {
        throw new Error("ISS telemetry unavailable");
      }
      this.lastIssTelemetry = payload;
      this.updateIssStatusCard(payload);
      this.syncDashboardState("iss-telemetry");
    } catch (error) {
      this.lastIssTelemetry = null;
      this.updateIssStatusCard(null);
      this.syncDashboardState("iss-telemetry");
    }
  }

  formatSignedCoordinate(value, positiveSuffix, negativeSuffix) {
    const numericValue = Number(value);
    const suffix = numericValue >= 0 ? positiveSuffix : negativeSuffix;
    return `${Math.abs(numericValue).toFixed(2)}° ${suffix}`;
  }

  updateIssStatusCard(data) {
    const dict = I18N[this.lang];
    if (!data) {
      [
        this.ui.issLatitudeValue,
        this.ui.issLongitudeValue,
        this.ui.issAltitudeValue,
        this.ui.issVelocityValue,
      ].forEach((node) => {
        if (node) {
          node.textContent = "—";
        }
      });
      if (this.ui.issTelemetryStatus) {
        this.ui.issTelemetryStatus.textContent = dict.issUnavailable;
        this.ui.issTelemetryStatus.classList.remove("is-nominal");
      }
      return;
    }

    if (this.ui.issLatitudeValue) {
      this.ui.issLatitudeValue.textContent = this.formatSignedCoordinate(data.latitude, "N", "S");
    }
    if (this.ui.issLongitudeValue) {
      this.ui.issLongitudeValue.textContent = this.formatSignedCoordinate(data.longitude, "E", "W");
    }
    if (this.ui.issAltitudeValue) {
      this.ui.issAltitudeValue.textContent = `${Number(data.altitude_km).toFixed(1)} ${this.lang === "ru" ? "км" : "km"}`;
    }
    if (this.ui.issVelocityValue) {
      this.ui.issVelocityValue.textContent = `${Number(data.velocity_kms).toFixed(2)} ${this.lang === "ru" ? "км/с" : "km/s"}`;
    }
    if (this.ui.issTelemetryStatus) {
      this.ui.issTelemetryStatus.textContent = dict.issLive;
      this.ui.issTelemetryStatus.classList.add("is-nominal");
      if (data.timestamp) {
        this.ui.issTelemetryStatus.title = new Date(data.timestamp * 1000).toISOString();
      }
    }
  }

  applyPreset(name) {
    const preset = this.profile.stationPresets[name];
    if (!preset) {
      return;
    }
    this.applySimulationPatch({
      altitudeKm: preset.altitudeKm,
      inclinationDeg: preset.inclinationDeg,
      timeScale: preset.timeScale,
      relayCount: preset.relayCount,
      packetRateMbps: preset.packetRateMbps,
      linkRangeKm: preset.linkRangeKm,
    }, `preset-${name}`);
    this.logEvent(
      I18N[this.lang].presetApplied(I18N[this.lang][`preset${name[0].toUpperCase()}${name.slice(1)}`]),
    );
  }

  getHostBody() {
    return this.profile.planets[this.sim.hostBody] || this.profile.planets.earth;
  }

  getHostRadiusWorld() {
    const host = this.getHostBody();
    return BASE_WORLD_RADIUS * host.orbitScale * this.sim.planetScale;
  }

  getWorldPerKm() {
    const host = this.getHostBody();
    return this.getHostRadiusWorld() / host.radiusKm;
  }

  supportsRelayNetwork() {
    return this.sim.hostBody === "earth";
  }

  getPhysicalOrbitRadiusWorld() {
    return this.getHostRadiusWorld() + this.sim.altitudeKm * this.getWorldPerKm();
  }

  getStationClearanceWorld() {
    const maxDockedExtension = Math.max(0, ...Object.values(this.portExtension));
    return STATION_COLLISION_RADIUS_WORLD + ORBIT_SURFACE_CLEARANCE_WORLD + maxDockedExtension;
  }

  getVisualOrbitOffsetWorld() {
    const minAltitude = Number(this.ui.altitudeKm?.min || 200);
    const maxAltitude = Number(this.ui.altitudeKm?.max || 600);
    const altitudeSpan = Math.max(1, maxAltitude - minAltitude);
    const altitudeT = smoothstep(0, 1, (this.sim.altitudeKm - minAltitude) / altitudeSpan);
    const hostRadiusWorld = this.getHostRadiusWorld();
    const baseOffset = Math.max(12, hostRadiusWorld * 0.2);
    const rangeOffset = Math.max(26, hostRadiusWorld * 0.72);
    return baseOffset + rangeOffset * altitudeT;
  }

  getOrbitRadiusWorld() {
    const hostRadiusWorld = this.getHostRadiusWorld();
    return hostRadiusWorld + this.getStationClearanceWorld() + Math.max(
      this.sim.altitudeKm * this.getWorldPerKm(),
      this.getVisualOrbitOffsetWorld(),
    );
  }

  getCircularOrbitStats() {
    const host = this.getHostBody();
    const radiusKm = host.radiusKm + this.sim.altitudeKm;
    const velocityKms = Math.sqrt(host.muKm3s2 / radiusKm);
    const periodSeconds = 2 * Math.PI * Math.sqrt((radiusKm ** 3) / host.muKm3s2);
    const meanMotionRadSec = Math.sqrt(host.muKm3s2 / (radiusKm ** 3));
    return {
      radiusKm,
      velocityKms,
      periodSeconds,
      meanMotionRadSec,
    };
  }

  recomputeOrbitState() {
    const orbitRadius = this.getOrbitRadiusWorld();
    this.stationPivot.position.set(orbitRadius, 0, 0);
    this.inclinationShell.rotation.z = THREE.MathUtils.degToRad(this.sim.inclinationDeg);
    this.replaceOrbitGuide(this.orbitGuide, orbitRadius, 0x67e8f9, 0.38, this.inclinationShell);
    this.refreshRelayOrbitRings();
    this.updateTelemetry();
  }

  applyPlanetBody() {
    const host = this.getHostBody();
    const hostRadiusWorld = this.getHostRadiusWorld();
    disposeObjectTree(this.hostShell);
    disposeObjectTree(this.ambientShell);
    this.hostShell.clear();
    this.ambientShell.clear();
    this.hostMesh = null;
    this.hostSpecular = null;
    this.hostAtmosphere = null;
    this.hostClouds = null;
    this.hostNightLights = null;

    const map = this.getPlanetMap(this.sim.hostBody, host);
    const surfaceBoost = clamp(this.sim.surfaceContrast, 0.75, 1.85);
    const hostMesh = new THREE.Mesh(
      new THREE.SphereGeometry(hostRadiusWorld, 96, 96),
      new THREE.MeshStandardMaterial({
        map,
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveMap: map,
        emissiveIntensity: 0.018 + (surfaceBoost - 0.75) * 0.055 + this.sim.nightLights * 0.035,
        metalness: clamp(0.03 + this.sim.specularBoost * 0.14, 0.03, 0.18),
        roughness: clamp(0.88 - surfaceBoost * 0.12 - this.sim.specularBoost * 0.14, 0.42, 0.82),
      }),
    );
    hostMesh.material.color.setScalar(clamp(0.78 + surfaceBoost * 0.18, 0.82, 1.12));
    this.hostMesh = hostMesh;
    this.hostShell.add(hostMesh);

    const specularShell = new THREE.Mesh(
      new THREE.SphereGeometry(hostRadiusWorld * 1.004, 96, 96),
      createSpecularSweepMaterial(
        this.sim.hostBody === "mars" ? 0xfb923c : this.sim.hostBody === "venus" ? 0xfcd34d : 0xa5f3fc,
        this.sim.specularBoost,
      ),
    );
    this.hostSpecular = specularShell;
    this.hostShell.add(specularShell);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(hostRadiusWorld * 1.035, 96, 96),
      createAtmosphereShaderMaterial(
        this.sim.hostBody === "mars" ? 0xf97316 : 0x38bdf8,
        this.sim.atmosphereGlow,
      ),
    );
    this.hostAtmosphere = atmosphere;
    this.hostShell.add(atmosphere);

    if (this.sim.hostBody === "earth") {
      const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(hostRadiusWorld * 1.012, 96, 96),
        new THREE.MeshStandardMaterial({
          map: this.getCloudMap(),
          transparent: true,
          opacity: this.sim.cloudOpacity,
          depthWrite: false,
        }),
      );
      this.hostClouds = clouds;
      this.hostShell.add(clouds);
      const nightLights = new THREE.Mesh(
        new THREE.SphereGeometry(hostRadiusWorld * 1.006, 96, 96),
        new THREE.MeshBasicMaterial({
          map: this.getNightLightsMap(),
          transparent: true,
          opacity: this.sim.nightLights,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      this.hostNightLights = nightLights;
      this.hostShell.add(nightLights);
    } else {
      this.hostClouds = null;
      this.hostNightLights = null;
    }

    if (this.sim.hostBody === "saturn") {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(hostRadiusWorld * 1.25, hostRadiusWorld * 2.15, 96),
        new THREE.MeshStandardMaterial({
          color: 0xd6c8a5,
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide,
          metalness: 0.35,
          roughness: 0.78,
        }),
      );
      ring.rotation.x = Math.PI / 2.4;
      this.hostShell.add(ring);
    }

    this.buildAmbientPlanets();
    this.recomputeOrbitState();
    this.rebuildRelays();
    this.updateLightingRig();
    this.resetCamera(true);
    const hostName = this.lang === "ru" ? host.nameRu : host.nameEn;
    this.ui.sceneStatus.textContent = I18N[this.lang].aroundBody(hostName);
  }

  getPlanetMap(bodyKey, body) {
    const usePhotoTexture = this.preferences?.planetTextures !== false;
    const cacheKey = usePhotoTexture ? `planet:${bodyKey}` : `planet:procedural:${bodyKey}`;
    if (!this.textureCache.has(cacheKey)) {
      const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
      const texturePath = PLANET_TEXTURES[bodyKey];
      const texture = usePhotoTexture && texturePath
        ? this.textureLoader.load(
            texturePath,
            (loadedTexture) => {
              applyEnhancedImageToTexture(
                loadedTexture,
                loadedTexture.image,
                bodyKey,
                maxAnisotropy,
              );
            },
            undefined,
            () => {
              const fallbackTexture = createPlanetTexture(bodyKey, body);
              applyEnhancedImageToTexture(texture, fallbackTexture.image, bodyKey, maxAnisotropy);
              fallbackTexture.dispose();
            },
          )
        : createPlanetTexture(bodyKey, body);
      configureTexture(texture, maxAnisotropy);
      this.textureCache.set(cacheKey, texture);
    }
    return this.textureCache.get(cacheKey);
  }

  getCloudMap() {
    if (!this.textureCache.has("clouds:earth")) {
      this.textureCache.set("clouds:earth", createCloudTexture());
    }
    return this.textureCache.get("clouds:earth");
  }

  getNightLightsMap() {
    if (!this.textureCache.has("night:earth")) {
      this.textureCache.set("night:earth", createNightLightsTexture());
    }
    return this.textureCache.get("night:earth");
  }

  updatePlanetVisuals() {
    if (this.hostMesh?.material) {
      const surfaceBoost = clamp(this.sim.surfaceContrast, 0.75, 1.85);
      this.hostMesh.material.emissiveIntensity =
        0.018 + (surfaceBoost - 0.75) * 0.055 + this.sim.nightLights * 0.035;
      this.hostMesh.material.metalness = clamp(0.03 + this.sim.specularBoost * 0.14, 0.03, 0.18);
      this.hostMesh.material.roughness =
        clamp(0.88 - surfaceBoost * 0.12 - this.sim.specularBoost * 0.14, 0.42, 0.82);
      this.hostMesh.material.color.setScalar(clamp(0.78 + surfaceBoost * 0.18, 0.82, 1.12));
      this.hostMesh.material.needsUpdate = true;
    }
    if (this.hostAtmosphere?.material?.uniforms?.intensity) {
      this.hostAtmosphere.material.uniforms.intensity.value = this.sim.atmosphereGlow;
    }
    if (this.hostSpecular?.material?.uniforms) {
      this.hostSpecular.material.uniforms.intensity.value =
        this.sim.specularBoost * (this.sim.hostBody === "moon" ? 0.42 : 1);
    }
    if (this.hostClouds?.material) {
      this.hostClouds.material.opacity = this.sim.hostBody === "earth" ? this.sim.cloudOpacity : 0;
    }
    if (this.hostNightLights?.material) {
      this.hostNightLights.material.opacity = this.sim.hostBody === "earth" ? this.sim.nightLights : 0;
    }
    this.updateLightingRig();
  }

  buildAmbientPlanets() {
    Object.entries(this.profile.planets).forEach(([key, body], index) => {
      if (key === this.sim.hostBody) {
        return;
      }

      const radius = 7 + body.orbitScale * 4;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 48, 48),
        new THREE.MeshStandardMaterial({
          map: this.getPlanetMap(key, body),
          roughness: 0.94,
          metalness: 0.05,
          transparent: true,
          opacity: 0.98,
        }),
      );
      const orbitDistance = 260 + index * 70;
      const angle = index * 1.17;
      mesh.position.set(
        Math.cos(angle) * orbitDistance,
        35 * Math.sin(index * 0.8),
        Math.sin(angle) * orbitDistance,
      );
      mesh.userData = {
        orbitDistance,
        speed: 0.03 + index * 0.004,
        phase: angle,
        drift: 30 + index * 5,
      };
      this.ambientShell.add(mesh);

      if (key === "saturn") {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(radius * 1.35, radius * 2.05, 80),
          new THREE.MeshBasicMaterial({
            color: 0xd6c8a5,
            transparent: true,
            opacity: 0.55,
            side: THREE.DoubleSide,
          }),
        );
        ring.rotation.x = Math.PI / 2.5;
        mesh.add(ring);
      }
    });
  }

  replaceOrbitGuide(existingLine, radius, color, opacity, parent) {
    parent.remove(existingLine);
    if (existingLine.geometry) {
      existingLine.geometry.dispose();
    }
    if (existingLine.material) {
      existingLine.material.dispose();
    }
    const next = createOrbitRing(radius, color, opacity);
    parent.add(next);
    if (existingLine === this.orbitGuide) {
      this.orbitGuide = next;
      this.orbitGuide.visible = this.sim.showOrbitRails;
    }
    return next;
  }

  refreshRelayOrbitRings() {
    const orbitRadius = this.getOrbitRadiusWorld();
    disposeObjectTree(this.relayOrbitShell);
    this.relayOrbitShell.clear();
    this.relayOrbitShell.visible = false;
    if (!this.sim.showOrbitRails || !this.supportsRelayNetwork()) {
      return;
    }

    [1.08, 1.14, 1.2].forEach((scale, index) => {
      const ringShell = new THREE.Group();
      ringShell.rotation.z = THREE.MathUtils.degToRad(
        this.sim.inclinationDeg * 0.72 + index * 14,
      );
      const line = createOrbitRing(orbitRadius * scale + index * 2, 0xfbbf24, 0.16);
      ringShell.add(line);
      this.relayOrbitShell.add(ringShell);
    });
    this.relayOrbitShell.visible = true;
  }

  updateStationAttitude() {
    this.stationAttitude.rotation.set(
      THREE.MathUtils.degToRad(this.sim.pitchDeg),
      THREE.MathUtils.degToRad(this.sim.yawDeg),
      THREE.MathUtils.degToRad(this.sim.rollDeg),
    );
  }

  updateSolarPanels() {
    const angle = THREE.MathUtils.degToRad(this.sim.solarSpreadDeg);
    this.leftSolarMount.rotation.y = angle;
    this.rightSolarMount.rotation.y = angle;
    this.extraSolarMounts.forEach((mount) => {
      mount.rotation.y = angle;
    });
  }

  updateModuleVisibility() {
    const isChecked = (checkbox) => checkbox?.checked ?? true;
    this.stationCoreGroup.visible = isChecked(this.ui.showCore);
    this.stationLabGroup.visible = isChecked(this.ui.showLab);
    this.stationHabGroup.visible = isChecked(this.ui.showHab);
    this.stationPowerGroup.visible = isChecked(this.ui.showPower);
    this.stationDockGroup.visible = isChecked(this.ui.showDock);
    this.stationAntennaGroup.visible = isChecked(this.ui.showAntenna);
  }

  rebuildRelays() {
    this.relays.forEach((relay) => {
      this.relayShell.remove(relay);
      relay.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose?.();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose?.());
          } else {
            child.material.dispose?.();
          }
        }
      });
    });
    this.relays = [];

    this.linkLines.forEach((line) => {
      this.scene.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    });
    this.linkLines = [];

    if (!this.supportsRelayNetwork()) {
      this.sim.activeLinks = 0;
      this.sim.throughputMbps = 0;
      this.refreshRelayOrbitRings();
      this.updateTelemetry();
      return;
    }

    const relayCount = clamp(Math.round(this.sim.relayCount), 2, MAX_RELAYS);
    for (let i = 0; i < relayCount; i += 1) {
      const relay = createRelaySatellite(i);
      this.relayShell.add(relay);
      this.relays.push(relay);

      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(),
          new THREE.Vector3(0, 0, 1),
        ]),
        new THREE.LineBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.0,
          blending: THREE.AdditiveBlending,
        }),
      );
      line.visible = false;
      this.scene.add(line);
      this.linkLines.push(line);
    }
    this.refreshRelayOrbitRings();
    this.updateTelemetry();
  }

  attachModuleToStation(module, moduleType, placement) {
    this.placeModuleAtPort(module, placement);
    this.stationAttitude.add(module);
    this.dynamicModules.push(module);
    this.portExtension[placement.portKey] += getModuleChainStep(placement.length);
    if (module.userData.solarMounts?.length) {
      this.extraSolarMounts.push(...module.userData.solarMounts);
      this.updateSolarPanels();
    }
    this.sim.moduleCount = 6 + this.dynamicModules.length;
    this.recomputeOrbitState();
    return { module, moduleType, portKey: placement.portKey };
  }

  loadBuilderConfiguration() {
    const config = readBuilderConfiguration();
    const modules = config?.modules || [];
    if (!modules.length) {
      return;
    }

    let loadedCount = 0;
    modules.forEach((item) => {
      const moduleType = BUILDER_TO_SIM_MODULE[item.moduleType] || item.moduleType;
      if (!MODULE_I18N_KEY[moduleType] || !PORTS[item.portKey]) {
        return;
      }
      const module = createDockableModule(moduleType);
      const placement = this.getPortPlacement(module, item.portKey);
      this.attachModuleToStation(module, moduleType, placement);
      loadedCount += 1;
    });

    if (loadedCount > 0) {
      this.logEvent(I18N[this.lang].constructorLoaded(loadedCount));
    }
    this.syncDashboardState("builder-load");
  }

  resetStation() {
    if (this.activeDocking) {
      this.stationAttitude.remove(this.activeDocking.module);
      this.activeDocking = null;
      this.dockingGuide.visible = false;
    }
    this.dynamicModules.forEach((moduleGroup) => {
      this.stationAttitude.remove(moduleGroup);
      disposeObjectTree(moduleGroup);
    });
    this.dynamicModules = [];
    this.extraSolarMounts = [];
    Object.keys(this.portExtension).forEach((key) => {
      this.portExtension[key] = 0;
    });
    this.sim.moduleCount = 6;
    this.sim.dockingState = "idle";
    this.lockedHoldSec = 0;
    this.recomputeOrbitState();
    this.updateTelemetry();
    this.syncDashboardState("station-reset");
    this.logEvent(I18N[this.lang].stationReset);
  }

  getPortPlacement(module, portKey) {
    const safePortKey = PORTS[portKey] ? portKey : "forward";
    const portConfig = PORTS[safePortKey];
    const direction = portConfig.dir.clone().normalize();
    const length = module.userData.length || 10;
    const targetDistance =
      portConfig.baseOffset
      + this.portExtension[safePortKey]
      + getModuleVisualHalf(length)
      - DOCK_RING_OVERLAP;
    return {
      portKey: safePortKey,
      direction,
      length,
      target: direction.clone().multiplyScalar(targetDistance),
    };
  }

  placeModuleAtPort(module, placement) {
    module.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), placement.direction);
    module.position.copy(placement.target);
  }

  getDockingHitTargets() {
    return [
      this.stationCoreGroup,
      this.stationLabGroup,
      this.stationHabGroup,
      this.stationPowerGroup,
      this.stationDockGroup,
      this.stationAntennaGroup,
      this.stationClickProxy,
      ...this.dynamicModules,
    ].filter((target) => target?.visible !== false);
  }

  findStationHit(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    this.pointer.y = -(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(this.getDockingHitTargets(), true)[0] || null;
  }

  isPointerNearProjectedStation(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const stationWorld = this.stationAttitude.getWorldPosition(new THREE.Vector3());
    const projected = stationWorld.project(this.camera);
    const stationX = ((projected.x + 1) / 2) * rect.width + rect.left;
    const stationY = ((-projected.y + 1) / 2) * rect.height + rect.top;
    const hitRadius = Math.min(rect.width, rect.height) * 0.24;
    return Math.hypot(event.clientX - stationX, event.clientY - stationY) <= hitRadius;
  }

  getPortForStationHit(hit) {
    if (!hit?.point) {
      return this.getLeastExtendedPort();
    }

    const localPoint = this.stationAttitude.worldToLocal(hit.point.clone());
    if (localPoint.lengthSq() < 0.01) {
      return this.getLeastExtendedPort();
    }

    const hitDirection = localPoint.normalize();
    const best = Object.entries(PORTS).reduce(
      (candidate, [portKey, port]) => {
        const score = hitDirection.dot(port.dir.clone().normalize());
        return score > candidate.score ? { portKey, score } : candidate;
      },
      { portKey: "forward", score: -Infinity },
    );

    return best.score > 0.18 ? best.portKey : this.getLeastExtendedPort();
  }

  getLeastExtendedPort() {
    return Object.keys(PORTS).reduce((bestKey, portKey) => (
      this.portExtension[portKey] < this.portExtension[bestKey] ? portKey : bestKey
    ), "forward");
  }

  getNextClickDockingModuleType() {
    return CLICK_DOCKING_MODULE_SEQUENCE[
      this.dynamicModules.length % CLICK_DOCKING_MODULE_SEQUENCE.length
    ];
  }

  handleScenePointerDown(event) {
    if (this.freeCamera.active) {
      return;
    }
    if (!this.sim.dockingMode) {
      return;
    }
    if (event.button !== undefined && event.button !== 0) {
      return;
    }
    this.scenePointerDown = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };
  }

  handleScenePointerUp(event) {
    if (this.freeCamera.active) {
      this.scenePointerDown = null;
      return;
    }
    if (!this.sim.dockingMode) {
      this.scenePointerDown = null;
      return;
    }
    if (!this.scenePointerDown || event.pointerId !== this.scenePointerDown.pointerId) {
      this.scenePointerDown = null;
      return;
    }

    const move = Math.hypot(
      event.clientX - this.scenePointerDown.x,
      event.clientY - this.scenePointerDown.y,
    );
    this.scenePointerDown = null;
    if (move > 6 || this.activeDocking) {
      return;
    }

    this.startDockingFromSceneEvent(event);
  }

  handleSceneClick(event) {
    if (this.freeCamera.active) {
      return;
    }
    if (!this.sim.dockingMode) {
      return;
    }
    this.startDockingFromSceneEvent(event);
  }

  startDockingFromSceneEvent(event) {
    if (!this.sim.dockingMode || this.activeDocking) {
      return;
    }

    const hit = this.findStationHit(event);
    if (!hit) {
      return;
    }
    event.preventDefault();
    this.startDocking({
      moduleType: this.getNextClickDockingModuleType(),
      portKey: this.getPortForStationHit(hit),
    });
  }

  startDocking(options = {}) {
    if (this.activeDocking) {
      return;
    }

    const requestedModuleType =
      options.moduleType || this.getOptionGroupValue(this.ui.dockModuleType, "science");
    const moduleType = MODULE_I18N_KEY[requestedModuleType] ? requestedModuleType : "science";
    const portKey = options.portKey || this.getOptionGroupValue(this.ui.dockPort, "forward");
    const module = createDockableModule(moduleType);
    const placement = this.getPortPlacement(module, portKey);
    const { direction, length, target } = placement;
    const lateral = new THREE.Vector3(-direction.z, direction.x * 0.2, direction.y).multiplyScalar(1.8);
    const spawn = target
      .clone()
      .add(direction.clone().multiplyScalar(34 + this.sim.approachSpeed * 3))
      .add(lateral);

    this.placeModuleAtPort(module, { ...placement, target: spawn });
    this.stationAttitude.add(module);

    this.activeDocking = {
      module,
      moduleType,
      portKey: placement.portKey,
      target,
      spawn,
      progress: 0,
      length,
    };
    this.sim.dockingState = "approach";
    this.lockedHoldSec = 0;
    this.updateDockingGuide(spawn, target);
    this.logEvent(
      I18N[this.lang].dockingStarted(
        I18N[this.lang][MODULE_I18N_KEY[moduleType]],
        I18N[this.lang][PORT_I18N_KEY[placement.portKey]],
      ),
    );
  }

  updateDockingGuide(start, end) {
    this.dockingGuide.geometry.dispose();
    this.dockingGuide.geometry = new THREE.BufferGeometry().setFromPoints([
      start,
      end,
    ]);
    this.dockingGuide.visible = true;
  }

  stepDocking(dt) {
    if (!this.activeDocking) {
      if (this.sim.dockingState === "locked") {
        this.lockedHoldSec += dt;
        if (this.lockedHoldSec > 1.8) {
          this.sim.dockingState = "idle";
          this.lockedHoldSec = 0;
        }
      }
      return;
    }

    this.activeDocking.progress = clamp(
      this.activeDocking.progress + dt * (0.18 + this.sim.approachSpeed * 0.085),
      0,
      1,
    );
    const t = smoothstep(0, 1, this.activeDocking.progress);
    this.activeDocking.module.position.lerpVectors(
      this.activeDocking.spawn,
      this.activeDocking.target,
      t,
    );

    const wobble = Math.sin(this.activeDocking.progress * Math.PI * 8) *
      (1 - this.activeDocking.progress) *
      0.08;
    this.activeDocking.module.rotation.x += wobble;
    this.activeDocking.module.rotation.y += wobble * 0.6;

    if (this.activeDocking.progress > 0.82) {
      this.sim.dockingState = "capture";
    }

    if (this.activeDocking.progress >= 1) {
      const { module, moduleType, portKey, length } = this.activeDocking;
      this.attachModuleToStation(module, moduleType, {
        portKey,
        direction: PORTS[portKey].dir.clone().normalize(),
        length,
        target: this.activeDocking.target,
      });
      this.sim.dockingState = "locked";
      this.activeDocking = null;
      this.dockingGuide.visible = false;
      this.lockedHoldSec = 0;
      this.logEvent(
        I18N[this.lang].dockingFinished(
          I18N[this.lang][MODULE_I18N_KEY[moduleType]],
          I18N[this.lang][PORT_I18N_KEY[portKey]],
        ),
      );
    }
  }

  updateRelays(simulatedDeltaSec) {
    if (!this.supportsRelayNetwork()) {
      this.sim.activeLinks = 0;
      this.sim.throughputMbps = 0;
      this.linkLines.forEach((line) => {
        line.visible = false;
        line.material.opacity = 0;
      });
      this.relayShell.rotation.y = 0;
      return;
    }

    const orbitRadius = this.getOrbitRadiusWorld();
    const hostRadius = this.getHostRadiusWorld();
    const worldPerKm = this.getWorldPerKm();
    const linkRangeWorld = this.sim.linkRangeKm * worldPerKm;
    const stationPos = this.stationPivot.getWorldPosition(new THREE.Vector3());
    const hostStats = this.getCircularOrbitStats();
    const dict = I18N[this.lang];

    let activeCount = 0;
    this.relays.forEach((relay, index) => {
      const meta = relay.userData;
      const phase =
        meta.phaseSeed + this.missionElapsedSec * hostStats.meanMotionRadSec * meta.speedScale;
      const radius = orbitRadius * meta.radiusScale + 6;
      const tilt = meta.planeTilt + THREE.MathUtils.degToRad(this.sim.inclinationDeg * 0.35);
      const x = Math.cos(phase) * radius;
      const z = Math.sin(phase) * radius;
      const y = Math.sin(phase * 0.8 + meta.phaseSeed) * radius * 0.14;
      relay.position.set(x, y, z).applyAxisAngle(new THREE.Vector3(0, 0, 1), tilt);
      relay.rotation.y = -phase * 0.6;
      relay.rotation.x = 0.2 * Math.sin(phase * 0.7);

      const relayPos = relay.getWorldPosition(new THREE.Vector3());
      const distance = stationPos.distanceTo(relayPos);
      const blocked = lineBlockedByPlanet(stationPos, relayPos, hostRadius * 0.99);
      const antennaVisible = this.ui.showAntenna?.checked ?? true;
      const isActive =
        this.sim.showLinks &&
        distance <= linkRangeWorld &&
        !blocked &&
        antennaVisible;

      const line = this.linkLines[index];
      if (isActive) {
        activeCount += 1;
        line.visible = true;
        line.material.opacity =
          0.16 + 0.8 * (this.sim.antennaPowerPct / 100) *
          (1 - this.sim.interferencePct / 100);
        line.material.color.setHSL(0.52 - 0.08 * (this.sim.interferencePct / 100), 1, 0.58);
        line.geometry.setFromPoints([stationPos, relayPos]);
      } else {
        line.visible = false;
        line.material.opacity = 0;
      }
    });

    this.sim.activeLinks = activeCount;
    this.sim.throughputMbps = Math.round(
      activeCount *
        this.sim.packetRateMbps *
        (this.sim.antennaPowerPct / 100) *
        (1 - this.sim.interferencePct / 100),
    );

    if (activeCount === 0 && this.sim.showLinks && this.sim.dockingState === "idle") {
      this.ui.sceneStatus.textContent = dict.aroundBody(
        this.lang === "ru"
          ? this.getHostBody().nameRu
          : this.getHostBody().nameEn,
      );
    }

    this.relayShell.rotation.y += simulatedDeltaSec * 0.00005;
  }

  animateAmbient(simulatedDeltaSec) {
    this.hostShell.rotation.y += simulatedDeltaSec * 0.000018 * Math.sign(this.getHostBody().rotationHours || 1);
    if (this.hostClouds) {
      this.hostClouds.rotation.y += simulatedDeltaSec * 0.000038;
    }
    this.ambientShell.children.forEach((mesh, index) => {
      const meta = mesh.userData;
      const phase = meta.phase + this.missionElapsedSec * 0.0000035 * meta.speed;
      mesh.position.set(
        Math.cos(phase) * meta.orbitDistance,
        Math.sin(phase * 0.7 + index) * meta.drift,
        Math.sin(phase) * meta.orbitDistance,
      );
      mesh.rotation.y += simulatedDeltaSec * 0.00004 * (index % 2 ? 1 : -1);
    });
    this.stars.rotation.y += simulatedDeltaSec * 0.000002;
  }

  trackStationCamera() {
    const stationWorld = this.stationPivot.getWorldPosition(new THREE.Vector3());
    const focus = stationWorld.clone().multiplyScalar(0.42);
    const delta = focus.clone().sub(this.controls.target);
    this.controls.target.copy(focus);
    this.camera.position.add(delta);
  }

  resetCamera() {
    const stationWorld = this.stationPivot.getWorldPosition(new THREE.Vector3());
    const focus = stationWorld.clone().multiplyScalar(0.42);
    const offset = new THREE.Vector3(0, 36, 230);
    this.camera.position.copy(focus.clone().add(offset));
    this.controls.target.copy(focus);
    this.controls.update();
  }

  updateTelemetry() {
    const stats = this.getCircularOrbitStats();
    const dict = I18N[this.lang];
    const engineering = this.computeEngineeringState();
    const orbitPeriodLabel = `${(stats.periodSeconds / 60).toFixed(1)} ${this.lang === "ru" ? "мин" : "min"}`;
    const orbitalVelocityLabel = `${stats.velocityKms.toFixed(2)} ${this.lang === "ru" ? "км/с" : "km/s"}`;
    this.ui.orbitPeriodValue.textContent = orbitPeriodLabel;
    this.ui.orbitalVelocityValue.textContent = orbitalVelocityLabel;
    if (this.ui.orbitPeriodValueMirror) {
      this.ui.orbitPeriodValueMirror.textContent = orbitPeriodLabel;
    }
    if (this.ui.orbitalVelocityValueMirror) {
      this.ui.orbitalVelocityValueMirror.textContent = orbitalVelocityLabel;
    }
    this.ui.activeLinksValue.textContent = `${this.sim.activeLinks} / ${this.relays.length}`;
    this.ui.throughputValue.textContent = `${this.sim.throughputMbps} ${this.lang === "ru" ? "Мбит/с" : "Mbps"}`;
    this.ui.moduleCountValue.textContent = `${this.sim.moduleCount}`;
    this.ui.dockingStateValue.textContent = dict[this.sim.dockingState];
    const missionUtcDate = getMissionUtcDate(this.missionElapsedSec);
    this.ui.missionDate.textContent = formatUtcDate(missionUtcDate);
    this.ui.missionClock.textContent = formatUtcTime(missionUtcDate);
    if (this.ui.missionElapsedValue) {
      this.ui.missionElapsedValue.textContent = formatClock(this.missionElapsedSec);
    }
    this.ui.fpsValue.textContent = `${Math.round(this.fpsValue)}`;
    if (this.ui.timeScaleReadout) {
      this.ui.timeScaleReadout.textContent = `${this.sim.timeScale.toFixed(1)}x`;
    }
    this.updateEngineeringPanel(engineering);
  }

  logEvent(message) {
    if (!this.ui.eventLog) {
      return;
    }
    const eventRow = document.createElement("div");
    eventRow.className = "event-row";
    const time = document.createElement("time");
    time.textContent = formatClock(this.missionElapsedSec);
    const text = document.createElement("span");
    text.textContent = message;
    eventRow.append(time, text);
    this.ui.eventLog.prepend(eventRow);
    while (this.ui.eventLog.children.length > 32) {
      this.ui.eventLog.lastElementChild.remove();
    }
  }

  syncDashboardState(source = "simulator") {
    const engineering = this.computeEngineeringState();
    window.issDashboardState?.update?.((state) => {
      state.orbit = {
        hostBody: this.sim.hostBody,
        altitudeKm: Number(this.sim.altitudeKm),
        inclinationDeg: Number(this.sim.inclinationDeg),
        timeScale: Number(this.sim.timeScale),
      };
      state.engineering = {
        powerScore: Math.round(engineering.powerScore),
        thermalScore: Math.round(engineering.thermalScore),
        commsScore: Math.round(engineering.commsScore),
        dockingScore: Math.round(engineering.dockingScore),
        riskScore: Math.round(engineering.riskScore),
        recommendation: engineering.recommendation,
        updatedAt: Date.now(),
      };
      state.telemetry = {
        ...state.telemetry,
        updatedAt: Date.now(),
        activeLinks: this.sim.activeLinks,
        throughputMbps: this.sim.throughputMbps,
        relayCount: this.sim.relayCount,
        linkRangeKm: this.sim.linkRangeKm,
        packetRateMbps: this.sim.packetRateMbps,
        iss: this.lastIssTelemetry
          ? {
              latitude: this.lastIssTelemetry.latitude,
              longitude: this.lastIssTelemetry.longitude,
              altitudeKm: this.lastIssTelemetry.altitude_km,
              velocityKms: this.lastIssTelemetry.velocity_kms,
              timestamp: this.lastIssTelemetry.timestamp,
            }
          : null,
      };
      return state;
    }, source);
  }

  resize() {
    const rect = this.mount.getBoundingClientRect();
    this.camera.aspect = rect.width / Math.max(rect.height, 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(rect.width, rect.height, false);
  }

  updateSceneStatus() {
    const dict = I18N[this.lang];
    if (this.freeCamera.active) {
      this.ui.sceneStatus.textContent = dict.freeCameraActive;
      return;
    }
    if (this.sim.dockingState !== "idle") {
      this.ui.sceneStatus.textContent = dict[this.sim.dockingState];
      return;
    }
    if (this.sim.dockingMode) {
      this.ui.sceneStatus.textContent = dict.dockingModeStatus;
      return;
    }
    const hostName =
      this.lang === "ru" ? this.getHostBody().nameRu : this.getHostBody().nameEn;
    this.ui.sceneStatus.textContent = dict.aroundBody(hostName);
  }

  updateFps() {
    this.framesSinceSample += 1;
    const now = performance.now();
    const elapsed = now - this.lastFpsSample;
    if (elapsed >= 500) {
      const instantFps = (this.framesSinceSample * 1000) / elapsed;
      this.fpsValue = this.fpsValue * 0.7 + instantFps * 0.3;
      this.framesSinceSample = 0;
      this.lastFpsSample = now;
    }
  }

  animate() {
    const rawDelta = Math.min(this.clock.getDelta(), 0.05);
    const simulatedDeltaSec =
      this.sim.isPlaying && !this.sim.dockingMode ? rawDelta * this.sim.timeScale * 180 : 0;
    this.advanceMissionTime(simulatedDeltaSec);

    this.stepDocking(rawDelta);
    this.animateAmbient(simulatedDeltaSec);
    this.updateRelays(simulatedDeltaSec);
    if (this.freeCamera.active) {
      this.updateFreeCamera(rawDelta);
    } else {
      this.trackStationCamera();
    }
    this.updateSceneStatus();
    this.updateFps();
    this.updateTelemetry();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

async function bootstrap() {
  const response = await fetch("/api/mission-profile", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Mission profile request failed: ${response.status}`);
  }
  const profile = await response.json();
  new SpaceTwinApp(profile);
}

bootstrap().catch((error) => {
  console.error(error);
  const mount = $("sceneMount");
  const fallback = document.createElement("div");
  fallback.style.padding = "24px";
  fallback.style.color = "#f8fafc";
  fallback.style.lineHeight = "1.5";
  fallback.textContent = I18N.ru.loadingError;
  mount.appendChild(fallback);
});
