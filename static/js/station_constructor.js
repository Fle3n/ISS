import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const $ = (id) => document.getElementById(id);
const BASE_MODULE_COUNT = 6;
const BASE_MASS_T = 420;
const BASE_POWER_GENERATION = 100;
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
const SOLAR_CLEARANCE_MARGIN = 1.2;
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

const MODULE_META = {
  solar: { labelKey: "moduleSolar", length: 8.5, mass: 18, power: 75 },
  science: { labelKey: "moduleScience", length: 12, mass: 32, power: -6 },
  habitat: { labelKey: "moduleHabitat", length: 10.5, mass: 38, power: -8 },
  cargo: { labelKey: "moduleCargo", length: 9.2, mass: 24, power: -4 },
  antenna: { labelKey: "moduleAntenna", length: 7.8, mass: 16, power: -3 },
  node: { labelKey: "moduleNode", length: 6.6, mass: 22, power: -3 },
  airlock: { labelKey: "moduleAirlock", length: 7.2, mass: 14, power: -2 },
  radiator: { labelKey: "moduleRadiator", length: 8.4, mass: 15, power: -1 },
  propulsion: { labelKey: "modulePropulsion", length: 8.8, mass: 28, power: -5 },
  cupola: { labelKey: "moduleCupola", length: 6.8, mass: 10, power: -2 },
};

const I18N = {
  ru: {
    kicker: "3D-редактор станции",
    title: "Конструктор МКС",
    modulesMetric: "Модулей",
    powerMetric: "Запас энергии",
    massMetric: "Масса",
    moduleTitle: "Модули станции",
    moduleSolar: "Солнечная батарея",
    moduleScience: "Научный модуль",
    moduleHabitat: "Жилой модуль",
    moduleCargo: "Грузовой модуль",
    moduleAntenna: "Антенный узел",
    moduleNode: "Узловой модуль",
    moduleAirlock: "Шлюзовой модуль",
    moduleRadiator: "Радиаторный блок",
    modulePropulsion: "Двигательный модуль",
    moduleCupola: "Обзорный купол",
    moduleSolarHint: "Панели питания",
    moduleScienceHint: "Лабораторный блок",
    moduleHabitatHint: "Отсек экипажа",
    moduleCargoHint: "Складской отсек",
    moduleAntennaHint: "Связь и навигация",
    moduleNodeHint: "Разветвление портов",
    moduleAirlockHint: "Выходы в открытый космос",
    moduleRadiatorHint: "Тепловой контур",
    modulePropulsionHint: "Коррекция орбиты",
    moduleCupolaHint: "Панорамные окна",
    portTitle: "Точка установки",
    portStarboard: "Правый борт",
    portLeft: "Левый борт",
    portForward: "Передний",
    portAft: "Задний",
    portZenith: "Зенит",
    portNadir: "Надир",
    portForwardZenith: "Передний верхний",
    portForwardNadir: "Передний нижний",
    portAftZenith: "Задний верхний",
    portAftNadir: "Задний нижний",
    solarAngle: "Угол панелей, °",
    viewScale: "Масштаб сборки",
    addModule: "Добавить модуль",
    undoModule: "Отменить последний",
    resetStation: "Сбросить",
    cameraHome: "Камера",
    selectedTitle: "Выбранный модуль",
    selectedModule: "Модуль",
    selectedPort: "Порт",
    selectedCascade: "Зависимые элементы",
    deleteSelected: "Удалить выбранный",
    deleteModuleMenu: "Удалить модуль",
    logTitle: "Журнал сборки",
    ready: "Конструктор готов",
    added: (module, port) => `Добавлен элемент: ${module} / ${port}`,
    removed: (module) => `Удалён последний элемент: ${module}`,
    restored: (count) => `Восстановлена сохранённая сборка: ${count} мод.`,
    selectedLog: (module) => `Выбран модуль: ${module}`,
    deletedSelected: (module, dependentCount) => (
      dependentCount > 0
        ? `Удалён модуль ${module} и зависимые элементы: ${dependentCount}`
        : `Удалён модуль: ${module}`
    ),
    blockedSolarOverlap: "Солнечные панели пересекаются с уже установленными",
    blockedSolarTerminal: "Солнечная батарея уже завершает эту ветку станции",
    blockedSolarBranch: "Солнечную батарею можно ставить только на свободную ветку",
    reset: "Станция сброшена к базовой конфигурации",
    emptyUndo: "Нет добавленных модулей",
    loadError: "Не удалось запустить 3D-конструктор. Проверьте поддержку WebGL.",
    powerBudget: (generation, load) => `Выработка: ${generation} ед. · нагрузка: ${load} ед.`,
  },
  en: {
    kicker: "3D station editor",
    title: "ISS Builder",
    modulesMetric: "Modules",
    powerMetric: "Power reserve",
    massMetric: "Mass",
    moduleTitle: "Station modules",
    moduleSolar: "Solar array",
    moduleScience: "Science module",
    moduleHabitat: "Habitation module",
    moduleCargo: "Cargo module",
    moduleAntenna: "Antenna node",
    moduleNode: "Docking node",
    moduleAirlock: "Airlock module",
    moduleRadiator: "Radiator block",
    modulePropulsion: "Propulsion module",
    moduleCupola: "Observation cupola",
    moduleSolarHint: "Power panels",
    moduleScienceHint: "Laboratory block",
    moduleHabitatHint: "Crew compartment",
    moduleCargoHint: "Storage section",
    moduleAntennaHint: "Comms and navigation",
    moduleNodeHint: "Branching ports",
    moduleAirlockHint: "Spacewalk access",
    moduleRadiatorHint: "Thermal loop",
    modulePropulsionHint: "Orbit correction",
    moduleCupolaHint: "Panoramic windows",
    portTitle: "Placement point",
    portStarboard: "Starboard",
    portLeft: "Port",
    portForward: "Forward",
    portAft: "Aft",
    portZenith: "Zenith",
    portNadir: "Nadir",
    portForwardZenith: "Forward upper",
    portForwardNadir: "Forward lower",
    portAftZenith: "Aft upper",
    portAftNadir: "Aft lower",
    solarAngle: "Panel angle, °",
    viewScale: "Assembly scale",
    addModule: "Add module",
    undoModule: "Undo last",
    resetStation: "Reset",
    cameraHome: "Camera",
    selectedTitle: "Selected module",
    selectedModule: "Module",
    selectedPort: "Port",
    selectedCascade: "Dependent elements",
    deleteSelected: "Delete selected",
    deleteModuleMenu: "Delete module",
    logTitle: "Assembly log",
    ready: "Builder ready",
    added: (module, port) => `Added element: ${module} / ${port}`,
    removed: (module) => `Removed last element: ${module}`,
    restored: (count) => `Saved assembly restored: ${count} modules`,
    selectedLog: (module) => `Selected module: ${module}`,
    deletedSelected: (module, dependentCount) => (
      dependentCount > 0
        ? `Deleted ${module} and dependent elements: ${dependentCount}`
        : `Deleted module: ${module}`
    ),
    blockedSolarOverlap: "Solar panels overlap an installed array",
    blockedSolarTerminal: "A solar array already terminates this station branch",
    blockedSolarBranch: "Solar arrays can only be installed on an empty branch",
    reset: "Station reset to baseline configuration",
    emptyUndo: "No added modules",
    loadError: "Could not start the 3D builder. Check WebGL support.",
    powerBudget: (generation, load) => `Generation: ${generation} units · load: ${load} units`,
  },
};

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

function disposeObjectTree(root) {
  root.traverse((child) => {
    child.geometry?.dispose?.();
    if (Array.isArray(child.material)) {
      child.material.forEach((material) => material.dispose?.());
    } else {
      child.material?.dispose?.();
    }
  });
}

function setObjectOpacity(root, opacity) {
  root.traverse((child) => {
    if (!child.material) {
      return;
    }
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      material.opacity = opacity;
      material.transparent = opacity < 1;
      material.depthWrite = opacity >= 1;
    });
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createModuleCore(length, radius, bodyColor, accentColor) {
  const group = new THREE.Group();
  const shellMaterial = new THREE.MeshStandardMaterial({
    color: bodyColor,
    metalness: 0.7,
    roughness: 0.28,
    emissive: new THREE.Color(accentColor).multiplyScalar(0.13),
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
    roughness: 0.24,
    emissive: new THREE.Color(accentColor).multiplyScalar(0.26),
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
  const dish = new THREE.Mesh(
    new THREE.ConeGeometry(radius, radius * 0.48, 32, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      metalness: 0.88,
      roughness: 0.22,
      side: THREE.DoubleSide,
    }),
  );
  dish.rotation.z = Math.PI / 2;
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
  group.add(dish, mast);
  return group;
}

function createBuilderModule(type) {
  const configs = {
    science: { length: 12, radius: 2.5, body: 0x99f6e4, accent: 0x22d3ee },
    habitat: { length: 10.5, radius: 3.15, body: 0xf8fafc, accent: 0xfbbf24 },
    cargo: { length: 9.2, radius: 2.35, body: 0xd6d3d1, accent: 0xfb7185 },
    antenna: { length: 7.8, radius: 1.9, body: 0xe2e8f0, accent: 0x67e8f9 },
    solar: { length: 8.5, radius: 1.7, body: 0xb0bec5, accent: 0x60a5fa },
    node: { length: 6.6, radius: 2.75, body: 0xdbeafe, accent: 0xa78bfa },
    airlock: { length: 7.2, radius: 2.05, body: 0xe5e7eb, accent: 0xf97316 },
    radiator: { length: 8.4, radius: 1.65, body: 0xcbd5e1, accent: 0xf43f5e },
    propulsion: { length: 8.8, radius: 2.2, body: 0xc7d2fe, accent: 0x818cf8 },
    cupola: { length: 6.8, radius: 2.15, body: 0xe0f2fe, accent: 0x38bdf8 },
  };
  const cfg = configs[type] || configs.solar;
  let group;
  if (type === "cargo") {
    group = createBoxModuleCore(cfg.length, cfg.radius * 2.05, cfg.radius * 1.7, cfg.body, cfg.accent);
  } else if (type === "node") {
    group = createSphericalModuleCore(cfg.length, cfg.radius, cfg.body, cfg.accent);
  } else if (type === "radiator") {
    group = createTrussModuleCore(cfg.length, cfg.body, cfg.accent);
  } else {
    group = createModuleCore(cfg.length, cfg.radius, cfg.body, cfg.accent);
  }
  group.userData.moduleType = type;
  group.userData.length = cfg.length;
  group.userData.solarMounts = [];

  if (type === "solar") {
    const leftMount = new THREE.Group();
    const rightMount = new THREE.Group();
    leftMount.position.z = 9.2;
    rightMount.position.z = -9.2;
    leftMount.add(createSolarPanels(14, 5.2, 0x1d4ed8));
    rightMount.add(createSolarPanels(14, 5.2, 0x1d4ed8));
    group.userData.solarMounts.push(leftMount, rightMount);
    group.add(leftMount, rightMount);
  }

  if (type === "antenna") {
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

  if (type === "node") {
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

  if (type === "airlock") {
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

  if (type === "radiator") {
    const leftRadiator = new THREE.Group();
    const rightRadiator = new THREE.Group();
    leftRadiator.position.z = 5.8;
    rightRadiator.position.z = -5.8;
    leftRadiator.add(createSolarPanels(10.5, 4.4, 0xbe123c));
    rightRadiator.add(createSolarPanels(10.5, 4.4, 0xbe123c));
    group.add(leftRadiator, rightRadiator);
  }

  if (type === "propulsion") {
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

  if (type === "cupola") {
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

function createStars(count = 1800) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();
  for (let i = 0; i < count; i += 1) {
    const radius = 240 + Math.random() * 520;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    color.setHSL(0.54 + Math.random() * 0.18, 0.3, 0.72 + Math.random() * 0.2);
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
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    }),
  );
}

class StationConstructor {
  constructor() {
    this.lang = window.appLanguage?.get?.() || "ru";
    this.mount = $("constructorMount");
    this.dynamicModules = [];
    this.portExtension = Object.fromEntries(Object.keys(PORTS).map((key) => [key, 0]));
    this.solarMounts = [];
    this.logMessages = [];
    this.nextModuleId = 1;
    this.selectedRecord = null;
    this.selectionBox = null;
    this.dragState = null;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.pointerDown = null;
    this.engineering = {
      thermalBiasPct: 0,
      crewLoad: 3,
      commsGainPct: 72,
    };
    this.ui = this.collectUi();

    this.buildScene();
    this.buildBaseStation();
    this.loadStationConfig();
    this.bindUi();
    this.applyLanguage();
    this.updateSolarAngle();
    this.updateScale();
    this.updateMetrics();
    this.updatePortMarker();
    this.resetCamera();
    this.logEvent(I18N[this.lang].ready);

    window.addEventListener("resize", () => this.resize());
    window.addEventListener("app-language-change", (event) => {
      this.lang = event.detail?.lang === "en" ? "en" : "ru";
      this.applyLanguage();
      this.updateMetrics();
    });
    this.renderer.setAnimationLoop(() => this.animate());
  }

  collectUi() {
    return {
      modulePalette: $("builderModulePalette"),
      undo: $("builderUndo"),
      reset: $("builderReset"),
      camera: $("builderCamera"),
      solarAngle: $("builderSolarAngle"),
      solarAngleValue: $("builderSolarAngleValue"),
      scale: $("builderScale"),
      scaleValue: $("builderScaleValue"),
      thermalBias: $("builderThermalBias"),
      thermalBiasValue: $("builderThermalBiasValue"),
      crewLoad: $("builderCrewLoad"),
      crewLoadValue: $("builderCrewLoadValue"),
      commsGain: $("builderCommsGain"),
      commsGainValue: $("builderCommsGainValue"),
      moduleCount: $("builderModuleCount"),
      power: $("builderPower"),
      mass: $("builderMass"),
      thermalMargin: $("builderThermalMargin"),
      commsScore: $("builderCommsScore"),
      dockingCapacity: $("builderDockingCapacity"),
      deltaVReserve: $("builderDeltaVReserve"),
      riskScore: $("builderRiskScore"),
      assistantAdvice: $("builderAssistantAdvice"),
      selection: $("builderSelection"),
      selectedModule: $("builderSelectedModule"),
      selectedPort: $("builderSelectedPort"),
      selectedCascade: $("builderSelectedCascade"),
      deleteSelected: $("builderDeleteSelected"),
      moduleMenu: $("builderModuleMenu"),
      moduleMenuDelete: $("builderModuleMenuDelete"),
      log: $("builderLog"),
    };
  }

  buildScene() {
    const rect = this.mount.getBoundingClientRect();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617);
    this.scene.fog = new THREE.FogExp2(0x020617, 0.003);
    this.camera = new THREE.PerspectiveCamera(45, rect.width / Math.max(rect.height, 1), 0.1, 1600);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(rect.width, rect.height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.mount.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 28;
    this.controls.maxDistance = 190;

    const ambient = new THREE.AmbientLight(0xa0c4ff, 1.9);
    const key = new THREE.DirectionalLight(0xffffff, 3.7);
    key.position.set(80, 70, 90);
    const fill = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fill.position.set(-70, -30, -50);
    this.scene.add(ambient, key, fill, createStars());

    const grid = new THREE.GridHelper(120, 24, 0x38bdf8, 0x1e293b);
    grid.position.y = -18;
    grid.material.transparent = true;
    grid.material.opacity = 0.22;
    this.scene.add(grid);

    this.stationRoot = new THREE.Group();
    this.scene.add(this.stationRoot);

    this.portMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 }),
    );
    this.portMarker.visible = false;
    this.stationRoot.add(this.portMarker);
  }

  buildBaseStation() {
    const core = createModuleCore(BASE_CORE_LENGTH, 3.25, 0xe2e8f0, 0x67e8f9);
    const lab = createModuleCore(BASE_LAB_LENGTH, 2.6, 0xc4f1f9, 0x22d3ee);
    lab.position.x = BASE_LAB_X;
    const hab = createModuleCore(BASE_HAB_LENGTH, 3.05, 0xf8fafc, 0xfbbf24);
    hab.position.x = BASE_HAB_X;

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

    const truss = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 1.7, BASE_TRUSS_LENGTH),
      new THREE.MeshStandardMaterial({
        color: 0xb0bec5,
        metalness: 0.74,
        roughness: 0.35,
      }),
    );
    const leftSolar = new THREE.Group();
    const rightSolar = new THREE.Group();
    leftSolar.position.z = -BASE_SOLAR_OFFSET;
    rightSolar.position.z = BASE_SOLAR_OFFSET;
    leftSolar.add(createSolarPanels(18, 6.8, 0x1d4ed8));
    rightSolar.add(createSolarPanels(18, 6.8, 0x1d4ed8));
    this.baseSolarMounts = [leftSolar, rightSolar];
    this.solarMounts.push(...this.baseSolarMounts);

    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 9.2, 18),
      new THREE.MeshStandardMaterial({
        color: 0xe5e7eb,
        metalness: 0.74,
        roughness: 0.34,
      }),
    );
    mast.position.y = 8.6;
    const dish = createDish(2.6);
    dish.position.set(0, 13.2, 0);
    dish.rotation.z = -0.5;

    this.stationRoot.add(core, lab, hab, node, nodeCollar, truss, leftSolar, rightSolar, mast, dish);
  }

  bindUi() {
    this.ui.modulePalette.addEventListener("pointerdown", (event) => {
      const card = event.target.closest("[data-module-type]");
      if (!card || !this.ui.modulePalette.contains(card)) {
        return;
      }
      if (event.button !== undefined && event.button !== 0) {
        return;
      }
      event.preventDefault();
      this.startModuleDrag(card.dataset.moduleType, card, event);
    });
    this.ui.undo?.addEventListener("click", () => this.undoModule());
    this.ui.reset?.addEventListener("click", () => this.resetStation());
    this.ui.camera?.addEventListener("click", () => this.resetCamera());
    this.ui.deleteSelected?.addEventListener("click", () => this.deleteSelectedModule());
    this.ui.moduleMenu?.addEventListener("pointerdown", (event) => event.stopPropagation());
    this.ui.moduleMenuDelete?.addEventListener("click", (event) => {
      event.stopPropagation();
      this.deleteSelectedModule();
    });
    this.ui.solarAngle.addEventListener("input", () => this.updateSolarAngle());
    this.ui.solarAngle.addEventListener("change", () => this.saveStationConfig());
    this.ui.scale.addEventListener("input", () => this.updateScale());
    this.ui.scale.addEventListener("change", () => this.saveStationConfig());
    this.bindEngineeringRange(
      this.ui.thermalBias,
      this.ui.thermalBiasValue,
      "thermalBiasPct",
      (value) => `${Math.round(value)}%`,
    );
    this.bindEngineeringRange(
      this.ui.crewLoad,
      this.ui.crewLoadValue,
      "crewLoad",
      (value) => `${Math.round(value)}`,
    );
    this.bindEngineeringRange(
      this.ui.commsGain,
      this.ui.commsGainValue,
      "commsGainPct",
      (value) => `${Math.round(value)}%`,
    );
    window.addEventListener("pointermove", (event) => this.updateModuleDrag(event));
    window.addEventListener("pointerup", (event) => this.finishModuleDrag(event));
    window.addEventListener("pointercancel", (event) => this.finishModuleDrag(event));
    this.renderer.domElement.addEventListener("pointerdown", (event) => this.handlePointerDown(event));
    this.renderer.domElement.addEventListener("pointerup", (event) => this.handlePointerUp(event));
  }

  bindEngineeringRange(slider, output, key, formatter) {
    if (!slider || !output) {
      return;
    }
    const emit = () => {
      const value = Number(slider.value);
      this.engineering[key] = Number.isFinite(value) ? value : this.engineering[key];
      output.textContent = formatter(this.engineering[key]);
      this.updateMetrics();
    };
    slider.addEventListener("input", emit);
    slider.addEventListener("change", () => this.saveStationConfig());
    emit();
  }

  bindOptionGroup(group, onChange) {
    group.addEventListener("click", (event) => {
      const button = event.target.closest("[data-value]");
      if (!button || !group.contains(button)) {
        return;
      }
      group.dataset.value = button.dataset.value;
      group.querySelectorAll("[data-value]").forEach((option) => {
        const active = option === button;
        option.classList.toggle("is-active", active);
        option.setAttribute("aria-pressed", active ? "true" : "false");
      });
      onChange(button.dataset.value);
    });
  }

  applyLanguage() {
    const dict = I18N[this.lang];
    document.querySelectorAll("[data-i18n-builder]").forEach((node) => {
      const value = dict[node.dataset.i18nBuilder];
      if (typeof value === "string") {
        node.textContent = value;
      }
    });
    const deleteMenuLabel = dict.deleteModuleMenu || dict.deleteSelected;
    this.ui.moduleMenuDelete?.setAttribute("aria-label", deleteMenuLabel);
    this.ui.moduleMenuDelete?.setAttribute("title", deleteMenuLabel);
    this.updateSelectionPanel();
    this.renderLog();
  }

  getPlacementForType(moduleType, portKey) {
    const safePortKey = PORTS[portKey] ? portKey : "starboard";
    const port = PORTS[safePortKey];
    const direction = port.dir.clone().normalize();
    const length = MODULE_META[moduleType]?.length || MODULE_META.solar.length;
    const distance = port.baseOffset
      + this.portExtension[safePortKey]
      + getModuleVisualHalf(length)
      - DOCK_RING_OVERLAP;
    return {
      portKey: safePortKey,
      direction,
      length,
      target: direction.clone().multiplyScalar(distance),
    };
  }

  placeModule(module, placement) {
    module.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), placement.direction);
    module.position.copy(placement.target);
  }

  getSolarMountBounds(mount) {
    const box = new THREE.Box3().setFromObject(mount);
    if (box.isEmpty()) {
      return null;
    }
    box.expandByScalar(SOLAR_CLEARANCE_MARGIN);
    return box.isEmpty() ? null : box;
  }

  hasSolarPanelCollision(module) {
    const candidateMounts = module.userData.solarMounts || [];
    if (!candidateMounts.length || !this.solarMounts.length) {
      return false;
    }

    this.stationRoot.updateMatrixWorld(true);
    const existingBoxes = this.solarMounts
      .map((mount) => this.getSolarMountBounds(mount))
      .filter(Boolean);

    return candidateMounts.some((mount) => {
      const candidateBox = this.getSolarMountBounds(mount);
      return Boolean(candidateBox && existingBoxes.some((box) => box.intersectsBox(candidateBox)));
    });
  }

  getPortTailRecord(portKey) {
    return this.dynamicModules.filter((record) => record.portKey === portKey).at(-1) || null;
  }

  getPlacementBlockReason(module, placement) {
    const moduleType = module.userData.moduleType;
    if (moduleType === "solar" && placement && this.portExtension[placement.portKey] > 0) {
      return "blockedSolarBranch";
    }
    const portTail = placement ? this.getPortTailRecord(placement.portKey) : null;
    if (portTail?.moduleType === "solar") {
      return "blockedSolarTerminal";
    }
    if (this.hasSolarPanelCollision(module)) {
      return "blockedSolarOverlap";
    }
    return null;
  }

  isPlacementAllowed(module, placement) {
    return !this.getPlacementBlockReason(module, placement);
  }

  isPointerInsideCanvas(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    return (
      event.clientX >= rect.left
      && event.clientX <= rect.right
      && event.clientY >= rect.top
      && event.clientY <= rect.bottom
    );
  }

  getNearestPlacement(moduleType, event) {
    if (!this.isPointerInsideCanvas(event)) {
      return null;
    }
    const rect = this.renderer.domElement.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    this.camera.updateMatrixWorld();
    this.stationRoot.updateMatrixWorld();

    return Object.keys(PORTS).reduce((best, portKey) => {
      const placement = this.getPlacementForType(moduleType, portKey);
      const projected = this.stationRoot.localToWorld(placement.target.clone()).project(this.camera);
      const screenX = (projected.x * 0.5 + 0.5) * rect.width;
      const screenY = (-projected.y * 0.5 + 0.5) * rect.height;
      const distance = Math.hypot(pointerX - screenX, pointerY - screenY);
      if (!best || distance < best.distance) {
        return { ...placement, distance };
      }
      return best;
    }, null);
  }

  startModuleDrag(moduleType, card, event) {
    if (!MODULE_META[moduleType]) {
      return;
    }
    this.cancelModuleDrag();
    this.clearSelection();
    const module = createBuilderModule(moduleType);
    module.visible = false;
    setObjectOpacity(module, 0.58);
    this.stationRoot.add(module);
    card.classList.add("is-dragging");
    this.controls.enabled = false;
    this.dragState = {
      module,
      moduleType,
      card,
      pointerId: event.pointerId,
      placement: null,
      valid: false,
      blocked: false,
      blockReason: null,
    };
    this.updateModuleDrag(event);
  }

  updateModuleDrag(event) {
    if (!this.dragState || event.pointerId !== this.dragState.pointerId) {
      return;
    }
    const placement = this.getNearestPlacement(this.dragState.moduleType, event);
    this.dragState.placement = placement;
    this.dragState.valid = false;
    this.dragState.blocked = false;
    this.dragState.blockReason = null;
    if (!placement) {
      this.dragState.module.visible = false;
      this.mount.classList.remove("is-drop-ready", "is-drop-blocked");
      this.updatePortMarker(null);
      return;
    }
    this.dragState.module.visible = true;
    this.placeModule(this.dragState.module, placement);
    const blockReason = this.getPlacementBlockReason(this.dragState.module, placement);
    const allowed = !blockReason;
    this.dragState.valid = allowed;
    this.dragState.blocked = !allowed;
    this.dragState.blockReason = blockReason;
    this.mount.classList.toggle("is-drop-ready", allowed);
    this.mount.classList.toggle("is-drop-blocked", !allowed);
    setObjectOpacity(this.dragState.module, allowed ? 0.58 : 0.24);
    this.updatePortMarker(placement.portKey, allowed);
  }

  finishModuleDrag(event) {
    if (!this.dragState || event.pointerId !== this.dragState.pointerId) {
      return;
    }
    const state = this.dragState;
    const shouldCommit = state.valid && state.placement && this.isPointerInsideCanvas(event);
    this.dragState = null;
    state.card.classList.remove("is-dragging");
    this.controls.enabled = true;
    this.mount.classList.remove("is-drop-ready", "is-drop-blocked");
    this.updatePortMarker(null);

    if (!shouldCommit) {
      this.stationRoot.remove(state.module);
      disposeObjectTree(state.module);
      if (state.blocked && state.placement && this.isPointerInsideCanvas(event)) {
        this.logEvent(I18N[this.lang][state.blockReason] || I18N[this.lang].blockedSolarOverlap);
      }
      return;
    }
    setObjectOpacity(state.module, 1);
    this.registerModule(state.module, state.moduleType, state.placement);
  }

  cancelModuleDrag() {
    if (!this.dragState) {
      return;
    }
    const state = this.dragState;
    this.dragState = null;
    state.card.classList.remove("is-dragging");
    this.controls.enabled = true;
    this.mount.classList.remove("is-drop-ready", "is-drop-blocked");
    this.updatePortMarker(null);
    this.stationRoot.remove(state.module);
    disposeObjectTree(state.module);
  }

  registerModule(module, moduleType, placement) {
    const blockReason = this.getPlacementBlockReason(module, placement);
    if (blockReason) {
      this.stationRoot.remove(module);
      disposeObjectTree(module);
      this.logEvent(I18N[this.lang][blockReason] || I18N[this.lang].blockedSolarOverlap);
      return;
    }
    const record = {
      id: this.nextModuleId,
      module,
      moduleType,
      portKey: placement.portKey,
      length: placement.length,
    };
    this.nextModuleId += 1;
    module.traverse((child) => {
      child.userData.builderRecord = record;
    });
    this.dynamicModules.push(record);
    this.portExtension[placement.portKey] += getModuleChainStep(placement.length);
    if (module.userData.solarMounts?.length) {
      this.solarMounts.push(...module.userData.solarMounts);
      this.updateSolarAngle();
    }
    this.saveStationConfig();
    this.updatePortMarker();
    this.updateMetrics();
    this.selectModule(record, { silent: true, menu: false });
    this.logEvent(
      I18N[this.lang].added(
        I18N[this.lang][MODULE_META[moduleType].labelKey],
        I18N[this.lang][PORT_I18N_KEY[placement.portKey]],
      ),
    );
  }

  undoModule() {
    this.cancelModuleDrag();
    const last = this.dynamicModules.at(-1);
    if (!last) {
      this.logEvent(I18N[this.lang].emptyUndo);
      return;
    }
    const wasSelected = this.selectedRecord === last;
    this.removeRecords([last]);
    if (wasSelected) {
      this.clearSelection();
    } else {
      this.updateSelectionPanel();
    }
    this.updatePortMarker();
    this.updateMetrics();
    this.logEvent(I18N[this.lang].removed(I18N[this.lang][MODULE_META[last.moduleType].labelKey]));
  }

  resetStation() {
    this.cancelModuleDrag();
    this.clearSelection();
    this.dynamicModules.forEach(({ module }) => {
      this.stationRoot.remove(module);
      disposeObjectTree(module);
    });
    this.dynamicModules = [];
    this.solarMounts = [...this.baseSolarMounts];
    this.recalculatePortExtensions();
    this.saveStationConfig();
    this.updatePortMarker();
    this.updateMetrics();
    this.logEvent(I18N[this.lang].reset);
  }

  removeRecords(records) {
    const deleteSet = new Set(records);
    records.forEach(({ module }) => {
      this.stationRoot.remove(module);
      this.solarMounts = this.solarMounts.filter(
        (mount) => !module.userData.solarMounts?.includes(mount),
      );
      disposeObjectTree(module);
    });
    this.dynamicModules = this.dynamicModules.filter((item) => !deleteSet.has(item));
    this.recalculatePortExtensions();
    this.saveStationConfig();
  }

  saveStationConfig() {
    try {
      const modules = this.dynamicModules.map(({ moduleType, portKey }) => ({ moduleType, portKey }));
      const payload = {
        version: 1,
        modules,
        solarAngle: Number(this.ui.solarAngle.value),
        scale: Number(this.ui.scale.value),
        engineering: {
          thermalBiasPct: Number(this.engineering.thermalBiasPct),
          crewLoad: Number(this.engineering.crewLoad),
          commsGainPct: Number(this.engineering.commsGainPct),
        },
        updatedAt: Date.now(),
      };
      window.localStorage.setItem(
        BUILDER_STORAGE_KEY,
        JSON.stringify(payload),
      );
      window.issDashboardState?.syncBuilderState?.(payload, "constructor");
    } catch (error) {
      console.warn("Could not save ISS constructor configuration", error);
    }
  }

  readStationConfig() {
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

  loadStationConfig() {
    const config = this.readStationConfig();
    if (!config) {
      return;
    }

    if (Number.isFinite(config.solarAngle)) {
      this.ui.solarAngle.value = `${config.solarAngle}`;
    }
    if (Number.isFinite(config.scale)) {
      this.ui.scale.value = `${config.scale}`;
    }
    if (config.engineering && typeof config.engineering === "object") {
      const thermalBiasPct = Number(config.engineering.thermalBiasPct);
      const crewLoad = Number(config.engineering.crewLoad);
      const commsGainPct = Number(config.engineering.commsGainPct);
      if (Number.isFinite(thermalBiasPct)) {
        this.engineering.thermalBiasPct = thermalBiasPct;
        if (this.ui.thermalBias) {
          this.ui.thermalBias.value = `${thermalBiasPct}`;
        }
      }
      if (Number.isFinite(crewLoad)) {
        this.engineering.crewLoad = crewLoad;
        if (this.ui.crewLoad) {
          this.ui.crewLoad.value = `${crewLoad}`;
        }
      }
      if (Number.isFinite(commsGainPct)) {
        this.engineering.commsGainPct = commsGainPct;
        if (this.ui.commsGain) {
          this.ui.commsGain.value = `${commsGainPct}`;
        }
      }
    }

    let restoredCount = 0;
    const skippedReasons = new Set();
    config.modules.forEach((item) => {
      if (!MODULE_META[item.moduleType] || !PORTS[item.portKey]) {
        return;
      }
      const module = createBuilderModule(item.moduleType);
      const placement = this.getPlacementForType(item.moduleType, item.portKey);
      this.placeModule(module, placement);
      this.stationRoot.add(module);
      const blockReason = this.getPlacementBlockReason(module, placement);
      if (blockReason) {
        this.stationRoot.remove(module);
        disposeObjectTree(module);
        skippedReasons.add(blockReason);
        return;
      }
      const record = {
        id: this.nextModuleId,
        module,
        moduleType: item.moduleType,
        portKey: placement.portKey,
        length: placement.length,
      };
      this.nextModuleId += 1;
      module.traverse((child) => {
        child.userData.builderRecord = record;
      });
      this.dynamicModules.push(record);
      this.portExtension[placement.portKey] += getModuleChainStep(placement.length);
      if (module.userData.solarMounts?.length) {
        this.solarMounts.push(...module.userData.solarMounts);
      }
      restoredCount += 1;
    });

    if (restoredCount > 0) {
      this.logEvent(I18N[this.lang].restored(restoredCount));
    }
    if (skippedReasons.size > 0) {
      this.saveStationConfig();
      skippedReasons.forEach((reason) => {
        this.logEvent(I18N[this.lang][reason] || I18N[this.lang].blockedSolarOverlap);
      });
    }
    window.issDashboardState?.syncBuilderState?.(this.readStationConfig(), "constructor-load");
  }

  getCascadeRecords(record) {
    if (!record) {
      return [];
    }
    const samePort = this.dynamicModules.filter((item) => item.portKey === record.portKey);
    const startIndex = samePort.indexOf(record);
    return startIndex >= 0 ? samePort.slice(startIndex) : [];
  }

  handlePointerDown(event) {
    if (this.dragState) {
      return;
    }
    this.pointerDown = { x: event.clientX, y: event.clientY };
  }

  handlePointerUp(event) {
    if (this.dragState || !this.pointerDown) {
      return;
    }
    const move = Math.hypot(event.clientX - this.pointerDown.x, event.clientY - this.pointerDown.y);
    this.pointerDown = null;
    if (move > 6) {
      return;
    }
    const record = this.pickModuleAt(event);
    if (record) {
      this.selectModule(record);
    } else {
      this.clearSelection();
    }
  }

  pickModuleAt(event) {
    if (!this.dynamicModules.length) {
      return null;
    }
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    this.pointer.y = -(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.stationRoot.children, true);
    return hits.find((hit) => hit.object.userData.builderRecord)?.object.userData.builderRecord || null;
  }

  selectModule(record, options = {}) {
    this.selectedRecord = record;
    this.updateSelectionPanel();
    this.updateSelectionBox();
    if (options.menu === false) {
      this.hideModuleMenu();
    } else {
      this.showModuleMenu();
    }
    if (!options.silent) {
      this.logEvent(I18N[this.lang].selectedLog(I18N[this.lang][MODULE_META[record.moduleType].labelKey]));
    }
  }

  clearSelection() {
    this.selectedRecord = null;
    this.updateSelectionPanel();
    this.clearSelectionBox();
    this.hideModuleMenu();
  }

  showModuleMenu() {
    if (!this.ui.moduleMenu || !this.selectedRecord) {
      return;
    }
    this.ui.moduleMenu.hidden = false;
    this.positionModuleMenu();
  }

  hideModuleMenu() {
    if (!this.ui.moduleMenu) {
      return;
    }
    this.ui.moduleMenu.hidden = true;
    this.ui.moduleMenu.classList.remove("is-offscreen");
  }

  positionModuleMenu() {
    const menu = this.ui.moduleMenu;
    if (!menu || menu.hidden || !this.selectedRecord) {
      return;
    }

    this.camera.updateMatrixWorld();
    this.selectedRecord.module.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(this.selectedRecord.module);
    if (bounds.isEmpty()) {
      return;
    }

    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    center.y += size.y * 0.5 + 1.4;
    const projected = center.project(this.camera);
    const isOnScreen = projected.z >= -1 && projected.z <= 1;
    menu.classList.toggle("is-offscreen", !isOnScreen);
    if (!isOnScreen) {
      return;
    }

    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    const padding = 12;
    const menuWidth = menu.offsetWidth || 48;
    const menuHeight = menu.offsetHeight || 48;
    const rawX = (projected.x * 0.5 + 0.5) * width + padding;
    const rawY = (-projected.y * 0.5 + 0.5) * height - menuHeight - padding;
    const maxX = Math.max(padding, width - menuWidth - padding);
    const maxY = Math.max(padding, height - menuHeight - padding);
    const x = Math.min(Math.max(rawX, padding), maxX);
    const y = Math.min(Math.max(rawY, padding), maxY);
    menu.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  }

  updateSelectionPanel() {
    if (!this.ui.selection) {
      return;
    }
    const record = this.selectedRecord;
    this.ui.selection.hidden = !record;
    if (!record) {
      return;
    }
    const cascadeCount = Math.max(0, this.getCascadeRecords(record).length - 1);
    this.ui.selectedModule.textContent = I18N[this.lang][MODULE_META[record.moduleType].labelKey];
    this.ui.selectedPort.textContent = I18N[this.lang][PORT_I18N_KEY[record.portKey]];
    this.ui.selectedCascade.textContent = `${cascadeCount}`;
  }

  updateSelectionBox() {
    this.clearSelectionBox();
    if (!this.selectedRecord) {
      return;
    }
    this.selectionBox = new THREE.BoxHelper(this.selectedRecord.module, 0x38bdf8);
    this.selectionBox.material.transparent = true;
    this.selectionBox.material.opacity = 0.95;
    this.scene.add(this.selectionBox);
  }

  clearSelectionBox() {
    if (!this.selectionBox) {
      return;
    }
    this.scene.remove(this.selectionBox);
    this.selectionBox.geometry?.dispose?.();
    this.selectionBox.material?.dispose?.();
    this.selectionBox = null;
  }

  deleteSelectedModule() {
    const record = this.selectedRecord;
    if (!record) {
      return;
    }
    const records = this.getCascadeRecords(record);
    const label = I18N[this.lang][MODULE_META[record.moduleType].labelKey];
    const dependentCount = Math.max(0, records.length - 1);
    this.clearSelection();
    this.removeRecords(records);
    this.updatePortMarker();
    this.updateMetrics();
    this.logEvent(I18N[this.lang].deletedSelected(label, dependentCount));
  }

  recalculatePortExtensions() {
    Object.keys(this.portExtension).forEach((key) => {
      this.portExtension[key] = 0;
    });
    this.dynamicModules.forEach(({ portKey, length }) => {
      this.portExtension[portKey] += getModuleChainStep(length);
    });
  }

  updateSolarAngle() {
    const angleDeg = Number(this.ui.solarAngle.value);
    const angle = THREE.MathUtils.degToRad(angleDeg);
    this.ui.solarAngleValue.textContent = `${angleDeg}`;
    this.solarMounts.forEach((mount) => {
      mount.rotation.y = angle;
    });
  }

  updateScale() {
    const scale = Number(this.ui.scale.value);
    this.ui.scaleValue.textContent = `${scale.toFixed(1)}x`;
    this.stationRoot.scale.setScalar(scale);
  }

  updatePortMarker(portKey = null, allowed = true) {
    if (!portKey) {
      this.portMarker.visible = false;
      return;
    }
    const port = PORTS[portKey] || PORTS.starboard;
    const distance = port.baseOffset + this.portExtension[portKey] + 0.15;
    this.portMarker.visible = true;
    this.portMarker.material.color.setHex(allowed ? 0x38bdf8 : 0xfb7185);
    this.portMarker.position.copy(port.dir.clone().normalize().multiplyScalar(distance));
  }

  updateMetrics() {
    const moduleCounts = this.dynamicModules.reduce((counts, item) => {
      counts[item.moduleType] = (counts[item.moduleType] || 0) + 1;
      return counts;
    }, {});
    const mass = BASE_MASS_T + this.dynamicModules.reduce(
      (sum, item) => sum + MODULE_META[item.moduleType].mass,
      0,
    );
    const solarAngleDeg = Number(this.ui.solarAngle.value) || 0;
    const solarEfficiency = clamp(0.64 + Math.cos(THREE.MathUtils.degToRad(solarAngleDeg)) * 0.28, 0.42, 0.96);
    const generation = Math.round(
      BASE_POWER_GENERATION
        + (moduleCounts.solar || 0) * MODULE_META.solar.power * solarEfficiency,
    );
    const load = Math.round(
      this.dynamicModules.reduce(
        (sum, item) => sum + Math.max(0, -MODULE_META[item.moduleType].power),
        0,
      )
        + this.engineering.crewLoad * 1.8
        + this.engineering.commsGainPct * 0.06,
    );
    const net = generation - load;
    const reservePct = generation > 0 ? Math.round((Math.max(0, net) / generation) * 100) : 0;
    const radiatorCount = moduleCounts.radiator || 0;
    const antennaCount = moduleCounts.antenna || 0;
    const nodeCount = moduleCounts.node || 0;
    const propulsionCount = moduleCounts.propulsion || 0;
    const heatCapacity = 82 + radiatorCount * 28 + (moduleCounts.solar || 0) * 3;
    const heatLoad = Math.round(
      58
        + (moduleCounts.science || 0) * 14
        + (moduleCounts.habitat || 0) * 9
        + propulsionCount * 10
        + this.engineering.crewLoad * 4.2
        + this.engineering.thermalBiasPct,
    );
    const thermalMargin = Math.round(clamp(((heatCapacity - heatLoad) / heatCapacity) * 100, -65, 100));
    const totalPorts = Object.keys(PORTS).length + nodeCount * 2;
    const occupiedPorts = Object.values(this.portExtension).filter((value) => value > 0).length;
    const openPorts = Math.max(0, totalPorts - occupiedPorts);
    const commsScore = Math.round(clamp(
      44
        + antennaCount * 15
        + (moduleCounts.cupola || 0) * 5
        + this.engineering.commsGainPct * 0.38
        - this.dynamicModules.length * 0.55
        - Math.max(0, this.engineering.thermalBiasPct) * 0.12,
      0,
      100,
    ));
    const deltaVReserve = Math.round(clamp(
      84 + propulsionCount * 17 - Math.max(0, mass - BASE_MASS_T) * 0.055 - this.dynamicModules.length * 1.2,
      0,
      100,
    ));
    const riskScore = Math.round(clamp(
      100
        - reservePct * 0.28
        - Math.max(0, thermalMargin) * 0.22
        - commsScore * 0.24
        - deltaVReserve * 0.18
        - Math.min(openPorts * 3.5, 22),
      0,
      100,
    ));
    const advice = (() => {
      const ru = this.lang === "ru";
      if (net < 12) {
        return ru
          ? "Нужен энергетический запас: добавьте солнечную батарею или снизьте нагрузку связи."
          : "Power margin is low: add a solar array or reduce comms load.";
      }
      if (thermalMargin < 18) {
        return ru
          ? "Тепловой контур близок к пределу: добавьте радиаторный блок перед научными модулями."
          : "Thermal loop is close to limit: add a radiator block before more science modules.";
      }
      if (commsScore < 62) {
        return ru
          ? "Связь слабая для инженерного режима: добавьте антенный узел или увеличьте усиление."
          : "Comms are weak for engineering mode: add an antenna node or raise gain.";
      }
      if (deltaVReserve < 48) {
        return ru
          ? "Масса растет быстрее тягового резерва: нужен двигательный модуль."
          : "Mass is outrunning propulsion reserve: add a propulsion module.";
      }
      if (openPorts < 3) {
        return ru
          ? "Свободных портов мало: добавьте узловой модуль для дальнейшего расширения."
          : "Few open ports remain: add a node module for future expansion.";
      }
      return ru
        ? "Конфигурация сбалансирована: можно проверять ее в симуляторе и сценариях."
        : "Configuration is balanced: validate it in the simulator and scenarios.";
    })();
    this.ui.moduleCount.textContent = `${BASE_MODULE_COUNT + this.dynamicModules.length}`;
    this.ui.power.textContent = `${reservePct}%`;
    this.ui.power.dataset.state = net <= 0 ? "deficit" : reservePct < 20 ? "low" : "ok";
    this.ui.power.title = I18N[this.lang].powerBudget(generation, load);
    this.ui.power.setAttribute("aria-label", I18N[this.lang].powerBudget(generation, load));
    this.ui.mass.textContent = this.lang === "ru" ? `${mass} т` : `${mass} t`;
    if (this.ui.thermalMargin) {
      this.ui.thermalMargin.textContent = `${thermalMargin}%`;
      this.ui.thermalMargin.dataset.state = thermalMargin < 12 ? "deficit" : thermalMargin < 24 ? "low" : "ok";
    }
    if (this.ui.commsScore) {
      this.ui.commsScore.textContent = `${commsScore}%`;
      this.ui.commsScore.dataset.state = commsScore < 50 ? "deficit" : commsScore < 68 ? "low" : "ok";
    }
    if (this.ui.dockingCapacity) {
      this.ui.dockingCapacity.textContent = `${openPorts} / ${totalPorts}`;
    }
    if (this.ui.deltaVReserve) {
      this.ui.deltaVReserve.textContent = `${deltaVReserve}%`;
      this.ui.deltaVReserve.dataset.state = deltaVReserve < 36 ? "deficit" : deltaVReserve < 55 ? "low" : "ok";
    }
    if (this.ui.riskScore) {
      this.ui.riskScore.textContent = `${riskScore}/100`;
      this.ui.riskScore.dataset.state = riskScore > 64 ? "deficit" : riskScore > 38 ? "low" : "ok";
    }
    if (this.ui.assistantAdvice) {
      this.ui.assistantAdvice.textContent = advice;
    }
  }

  logEvent(text) {
    this.logMessages.unshift({ text, time: new Date() });
    this.logMessages = this.logMessages.slice(0, 6);
    this.renderLog();
  }

  renderLog() {
    this.ui.log.innerHTML = "";
    this.logMessages.forEach((entry) => {
      const row = document.createElement("div");
      row.className = "constructor-log-row";
      const time = entry.time.toLocaleTimeString(this.lang === "ru" ? "ru-RU" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      row.innerHTML = `<time>${time}</time><span>${entry.text}</span>`;
      this.ui.log.appendChild(row);
    });
  }

  resetCamera() {
    this.camera.position.set(38, 28, 58);
    this.controls.target.set(0, 1.4, 0);
    this.controls.update();
  }

  resize() {
    const rect = this.mount.getBoundingClientRect();
    this.camera.aspect = rect.width / Math.max(rect.height, 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(rect.width, rect.height);
    this.positionModuleMenu();
  }

  animate() {
    if (this.portMarker.visible) {
      this.portMarker.material.opacity = 0.62 + Math.sin(performance.now() * 0.006) * 0.24;
    }
    this.selectionBox?.update();
    this.controls.update();
    this.positionModuleMenu();
    this.renderer.render(this.scene, this.camera);
  }
}

function bootstrap() {
  const mount = $("constructorMount");
  try {
    new StationConstructor();
  } catch (error) {
    console.error(error);
    const lang = window.appLanguage?.get?.() === "en" ? "en" : "ru";
    mount.innerHTML = `<div class="constructor-fallback">${I18N[lang].loadError}</div>`;
  }
}

bootstrap();
