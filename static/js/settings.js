const BUILDER_STORAGE_KEY = "iss-constructor-state-v1";
const BASE_MODULE_COUNT = 6;

const MODULE_META = {
  solar: { power: 75 },
  science: { power: -6 },
  habitat: { power: -8 },
  cargo: { power: -4 },
  antenna: { power: -3 },
  node: { power: -3 },
  airlock: { power: -2 },
  radiator: { power: -1 },
  propulsion: { power: -5 },
  cupola: { power: -2 },
};

const DEMO_MODULES = [
  { moduleType: "solar", portKey: "starboard" },
  { moduleType: "science", portKey: "forward" },
  { moduleType: "habitat", portKey: "aft" },
  { moduleType: "node", portKey: "zenith" },
  { moduleType: "radiator", portKey: "port" },
  { moduleType: "cupola", portKey: "forwardZenith" },
  { moduleType: "propulsion", portKey: "aftNadir" },
];

const $ = (id) => document.getElementById(id);

function currentLang() {
  return document.documentElement.lang === "en" ? "en" : "ru";
}

function text(ru, en) {
  return currentLang() === "en" ? en : ru;
}

function readConfig() {
  try {
    const raw = window.localStorage.getItem(BUILDER_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.modules) ? parsed : null;
  } catch (error) {
    return null;
  }
}

function writeConfig(config) {
  window.localStorage.setItem(
    BUILDER_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      modules: Array.isArray(config.modules) ? config.modules : [],
      solarAngle: Number.isFinite(Number(config.solarAngle)) ? Number(config.solarAngle) : 28,
      scale: Number.isFinite(Number(config.scale)) ? Number(config.scale) : 1,
      updatedAt: Date.now(),
    }),
  );
}

function createEmptyConfig() {
  return {
    version: 1,
    modules: [],
    solarAngle: 28,
    scale: 1,
    updatedAt: Date.now(),
  };
}

function getConfigForSceneSettings() {
  return readConfig() || createEmptyConfig();
}

function formatDate(timestamp) {
  if (!timestamp) {
    return "-";
  }
  return new Date(timestamp).toLocaleString(currentLang() === "en" ? "en-US" : "ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPowerReserve(config) {
  const generation = 100 + config.modules.reduce(
    (sum, item) => sum + Math.max(0, MODULE_META[item.moduleType]?.power || 0),
    0,
  );
  const load = config.modules.reduce(
    (sum, item) => sum + Math.max(0, -(MODULE_META[item.moduleType]?.power || 0)),
    0,
  );
  return Math.round((Math.max(0, generation - load) / generation) * 100);
}

function setStatus(message) {
  const status = $("settingsStatus");
  if (status) {
    status.textContent = message;
  }
}

function updateSceneControls(config) {
  const solarAngle = $("settingsSolarAngle");
  const solarAngleValue = $("settingsSolarAngleValue");
  const scale = $("settingsScale");
  const scaleValue = $("settingsScaleValue");
  const angle = Number.isFinite(Number(config.solarAngle)) ? Number(config.solarAngle) : 28;
  const sceneScale = Number.isFinite(Number(config.scale)) ? Number(config.scale) : 1;

  if (solarAngle) {
    solarAngle.value = `${angle}`;
  }
  if (solarAngleValue) {
    solarAngleValue.textContent = `${angle}`;
  }
  if (scale) {
    scale.value = `${sceneScale}`;
  }
  if (scaleValue) {
    scaleValue.textContent = `${sceneScale.toFixed(1)}x`;
  }
}

function renderConfig() {
  const config = readConfig() || createEmptyConfig();
  const savedModules = $("settingsSavedModules");
  const totalModules = $("settingsTotalModules");
  const updatedAt = $("settingsUpdatedAt");
  const configText = $("settingsConfigText");

  if (savedModules) {
    savedModules.textContent = `${config.modules.length}`;
    savedModules.title = text(
      `Запас энергии: ${getPowerReserve(config)}%`,
      `Power reserve: ${getPowerReserve(config)}%`,
    );
  }
  if (totalModules) {
    totalModules.textContent = `${BASE_MODULE_COUNT + config.modules.length}`;
  }
  if (updatedAt) {
    updatedAt.textContent = config.modules.length ? formatDate(config.updatedAt) : "-";
  }
  if (configText && !configText.matches(":focus")) {
    configText.value = JSON.stringify(config, null, 2);
  }
  updateSceneControls(config);
}

function bindSceneControls() {
  const solarAngle = $("settingsSolarAngle");
  const solarAngleValue = $("settingsSolarAngleValue");
  const scale = $("settingsScale");
  const scaleValue = $("settingsScaleValue");

  solarAngle?.addEventListener("input", () => {
    const config = getConfigForSceneSettings();
    config.solarAngle = Number(solarAngle.value);
    writeConfig(config);
    if (solarAngleValue) {
      solarAngleValue.textContent = solarAngle.value;
    }
    renderConfig();
  });

  scale?.addEventListener("input", () => {
    const config = getConfigForSceneSettings();
    config.scale = Number(scale.value);
    writeConfig(config);
    if (scaleValue) {
      scaleValue.textContent = `${Number(scale.value).toFixed(1)}x`;
    }
    renderConfig();
  });
}

function bindConfigActions() {
  $("settingsDemoBuild")?.addEventListener("click", () => {
    const existing = readConfig();
    if (existing?.modules?.length) {
      const ok = window.confirm(text(
        "Заменить сохранённую сборку демо-конфигурацией?",
        "Replace the saved assembly with the demo configuration?",
      ));
      if (!ok) {
        return;
      }
    }
    writeConfig({
      modules: DEMO_MODULES,
      solarAngle: 32,
      scale: 1,
    });
    renderConfig();
    setStatus(text("Демо-сборка сохранена", "Demo build saved"));
  });

  $("settingsResetBuild")?.addEventListener("click", () => {
    const ok = window.confirm(text(
      "Сбросить сохранённую сборку станции?",
      "Reset the saved station assembly?",
    ));
    if (!ok) {
      return;
    }
    window.localStorage.removeItem(BUILDER_STORAGE_KEY);
    renderConfig();
    setStatus(text("Сборка сброшена", "Assembly reset"));
  });

  $("settingsExport")?.addEventListener("click", () => {
    const configText = $("settingsConfigText");
    if (configText) {
      configText.value = JSON.stringify(readConfig() || createEmptyConfig(), null, 2);
      configText.focus();
      configText.select();
    }
    setStatus(text("Конфигурация готова", "Configuration ready"));
  });

  $("settingsImport")?.addEventListener("click", () => {
    const configText = $("settingsConfigText");
    if (!configText) {
      return;
    }
    try {
      const parsed = JSON.parse(configText.value);
      if (!Array.isArray(parsed?.modules)) {
        throw new Error("Missing modules");
      }
      writeConfig(parsed);
      renderConfig();
      setStatus(text("Конфигурация импортирована", "Configuration imported"));
    } catch (error) {
      setStatus(text("Некорректный JSON", "Invalid JSON"));
    }
  });
}

function bootstrapSettings() {
  renderConfig();
  bindSceneControls();
  bindConfigActions();
  window.addEventListener("app-language-change", () => {
    renderConfig();
    setStatus("");
  });
}

bootstrapSettings();
