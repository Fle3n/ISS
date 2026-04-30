<!--
Slides content for Reveal.js (markdown).
Open with docs/presentation/slides.html
-->

<!-- .slide: data-background-gradient="radial-gradient(circle at 12% 18%, rgba(255,94,197,0.22), transparent 42%), radial-gradient(circle at 78% 22%, rgba(55,214,255,0.20), transparent 46%), linear-gradient(180deg, rgba(6,10,20,1), rgba(2,4,10,1))" -->
## ISS<br><span class="accent">DIGITAL TWIN</span><br>FOR MISSION‑SCALE<br>SIMULATIONS

<div class="lead">Real‑time orbit · docking · station builder · open telemetry</div>
<div class="meta">Digital Breakthrough · 2026 · Web simulator</div>

<div class="chips">
  <span>AI‑ready telemetry</span>
  <span>Scenarios</span>
  <span>Ethics & open data</span>
  <span>Production UX</span>
</div>

---

<!-- .slide: data-background-gradient="radial-gradient(circle at 8% 18%, rgba(255,94,197,0.16), transparent 38%), radial-gradient(circle at 88% 12%, rgba(55,214,255,0.16), transparent 40%), linear-gradient(180deg, rgba(6,10,20,1), rgba(2,4,10,1))" -->
### Who we are today
## We build a usable ISS simulator,<br>not a static dashboard

<div class="two">
  <div>
    <div class="kicker">Focus</div>
    <ul class="bullets">
      <li>Interactive 3D orbit & attitude</li>
      <li>Docking and station expansion</li>
      <li>Builder → configuration → assessment</li>
      <li>Language toggle RU/EN</li>
    </ul>
  </div>
  <div>
    <div class="kicker">Output</div>
    <div class="stat-grid">
      <div class="stat"><span>Pages</span><strong>Home / Simulator / Builder / Data</strong></div>
      <div class="stat"><span>Modes</span><strong>Orbit · Docking · Scenarios</strong></div>
      <div class="stat"><span>Stack</span><strong>Flask · Three.js · Vanilla JS</strong></div>
      <div class="stat"><span>Data</span><strong>WhereTheISS.at + curated sources</strong></div>
    </div>
  </div>
</div>

<div class="footnote">We turn space telemetry into an experience people can operate.</div>

---

<!-- .slide: data-background-gradient="radial-gradient(circle at 15% 20%, rgba(55,214,255,0.18), transparent 44%), radial-gradient(circle at 78% 24%, rgba(255,184,77,0.16), transparent 40%), linear-gradient(180deg, rgba(6,10,20,1), rgba(2,4,10,1))" -->
<div class="section">01</div>
### Reason 1
## Real‑time simulation that feels real

<div class="stat-row">
  <div class="stat big"><span>Orbit</span><strong>altitude · inclination · period</strong></div>
  <div class="stat big"><span>Time</span><strong>speed control + transport</strong></div>
  <div class="stat big"><span>Scene</span><strong>camera home + fullscreen</strong></div>
</div>

<div class="note">User controls instantly change the 3D scene and telemetry readouts.</div>

---

<!-- .slide: data-background-gradient="radial-gradient(circle at 10% 22%, rgba(255,94,197,0.18), transparent 45%), radial-gradient(circle at 90% 18%, rgba(55,214,255,0.16), transparent 45%), linear-gradient(180deg, rgba(6,10,20,1), rgba(2,4,10,1))" -->
<div class="section">02</div>
### Reason 2
## Docking & expansion as a first‑class flow

<div class="two">
  <div>
    <div class="kicker">Docking</div>
    <ul class="bullets">
      <li>Select module type + port</li>
      <li>Approach speed & state machine</li>
      <li>Visual port rings + progress</li>
    </ul>
  </div>
  <div>
    <div class="kicker">Station growth</div>
    <ul class="bullets">
      <li>Toggle visibility per module group</li>
      <li>Solar panel spread & attitude</li>
      <li>Reset station to baseline</li>
    </ul>
  </div>
</div>

---

<!-- .slide: data-background-gradient="radial-gradient(circle at 12% 20%, rgba(63,244,174,0.18), transparent 42%), radial-gradient(circle at 84% 22%, rgba(55,214,255,0.16), transparent 44%), linear-gradient(180deg, rgba(6,10,20,1), rgba(2,4,10,1))" -->
<div class="section">03</div>
### Reason 3
## Engineering assessment, not just visuals

<div class="stat-grid">
  <div class="stat"><span>Risk index</span><strong>composite score</strong></div>
  <div class="stat"><span>Subsystems</span><strong>Power · Thermal · Comms · Docking</strong></div>
  <div class="stat"><span>Actions</span><strong>Nominal · Power save · Comms priority</strong></div>
  <div class="stat"><span>Telemetry</span><strong>links · throughput · modules count</strong></div>
</div>

<div class="note">The UI guides decisions: configure → assess → iterate.</div>

---

<!-- .slide: data-background-gradient="radial-gradient(circle at 10% 18%, rgba(162,113,255,0.16), transparent 46%), radial-gradient(circle at 86% 20%, rgba(55,214,255,0.16), transparent 44%), linear-gradient(180deg, rgba(6,10,20,1), rgba(2,4,10,1))" -->
<div class="section">04</div>
### Reason 4
## Data + scenarios built for exploration

<div class="two">
  <div>
    <div class="kicker">Data surface</div>
    <ul class="bullets">
      <li>Telemetry cards + charts</li>
      <li>Forecast windows & confidence</li>
      <li>Export‑ready structure</li>
    </ul>
  </div>
  <div>
    <div class="kicker">Scenarios</div>
    <ul class="bullets">
      <li>Ready scenarios + user scenarios</li>
      <li>Parameters & difficulty</li>
      <li>Launch flow into simulator</li>
    </ul>
  </div>
</div>

---

<!-- .slide: data-background-gradient="radial-gradient(circle at 12% 20%, rgba(255,184,77,0.16), transparent 42%), radial-gradient(circle at 82% 18%, rgba(255,94,197,0.14), transparent 46%), linear-gradient(180deg, rgba(6,10,20,1), rgba(2,4,10,1))" -->
<div class="section">05</div>
### Reason 5
## Open data & ethics are explicit

<div class="two">
  <div>
    <div class="kicker">Principles</div>
    <ul class="bullets">
      <li>Only legal public sources</li>
      <li>Clear attribution in UI</li>
      <li>No sensitive tracking claims</li>
    </ul>
  </div>
  <div>
    <div class="kicker">In‑app</div>
    <ul class="bullets">
      <li>Open data section in simulator</li>
      <li>Source list with usage</li>
      <li>Documentation in /docs</li>
    </ul>
  </div>
</div>

---

<!-- .slide: data-background-gradient="radial-gradient(circle at 14% 18%, rgba(55,214,255,0.18), transparent 44%), radial-gradient(circle at 80% 22%, rgba(255,94,197,0.14), transparent 46%), linear-gradient(180deg, rgba(6,10,20,1), rgba(2,4,10,1))" -->
### Architecture (short)
## Simple pieces, strong integration

<div class="arch">
  <div class="arch-col">
    <div class="kicker">Backend</div>
    <div class="cardish">
      <div>Flask routes → templates</div>
      <div>Open telemetry fetch</div>
      <div>Static assets versioned</div>
    </div>
  </div>
  <div class="arch-col">
    <div class="kicker">Frontend</div>
    <div class="cardish">
      <div>Three.js scene</div>
      <div>UI state in localStorage</div>
      <div>RU/EN toggles</div>
    </div>
  </div>
  <div class="arch-col">
    <div class="kicker">UX</div>
    <div class="cardish">
      <div>Panels scroll correctly</div>
      <div>Controls with feedback</div>
      <div>Metrics at a glance</div>
    </div>
  </div>
</div>

---

<!-- .slide: data-background-gradient="radial-gradient(circle at 12% 18%, rgba(255,94,197,0.16), transparent 44%), radial-gradient(circle at 86% 28%, rgba(55,214,255,0.16), transparent 42%), linear-gradient(180deg, rgba(6,10,20,1), rgba(2,4,10,1))" -->
### Demo flow (2 minutes)
## Show, don’t tell

<ol class="steps">
  <li>Home → launch simulator</li>
  <li>Change altitude/inclination → watch period/velocity update</li>
  <li>Enable docking mode → select port → launch docking</li>
  <li>Toggle modules + solar spread</li>
  <li>Open data → sources list</li>
</ol>

---

<!-- .slide: data-background-gradient="radial-gradient(circle at 16% 22%, rgba(63,244,174,0.16), transparent 44%), radial-gradient(circle at 82% 20%, rgba(162,113,255,0.14), transparent 46%), linear-gradient(180deg, rgba(6,10,20,1), rgba(2,4,10,1))" -->
### Roadmap
## Next upgrades

<div class="two">
  <div>
    <div class="kicker">Simulation</div>
    <ul class="bullets">
      <li>More realistic perturbations</li>
      <li>Constraint‑based docking</li>
      <li>Scenario replay & share links</li>
    </ul>
  </div>
  <div>
    <div class="kicker">Data</div>
    <ul class="bullets">
      <li>Better caching & rate limits</li>
      <li>More open datasets</li>
      <li>Export CSV/JSON pipelines</li>
    </ul>
  </div>
</div>

---

<!-- .slide: data-background-gradient="radial-gradient(circle at 12% 18%, rgba(255,94,197,0.20), transparent 46%), radial-gradient(circle at 86% 22%, rgba(55,214,255,0.18), transparent 46%), linear-gradient(180deg, rgba(6,10,20,1), rgba(2,4,10,1))" -->
## Thank you

<div class="lead">ISS Digital Twin · ready to operate</div>
<div class="meta">Demo: <span class="mono">http://127.0.0.1:7001</span></div>

<div class="chips">
  <span>Simulator</span>
  <span>Builder</span>
  <span>Data</span>
  <span>Scenarios</span>
</div>

