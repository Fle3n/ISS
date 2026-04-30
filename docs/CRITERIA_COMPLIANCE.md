# Criteria Compliance / Соответствие Критериям

| # | Criterion | Current status | Evidence |
| --- | --- | --- | --- |
| 1 | International standards and open data | Covered | `app.py` lists NASA, ESA, ROSCOSMOS, CelesTrak, Space-Track and NASA 3D Resources. `docs/OPEN_DATA_AND_ETHICS.md` records the source policy. |
| 1 | Common formats | Covered | JSON API and TLE sample are present; glTF and OBJ are documented for future 3D interchange. |
| 2 | Multilingual interface and docs | Covered | UI supports RU / EN. README and core docs are bilingual or English-first with Russian sections. |
| 3 | Reproducibility and openness | Mostly covered | Apache-2.0 license, setup commands, healthcheck, architecture docs and validation script are included. Public GitHub/GitLab publication remains a manual submission step. |
| 4 | Browser, accessibility and performance | Prepared | Browser/WCAG/FPS acceptance criteria are documented in `docs/TEST_PLAN.md`; final Chrome/Firefox/Safari measurements must be recorded before submission. |
| 5 | User stories | Covered | Engineering analysis, educational docking and presentation expansion are described on the site and represented by simulator controls. |
| 6 | AI/ML bonus | Optional, not claimed | The project documents a future path for TLE prediction or solar-panel optimization but does not claim bonus points yet. |
| 7 | Safety and ethics | Covered | The project states that restricted tracking data is not bundled and that assets must be open licensed or self-created. |

## Submission Notes / Заметки Для Защиты

- Publish the repository publicly before final submission.
- Record the browser/performance checklist results after the final design is
  frozen.
- If precise live ISS propagation is added later, use an open source library
  such as Skyfield or poliastro and document the TLE source and update date.
