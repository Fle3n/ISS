import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


const BASE_WORLD_RADIUS = 42;
const MAX_RELAYS = 18;
const PORTS = {
  forward: { dir: new THREE.Vector3(1, 0, 0), baseOffset: 19.5 },
  aft: { dir: new THREE.Vector3(-1, 0, 0), baseOffset: 17.2 },
  zenith: { dir: new THREE.Vector3(0, 1, 0), baseOffset: 8.8 },
  nadir: { dir: new THREE.Vector3(0, -1, 0), baseOffset: 8.8 },
  starboard: { dir: new THREE.Vector3(0, 0, 1), baseOffset: 17.8 },
  port: { dir: new THREE.Vector3(0, 0, -1), baseOffset: 17.8 },
};

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
    orbitHint: "Высота, наклонение, скорость и масштаб",
    hostBody: "Центральное тело",
    altitude: "Высота орбиты, км",
    inclination: "Наклонение, °",
    timeScale: "Скорость времени",
    planetScale: "Масштаб планеты",
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
    sceneLabel: "3D-визуализация",
    fpsLabel: "FPS",
    missionClock: "T+",
    dockingTitle: "Стыковка и расширение",
    dockingHint: "Выбор модуля, порта и скорости сближения",
    moduleType: "Тип нового модуля",
    dockScience: "Научный модуль",
    dockHabitat: "Жилой модуль",
    dockCargo: "Грузовой модуль",
    dockPower: "Солнечная ферма",
    dockRelay: "Антенный модуль",
    dockPort: "Узел стыковки",
    portForward: "Передний",
    portAft: "Задний",
    portZenith: "Зенит",
    portNadir: "Надир",
    portStarboard: "Правый борт",
    portLeft: "Левый борт",
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
    loadingError:
      "Не удалось загрузить 3D-прототип. Проверьте соединение с CDN Three.js.",
    sourceLabel: "Использование",
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
    orbitHint: "Altitude, inclination, time scale, and visual scale",
    hostBody: "Central body",
    altitude: "Orbit altitude, km",
    inclination: "Inclination, °",
    timeScale: "Time scale",
    planetScale: "Planet scale",
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
    sceneLabel: "3D visualization",
    fpsLabel: "FPS",
    missionClock: "T+",
    dockingTitle: "Docking and expansion",
    dockingHint: "Choose module, port, and approach speed",
    moduleType: "New module type",
    dockScience: "Science module",
    dockHabitat: "Habitation module",
    dockCargo: "Cargo module",
    dockPower: "Solar wing",
    dockRelay: "Antenna module",
    dockPort: "Docking port",
    portForward: "Forward",
    portAft: "Aft",
    portZenith: "Zenith",
    portNadir: "Nadir",
    portStarboard: "Starboard",
    portLeft: "Port",
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
    loadingError:
      "Could not load the 3D prototype. Check the Three.js CDN connection.",
    sourceLabel: "Usage",
  },
};

const MODULE_I18N_KEY = {
  science: "dockScience",
  habitat: "dockHabitat",
  cargo: "dockCargo",
  power: "dockPower",
  relay: "dockRelay",
};

const PORT_I18N_KEY = {
  forward: "portForward",
  aft: "portAft",
  zenith: "portZenith",
  nadir: "portNadir",
  starboard: "portStarboard",
  port: "portLeft",
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
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const sec = safeSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
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
  const configs = {
    science: { length: 12, radius: 2.5, body: 0x99f6e4, accent: 0x22d3ee },
    habitat: { length: 10.5, radius: 3.15, body: 0xf8fafc, accent: 0xfbbf24 },
    cargo: { length: 9.2, radius: 2.35, body: 0xd6d3d1, accent: 0xfb7185 },
    power: { length: 8.5, radius: 1.8, body: 0xb0bec5, accent: 0x60a5fa },
    relay: { length: 7.8, radius: 1.9, body: 0xe2e8f0, accent: 0x67e8f9 },
  };
  const cfg = configs[type] || configs.science;
  const group = createModuleCore(cfg.length, cfg.radius, cfg.body, cfg.accent);

  if (type === "power") {
    const leftPanel = createSolarPanels(14, 5.2, 0x1d4ed8);
    const rightPanel = createSolarPanels(14, 5.2, 0x1d4ed8);
    leftPanel.position.set(0, 0, 9.2);
    rightPanel.position.set(0, 0, -9.2);
    group.add(leftPanel, rightPanel);
  }

  if (type === "relay") {
    const dishTop = createDish(2.2);
    dishTop.position.set(cfg.length * 0.15, cfg.radius + 2.5, 0);
    group.add(dishTop);
  }

  if (type === "habitat") {
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

class SpaceTwinApp {
  constructor(profile) {
    this.profile = profile;
    this.lang = "ru";
    this.mount = $("sceneMount");
    this.textureCache = new Map();
    this.dynamicModules = [];
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

    this.sim = {
      hostBody: profile.defaultHost,
      altitudeKm: profile.stationPresets.engineering.altitudeKm,
      inclinationDeg: profile.stationPresets.engineering.inclinationDeg,
      timeScale: profile.stationPresets.engineering.timeScale,
      planetScale: 1,
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
      showOrbitRails: true,
      dockingState: "idle",
      activeLinks: 0,
      throughputMbps: 0,
      moduleCount: 6,
    };

    Object.keys(PORTS).forEach((key) => {
      this.portExtension[key] = 0;
    });

    this.ui = this.collectUi();
    this.buildScene();
    this.buildStation();
    this.renderHostOptions();
    this.renderSourceList();
    this.bindUi();
    this.applyLanguage();
    this.applyPlanetBody();
    this.updateModuleVisibility();
    this.updateStationAttitude();
    this.updateSolarPanels();
    this.rebuildRelays();
    this.resize();
    this.resetCamera();
    this.logEvent(I18N[this.lang].orbitReady);

    window.addEventListener("resize", () => this.resize());
    this.renderer.setAnimationLoop(() => this.animate());
  }

  collectUi() {
    return {
      languageToggle: $("languageToggle"),
      cameraHome: $("cameraHome"),
      hostBody: $("hostBody"),
      altitudeKm: $("altitudeKm"),
      altitudeValue: $("altitudeValue"),
      inclinationDeg: $("inclinationDeg"),
      inclinationValue: $("inclinationValue"),
      timeScale: $("timeScale"),
      timeScaleValue: $("timeScaleValue"),
      planetScale: $("planetScale"),
      planetScaleValue: $("planetScaleValue"),
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
      dockModuleType: $("dockModuleType"),
      dockPort: $("dockPort"),
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
      missionClock: $("missionClock"),
      orbitPeriodValue: $("orbitPeriodValue"),
      orbitalVelocityValue: $("orbitalVelocityValue"),
      activeLinksValue: $("activeLinksValue"),
      throughputValue: $("throughputValue"),
      moduleCountValue: $("moduleCountValue"),
      dockingStateValue: $("dockingStateValue"),
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
    this.scene.add(ambient, sun);

    const sunMarker = new THREE.Mesh(
      new THREE.SphereGeometry(8, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xfef3c7 }),
    );
    sunMarker.position.copy(sun.position.clone().normalize().multiplyScalar(480));
    this.scene.add(sunMarker);

    this.stars = createStars(11000);
    this.scene.add(this.stars);

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

    const core = createModuleCore(11.5, 3.25, 0xe2e8f0, 0x67e8f9);
    this.stationCoreGroup.add(core);

    const lab = createModuleCore(9.8, 2.6, 0xc4f1f9, 0x22d3ee);
    lab.position.x = 12.8;
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

    const hab = createModuleCore(8.5, 3.05, 0xf8fafc, 0xfbbf24);
    hab.position.x = -11.4;
    this.stationHabGroup.add(hab);

    const node = new THREE.Mesh(
      new THREE.SphereGeometry(4.35, 36, 36),
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
      new THREE.BoxGeometry(1.7, 1.7, 25),
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
    this.leftSolarMount.position.z = -14.8;
    this.rightSolarMount.position.z = 14.8;
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
    this.stationAttitude.add(
      this.stationCoreGroup,
      this.stationLabGroup,
      this.stationHabGroup,
      this.stationPowerGroup,
      this.stationDockGroup,
      this.stationAntennaGroup,
      stationLabel,
    );
  }

  renderHostOptions() {
    const current = this.sim.hostBody;
    this.ui.hostBody.innerHTML = "";
    Object.entries(this.profile.planets).forEach(([key, body]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = this.lang === "ru" ? body.nameRu : body.nameEn;
      this.ui.hostBody.appendChild(option);
    });
    this.ui.hostBody.value = current;
  }

  renderSourceList() {
    this.ui.sourceList.innerHTML = "";
    this.profile.openDataSources.forEach((source) => {
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
      (value) => `${value.toFixed(2)}x`,
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
    ].forEach((checkbox) =>
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

    this.ui.showLinks.addEventListener("change", () => {
      this.sim.showLinks = this.ui.showLinks.checked;
    });
    this.ui.showOrbitRails.addEventListener("change", () => {
      this.sim.showOrbitRails = this.ui.showOrbitRails.checked;
      this.orbitGuide.visible = this.sim.showOrbitRails;
      this.relayOrbitShell.visible = this.sim.showOrbitRails;
    });

    this.ui.hostBody.addEventListener("change", () => {
      this.sim.hostBody = this.ui.hostBody.value;
      this.applyPlanetBody();
      const name =
        this.lang === "ru"
          ? this.profile.planets[this.sim.hostBody].nameRu
          : this.profile.planets[this.sim.hostBody].nameEn;
      this.logEvent(I18N[this.lang].aroundBody(name));
    });

    this.ui.languageToggle.addEventListener("click", () => {
      this.lang = this.lang === "ru" ? "en" : "ru";
      this.applyLanguage();
    });
    this.ui.cameraHome.addEventListener("click", () => this.resetCamera());
    this.ui.launchDocking.addEventListener("click", () => this.startDocking());
    this.ui.resetStation.addEventListener("click", () => this.resetStation());

    this.ui.presetButtons.forEach((button) => {
      button.addEventListener("click", () => this.applyPreset(button.dataset.preset));
    });
  }

  bindRange(slider, output, onChange, formatter = (value) => `${value}`) {
    const emit = () => {
      const numericValue = Number(slider.value);
      output.textContent = formatter(numericValue);
      onChange(numericValue);
      this.updateTelemetry();
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
    this.ui.languageToggle.textContent = this.lang === "ru" ? "EN" : "RU";
    this.renderHostOptions();
    this.renderSourceList();
    this.updateTelemetry();
    const hostName =
      this.lang === "ru"
        ? this.profile.planets[this.sim.hostBody].nameRu
        : this.profile.planets[this.sim.hostBody].nameEn;
    this.ui.sceneStatus.textContent = dict.aroundBody(hostName);
  }

  applyPreset(name) {
    const preset = this.profile.stationPresets[name];
    if (!preset) {
      return;
    }
    this.ui.altitudeKm.value = preset.altitudeKm;
    this.ui.inclinationDeg.value = preset.inclinationDeg;
    this.ui.timeScale.value = preset.timeScale;
    this.ui.relayCount.value = preset.relayCount;
    this.ui.packetRateMbps.value = preset.packetRateMbps;
    this.ui.linkRangeKm.value = preset.linkRangeKm;

    this.sim.altitudeKm = preset.altitudeKm;
    this.sim.inclinationDeg = preset.inclinationDeg;
    this.sim.timeScale = preset.timeScale;
    this.sim.relayCount = preset.relayCount;
    this.sim.packetRateMbps = preset.packetRateMbps;
    this.sim.linkRangeKm = preset.linkRangeKm;

    this.ui.altitudeValue.textContent = `${preset.altitudeKm}`;
    this.ui.inclinationValue.textContent = preset.inclinationDeg.toFixed(1);
    this.ui.timeScaleValue.textContent = `${preset.timeScale.toFixed(1)}x`;
    this.ui.relayCountValue.textContent = `${preset.relayCount}`;
    this.ui.packetRateValue.textContent = `${preset.packetRateMbps}`;
    this.ui.linkRangeValue.textContent = `${preset.linkRangeKm}`;

    this.applyPlanetBody();
    this.rebuildRelays();
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

  getOrbitRadiusWorld() {
    return this.getHostRadiusWorld() + this.sim.altitudeKm * this.getWorldPerKm();
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

    const map = this.getPlanetMap(this.sim.hostBody, host);
    const hostMesh = new THREE.Mesh(
      new THREE.SphereGeometry(hostRadiusWorld, 96, 96),
      new THREE.MeshStandardMaterial({
        map,
        metalness: 0.08,
        roughness: 0.95,
      }),
    );
    this.hostShell.add(hostMesh);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(hostRadiusWorld * 1.035, 96, 96),
      new THREE.MeshBasicMaterial({
        color: this.sim.hostBody === "mars" ? 0xf97316 : 0x38bdf8,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.hostShell.add(atmosphere);

    if (this.sim.hostBody === "earth") {
      const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(hostRadiusWorld * 1.012, 96, 96),
        new THREE.MeshStandardMaterial({
          map: this.getCloudMap(),
          transparent: true,
          opacity: 0.82,
          depthWrite: false,
        }),
      );
      this.hostClouds = clouds;
      this.hostShell.add(clouds);
    } else {
      this.hostClouds = null;
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
    this.resetCamera(true);
    const hostName = this.lang === "ru" ? host.nameRu : host.nameEn;
    this.ui.sceneStatus.textContent = I18N[this.lang].aroundBody(hostName);
  }

  getPlanetMap(bodyKey, body) {
    const cacheKey = `planet:${bodyKey}`;
    if (!this.textureCache.has(cacheKey)) {
      this.textureCache.set(cacheKey, createPlanetTexture(bodyKey, body));
    }
    return this.textureCache.get(cacheKey);
  }

  getCloudMap() {
    if (!this.textureCache.has("clouds:earth")) {
      this.textureCache.set("clouds:earth", createCloudTexture());
    }
    return this.textureCache.get("clouds:earth");
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
    if (!this.sim.showOrbitRails) {
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
    this.relayOrbitShell.visible = this.sim.showOrbitRails;
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
    this.rightSolarMount.rotation.y = -angle;
  }

  updateModuleVisibility() {
    this.stationCoreGroup.visible = this.ui.showCore.checked;
    this.stationLabGroup.visible = this.ui.showLab.checked;
    this.stationHabGroup.visible = this.ui.showHab.checked;
    this.stationPowerGroup.visible = this.ui.showPower.checked;
    this.stationDockGroup.visible = this.ui.showDock.checked;
    this.stationAntennaGroup.visible = this.ui.showAntenna.checked;
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

  resetStation() {
    if (this.activeDocking) {
      this.stationAttitude.remove(this.activeDocking.module);
      this.activeDocking = null;
      this.dockingGuide.visible = false;
    }
    this.dynamicModules.forEach((moduleGroup) => {
      this.stationAttitude.remove(moduleGroup);
      moduleGroup.traverse((child) => {
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
    this.dynamicModules = [];
    Object.keys(this.portExtension).forEach((key) => {
      this.portExtension[key] = 0;
    });
    this.sim.moduleCount = 6;
    this.sim.dockingState = "idle";
    this.lockedHoldSec = 0;
    this.updateTelemetry();
    this.logEvent(I18N[this.lang].stationReset);
  }

  startDocking() {
    if (this.activeDocking) {
      return;
    }

    const moduleType = this.ui.dockModuleType.value;
    const portKey = this.ui.dockPort.value;
    const portConfig = PORTS[portKey];
    const module = createDockableModule(moduleType);
    const direction = portConfig.dir.clone().normalize();

    const length = module.userData.length || 10;
    const targetDistance =
      portConfig.baseOffset + this.portExtension[portKey] + length * 0.5 + 0.85;
    const target = direction.clone().multiplyScalar(targetDistance);
    const lateral = new THREE.Vector3(-direction.z, direction.x * 0.2, direction.y).multiplyScalar(1.8);
    const spawn = target
      .clone()
      .add(direction.clone().multiplyScalar(34 + this.sim.approachSpeed * 3))
      .add(lateral);

    module.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction);
    module.position.copy(spawn);
    this.stationAttitude.add(module);

    this.activeDocking = {
      module,
      moduleType,
      portKey,
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
        I18N[this.lang][PORT_I18N_KEY[portKey]],
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
      this.dynamicModules.push(module);
      this.portExtension[portKey] += length + 1.8;
      this.sim.moduleCount = 6 + this.dynamicModules.length;
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
      const isActive =
        this.sim.showLinks &&
        distance <= linkRangeWorld &&
        !blocked &&
        this.ui.showAntenna.checked;

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
    const delta = stationWorld.clone().sub(this.controls.target);
    this.controls.target.copy(stationWorld);
    this.camera.position.add(delta);
  }

  resetCamera() {
    const stationWorld = this.stationPivot.getWorldPosition(new THREE.Vector3());
    const offset = new THREE.Vector3(0, 30, 165);
    this.camera.position.copy(stationWorld.clone().add(offset));
    this.controls.target.copy(stationWorld);
    this.controls.update();
  }

  updateTelemetry() {
    const stats = this.getCircularOrbitStats();
    const dict = I18N[this.lang];
    this.ui.orbitPeriodValue.textContent = `${(stats.periodSeconds / 60).toFixed(1)} ${this.lang === "ru" ? "мин" : "min"}`;
    this.ui.orbitalVelocityValue.textContent = `${stats.velocityKms.toFixed(2)} ${this.lang === "ru" ? "км/с" : "km/s"}`;
    this.ui.activeLinksValue.textContent = `${this.sim.activeLinks} / ${this.relays.length}`;
    this.ui.throughputValue.textContent = `${this.sim.throughputMbps} ${this.lang === "ru" ? "Мбит/с" : "Mbps"}`;
    this.ui.moduleCountValue.textContent = `${this.sim.moduleCount}`;
    this.ui.dockingStateValue.textContent = dict[this.sim.dockingState];
    this.ui.missionClock.textContent = formatClock(this.missionElapsedSec);
    this.ui.fpsValue.textContent = `${Math.round(this.fpsValue)}`;
  }

  logEvent(message) {
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

  resize() {
    const rect = this.mount.getBoundingClientRect();
    this.camera.aspect = rect.width / Math.max(rect.height, 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(rect.width, rect.height, false);
  }

  updateSceneStatus() {
    const dict = I18N[this.lang];
    if (this.sim.dockingState !== "idle") {
      this.ui.sceneStatus.textContent = dict[this.sim.dockingState];
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
    const simulatedDeltaSec = rawDelta * this.sim.timeScale * 180;
    this.missionElapsedSec += simulatedDeltaSec;

    const stats = this.getCircularOrbitStats();
    this.stationOrbitRotor.rotation.y += stats.meanMotionRadSec * simulatedDeltaSec;

    this.stepDocking(rawDelta);
    this.animateAmbient(simulatedDeltaSec);
    this.updateRelays(simulatedDeltaSec);
    this.trackStationCamera();
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
