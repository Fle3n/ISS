# Open Data And Ethics / Открытые Данные И Этика

## English

The project uses only open or public reference sources as the allowed source
set. Before a public competition release, every newly added asset must keep its
own source URL and license note in this document.

| Source | Intended use |
| --- | --- |
| NASA Planetary Fact Sheets | Planet radii, gravitational parameters and reference constants. |
| NASA 3D Resources | Public 3D asset taxonomy and station-module proportion references. |
| ESA Earth Observation / Open Access | International open-data and open-science context. |
| ROSCOSMOS public materials | Public Russian space-sector context for educational comparison. |
| CelesTrak | TLE terminology and orbital-reference conventions. |
| Space-Track | International orbital catalog reference; no restricted catalog data is bundled. |

## Formats

- JSON: mission profile, planet constants, presets and API payloads.
- TLE: orbital reference notation for ISS-like educational context.
- glTF / OBJ: recommended formats for future external 3D assets.
- WebGL / ES Modules: current browser runtime.

## Current asset policy

- The station body, modules, antennas and relay satellites are generated
  procedurally in JavaScript.
- The bundled TLE sample is an educational format example, not operational
  tracking data.
- Planet textures in `static/textures/planets/` are named with their intended
  public reference family, but source-specific terms should be rechecked before
  final public publication or packaging.
- No restricted, military, private or paid orbital datasets are bundled.
- Do not add copyrighted models, textures, fonts, music or text without an open
  license and an attribution note.

## Русский

Проект использует только открытые или публичные справочные источники. Перед
публичной защитой каждый новый ресурс должен иметь URL источника и пометку о
лицензии в этом документе.

Текущая политика: станция и технические объекты создаются процедурно, пример
TLE используется только как форматная справка, закрытые наборы данных не
поставляются вместе с проектом. Любые новые модели, текстуры и данные нужно
добавлять только с открытой лицензией или создавать самостоятельно.
