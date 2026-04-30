const LANGUAGE_STORAGE_KEY = "issLanguage";
const DASHBOARD_STATE_KEY = "iss-dashboard-state-v1";
const BUILDER_STORAGE_KEY = "iss-constructor-state-v1";

const DEFAULT_STATE = {
  ui: {
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
  },
  orbit: {
    hostBody: "earth",
    altitudeKm: 417,
    inclinationDeg: 51.64,
    timeScale: 1.8,
  },
  telemetry: {
    updatedAt: null,
    activeLinks: 0,
    throughputMbps: 0,
    relayCount: 8,
    linkRangeKm: 14000,
    packetRateMbps: 420,
    iss: null,
  },
  activeScenarioId: "engineering",
  pendingScenario: null,
  userScenarios: [],
  builder: null,
};

const SHELL_I18N = {
  ru: {
    brandTitle: "цифровой<br />прорыв",
    brandSubtitle: "цифровой двойник мкс",
    liveLabel: "режим<br />в реальном времени",
    notifications: "Уведомления",
    help: "Справка",
    languageToggle: "Switch language to English",
    nav: {
      home: "Главная",
      simulator: "Симулятор",
      constructor: "Конструктор",
      orbit: "Орбита",
      system: "Система МКС",
      data: "Данные",
      scenarios: "Сценарии",
      settings: "Настройки",
    },
    pages: {
      home: { kicker: "мкс digital twin", title: "Главная" },
      simulator: { kicker: "симуляция", title: "Симулятор" },
      constructor: { kicker: "конструктор", title: "Конструктор" },
      orbit: { kicker: "орбита", title: "Орбита" },
      system: { kicker: "система станции", title: "Система МКС" },
      data: { kicker: "данные", title: "Данные" },
      scenarios: { kicker: "сценарии", title: "Сценарии" },
      settings: { kicker: "настройки", title: "Настройки" },
    },
    homePanel: {
      heroTitle: "Цифровой <span>двойник</span> международной космической станции",
      heroSubtitle: "Исследуйте поведение МКС в реальном времени и моделируйте различные сценарии.",
      heroCta: "Запустить симулятор",
      metricAltitudeLabel: "Высота орбиты",
      metricSpeedLabel: "Скорость",
      metricInclinationLabel: "Наклонение",
      metricPeriodLabel: "Период обращения",
    },
  },
  en: {
    brandTitle: "digital<br />breakthrough",
    brandSubtitle: "iss digital twin",
    liveLabel: "realtime<br />mode",
    notifications: "Notifications",
    help: "Help",
    languageToggle: "Переключить язык на русский",
    nav: {
      home: "Home",
      simulator: "Simulator",
      constructor: "Builder",
      orbit: "Orbit",
      system: "ISS System",
      data: "Data",
      scenarios: "Scenarios",
      settings: "Settings",
    },
    pages: {
      home: { kicker: "iss digital twin", title: "Home" },
      simulator: { kicker: "simulation", title: "Simulator" },
      constructor: { kicker: "builder", title: "Builder" },
      orbit: { kicker: "orbit", title: "Orbit" },
      system: { kicker: "station systems", title: "ISS System" },
      data: { kicker: "data", title: "Data" },
      scenarios: { kicker: "scenarios", title: "Scenarios" },
      settings: { kicker: "settings", title: "Settings" },
    },
    homePanel: {
      heroTitle: "ISS <span>digital twin</span> for mission-scale simulations",
      heroSubtitle: "Explore ISS dynamics in real time and test operational scenarios.",
      heroCta: "Launch simulator",
      metricAltitudeLabel: "Orbit altitude",
      metricSpeedLabel: "Velocity",
      metricInclinationLabel: "Inclination",
      metricPeriodLabel: "Orbital period",
    },
  },
};

const BUILDER_MODULE_META = {
  solar: { mass: 18, power: 75, label: "Solar array" },
  science: { mass: 32, power: -6, label: "Science module" },
  habitat: { mass: 38, power: -8, label: "Habitat module" },
  cargo: { mass: 24, power: -4, label: "Cargo module" },
  antenna: { mass: 16, power: -3, label: "Antenna node" },
  node: { mass: 22, power: -3, label: "Node module" },
  airlock: { mass: 14, power: -2, label: "Airlock" },
  radiator: { mass: 15, power: -1, label: "Radiator" },
  propulsion: { mass: 28, power: -5, label: "Propulsion module" },
  cupola: { mass: 10, power: -2, label: "Cupola" },
};

function deepMerge(base, overlay) {
  const output = Array.isArray(base) ? [...base] : { ...base };
  if (!overlay || typeof overlay !== "object") {
    return output;
  }
  Object.entries(overlay).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      output[key] = [...value];
      return;
    }
    if (value && typeof value === "object") {
      const current = output[key] && typeof output[key] === "object" ? output[key] : {};
      output[key] = deepMerge(current, value);
      return;
    }
    output[key] = value;
  });
  return output;
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function readStorageJson(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorageJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function normalizeState(nextState) {
  const merged = deepMerge(DEFAULT_STATE, nextState || {});
  if (!Array.isArray(merged.userScenarios)) {
    merged.userScenarios = [];
  }
  return merged;
}

function readDashboardState() {
  return normalizeState(readStorageJson(DASHBOARD_STATE_KEY, DEFAULT_STATE));
}

function dispatchStateChange(state, source = "ui") {
  window.dispatchEvent(
    new CustomEvent("iss-dashboard-state-change", {
      detail: {
        source,
        state,
      },
    }),
  );
}

function writeDashboardState(nextState, source = "ui") {
  const normalized = normalizeState(nextState);
  writeStorageJson(DASHBOARD_STATE_KEY, normalized);
  dispatchStateChange(normalized, source);
  return normalized;
}

function updateDashboardState(updater, source = "ui") {
  const current = readDashboardState();
  const draft = cloneJson(current);
  const nextState =
    typeof updater === "function"
      ? updater(draft) ?? draft
      : deepMerge(draft, updater);
  return writeDashboardState(nextState, source);
}

function readBuilderConfiguration() {
  return readStorageJson(BUILDER_STORAGE_KEY, null);
}

function summarizeBuilderConfiguration(config = readBuilderConfiguration()) {
  const modules = Array.isArray(config?.modules) ? config.modules : [];
  let moduleCount = 6;
  let massT = 420;
  let powerBalance = 100;

  const moduleLines = modules.map((entry, index) => {
    const meta = BUILDER_MODULE_META[entry.moduleType] || { mass: 12, power: -2, label: entry.moduleType };
    moduleCount += 1;
    massT += meta.mass;
    powerBalance += meta.power;
    return {
      id: `${entry.portKey}-${entry.moduleType}-${index}`,
      label: meta.label,
      moduleType: entry.moduleType,
      portKey: entry.portKey,
      mass: meta.mass,
      power: meta.power,
    };
  });

  const powerReservePct = Math.max(18, Math.min(180, Math.round(powerBalance)));
  return {
    moduleCount,
    massT,
    powerReservePct,
    modules: moduleLines,
    solarAngle: Number(config?.solarAngle ?? 28),
    scale: Number(config?.scale ?? 1),
    updatedAt: Number(config?.updatedAt ?? Date.now()),
  };
}

function syncBuilderState(config = readBuilderConfiguration(), source = "builder") {
  const builder = summarizeBuilderConfiguration(config);
  return updateDashboardState((state) => {
    state.builder = builder;
    return state;
  }, source);
}

function getLanguage() {
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en" ? "en" : "ru";
  } catch {
    return "ru";
  }
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

function applyShellLanguage() {
  const lang = getLanguage();
  const dict = SHELL_I18N[lang];
  const pageCopy = dict.pages[getCurrentPageKey()] || dict.pages.home;
  const pageKey = getCurrentPageKey();

  const brandTitle = document.querySelector("[data-brand-title]");
  if (brandTitle) {
    brandTitle.innerHTML = dict.brandTitle;
  }
  const brandSubtitle = document.querySelector("[data-brand-subtitle]");
  if (brandSubtitle) {
    brandSubtitle.textContent = dict.brandSubtitle;
  }
  const liveLabel = document.querySelector("[data-live-label]");
  if (liveLabel) {
    liveLabel.innerHTML = dict.liveLabel;
  }
  document.querySelectorAll("[data-nav-key]").forEach((link) => {
    const key = link.dataset.navKey;
    const label = dict.nav[key];
    const textNode = link.querySelector("span");
    if (label && textNode) {
      textNode.textContent = label;
    }
  });
  const pageKicker = document.getElementById("pageKicker");
  if (pageKicker) {
    pageKicker.textContent = pageCopy.kicker;
  }
  const pageTitle = document.getElementById("pageTitle");
  if (pageTitle) {
    pageTitle.textContent = pageCopy.title;
  }
  document.querySelector('[data-shell-action="notifications"]')?.setAttribute("aria-label", dict.notifications);
  document.querySelector('[data-shell-action="help"]')?.setAttribute("aria-label", dict.help);

  if (pageKey === "home") {
    const homeDict = dict.homePanel || {};
    document.querySelectorAll("[data-home-i18n]").forEach((node) => {
      const key = node.dataset.homeI18n;
      const value = homeDict[key];
      if (!value) {
        return;
      }
      if (value.includes("<")) {
        node.innerHTML = value;
      } else {
        node.textContent = value;
      }
    });
  }
}

function updateLanguageToggleVisual() {
  const toggle = document.getElementById("languageToggle");
  if (!toggle) {
    return;
  }
  const lang = getLanguage();
  toggle.querySelectorAll("[data-lang-option]").forEach((node) => {
    node.classList.toggle("is-active", node.dataset.langOption === lang);
  });
  toggle.setAttribute("aria-label", SHELL_I18N[lang].languageToggle);
}

function setLanguage(lang) {
  const safeLang = lang === "en" ? "en" : "ru";
  document.documentElement.lang = safeLang;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, safeLang);
  } catch {
    // Storage can be unavailable in hardened browser profiles.
  }
  updateLanguageToggleVisual();
  window.dispatchEvent(new CustomEvent("app-language-change", { detail: { lang: safeLang } }));
}

function refreshIcons() {
  window.lucide?.createIcons?.({
    attrs: {
      "stroke-width": 1.7,
    },
  });
}

function ensureToastStack() {
  let stack = document.querySelector(".template-toast-stack");
  if (stack) {
    return stack;
  }
  stack = document.createElement("div");
  stack.className = "template-toast-stack";
  document.body.appendChild(stack);
  return stack;
}

function showToast(message, tone = "info") {
  const stack = ensureToastStack();
  const toast = document.createElement("div");
  toast.className = `template-toast template-toast--${tone}`;
  toast.textContent = message;
  stack.appendChild(toast);
  window.setTimeout(() => {
    toast.classList.add("is-visible");
  }, 16);
  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => toast.remove(), 220);
  }, 2600);
}

function setSidebarCollapsed(collapsed, persist = true) {
  document.body.classList.toggle("template-sidebar-collapsed", Boolean(collapsed));
  if (persist) {
    updateDashboardState((state) => {
      state.ui.sidebarCollapsed = Boolean(collapsed);
      return state;
    }, "layout");
  }
}

function applyUiPreferences(ui = readDashboardState().ui || {}) {
  const classList = document.body.classList;
  [
    "template-theme-contrast",
    "template-density-compact",
    "template-accent-cyan",
    "template-accent-blue",
    "template-reduced-motion",
  ].forEach((className) => classList.remove(className));

  classList.toggle("template-theme-contrast", ui.theme === "contrast");
  classList.toggle("template-density-compact", ui.density === "compact");
  classList.toggle("template-accent-cyan", ui.accent === "cyan");
  classList.toggle("template-accent-blue", ui.accent === "blue");
  classList.toggle("template-reduced-motion", Boolean(ui.reducedMotion));
  setSidebarCollapsed(false, false);
}

function applySavedLayoutState() {
  const state = readDashboardState();
  applyUiPreferences(state.ui);
}

function bindLanguageToggle() {
  const toggle = document.getElementById("languageToggle");
  if (!toggle) {
    return;
  }
  toggle.addEventListener("click", () => {
    setLanguage(getLanguage() === "ru" ? "en" : "ru");
  });
}

function updateUtcClock() {
  const utcNode = document.querySelector(".template-utc");
  if (!utcNode) {
    return;
  }
  const date = new Date();
  utcNode.textContent = date.toISOString().slice(11, 19) + " UTC";
}

function bindTabs() {
  document.querySelectorAll(".panel-tabs").forEach((tabs) => {
    if (tabs.dataset.passiveTabsBound === "true") {
      return;
    }
    tabs.dataset.passiveTabsBound = "true";
    tabs.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button || !tabs.contains(button)) {
        return;
      }
      tabs.querySelectorAll("button").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
    });
  });
}

window.appLanguage = {
  get: getLanguage,
  set: setLanguage,
};

window.issDashboardState = {
  read: readDashboardState,
  write: writeDashboardState,
  update: updateDashboardState,
  readBuilderConfiguration,
  summarizeBuilder: summarizeBuilderConfiguration,
  syncBuilderState,
  showToast,
  setSidebarCollapsed,
  applyUiPreferences,
};

applySavedLayoutState();
syncBuilderState(readBuilderConfiguration(), "bootstrap");
setLanguage(getLanguage());

document.addEventListener("DOMContentLoaded", () => {
  bindLanguageToggle();
  bindTabs();
  updateUtcClock();
  applyShellLanguage();
  updateLanguageToggleVisual();
  window.setInterval(updateUtcClock, 1000);
  refreshIcons();
});

window.addEventListener("load", refreshIcons);
window.addEventListener("storage", (event) => {
  if (event.key === LANGUAGE_STORAGE_KEY) {
    setLanguage(getLanguage());
  }
  if (event.key === BUILDER_STORAGE_KEY) {
    syncBuilderState(readBuilderConfiguration(), "storage");
  }
  if (event.key === DASHBOARD_STATE_KEY) {
    const state = readDashboardState();
    applyUiPreferences(state.ui);
    dispatchStateChange(state, "storage");
  }
});

window.addEventListener("iss-dashboard-state-change", (event) => {
  applyUiPreferences(event.detail?.state?.ui || readDashboardState().ui);
});

window.addEventListener("app-language-change", () => {
  applyShellLanguage();
});
