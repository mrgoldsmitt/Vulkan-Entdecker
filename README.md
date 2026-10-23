# 🌋 Vulkan Entdecker

Eine interaktive 3D-Lernanwendung zur Erkundung des Aufbaus und der Dynamik eines Vulkans im Webbrowser.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://vulkan-entdecker.pages.dev)
[![GitHub Release](https://img.shields.io/github/v/release/mrgoldsmitt/Vulkan-Entdecker?style=for-the-badge)](https://github.com/mrgoldsmitt/Vulkan-Entdecker/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

🌐 **Live im Browser ausprobieren:** [https://vulkan-entdecker.pages.dev](https://vulkan-entdecker.pages.dev)

![Vulkan Entdecker Banner](assets/landscape_bg.png)

## ✨ Features

- **Interaktives 3D-Modell (Three.js & WebGL):**
  - Freie 360°-Kamerabewegung (Drehen, Zoomen, Schwenken).
  - Nahtloser Übergang zwischen Außenansicht und detailliertem Querschnitt bei Annäherung der Kamera.
- **Interaktive Hotspots & Lernstationen:**
  - Magmakammer
  - Hauptschlot & Seitenkrater
  - Krater & Vulkankegel
  - Asche- und Lavaschichten
  - Integrierte Forscher-Erklärungen (*Forscher Tom*).
- **Physikbasierte Eruptionssimulation:**
  - Realistische Partikelsysteme für Lavafontänen, herabfließende Lavaströme und aufsteigende Aschewolken.
  - Interaktiver Eruptions-Button mit Licht- und Sound-Atmosphäre.
- **Adaptiver Lite-Modus (2D-Fallback):**
  - Automatisches Umschalten für rechenschwächere Mobilgeräte und Tablets.
  - Manueller Schalter (3D / Lite) in der Kopfzeile.
- **Cinematische Benutzeroberfläche:**
  - Modernes Glassmorphism-Design.
  - Atmosphärischer Videohintergrund mit Steuerungsoptionen.

---

## 🚀 Schnellanleitung (Lokal starten)

Da moderne Browser aus Sicherheitsgründen (CORS & Web-Worker für 3D-Modelle) lokale Dateizugriffe (`file://`) einschränken, benötigt die Anwendung lokal einen HTTP-Server.

### macOS
Führe einfach das Start-Skript per Doppelklick im Finder oder im Terminal aus:
```bash
./Start.command
```
*Oder manuell:*
```bash
python3 -m http.server 8080
```
Öffne anschließend [http://localhost:8080](http://localhost:8080) im Browser.

### Windows
Führe die Datei per Doppelklick aus:
```cmd
Start.bat
```
*Oder manuell in der Eingabeaufforderung:*
```cmd
python -m http.server 8080
```
Öffne anschließend [http://localhost:8080](http://localhost:8080) im Browser.

---

## 🛠️ Technologien

- **Rendering:** [Three.js](https://threejs.org/) (WebGL / GLTF Loader / DRACOLoader / OrbitControls)
- **Logik:** Modernes natives JavaScript (ES6 Modules)
- **Styling:** CSS3 (Flexbox/Grid, Custom Properties, Glassmorphism, Responsive Breakpoints)
- **Hosting & Edge:** [Cloudflare Pages](https://vulkan-entdecker.pages.dev)
- **Schriften:** Google Fonts (*Bebas Neue*, *Montserrat*)

---

## 📦 Releases, Packaging & Cloudflare Deployment

Das Skript `deploy_release.sh` automatisiert Packaging, Cloudflare-Upload und GitHub-Releases:

```bash
# Release-Paket lokal erstellen (dist/Vulkan-Entdecker-v1.0.1.zip):
./deploy_release.sh v1.0.1

# Direkt auf Cloudflare Pages aktualisieren:
./deploy_release.sh v1.0.1 --cloudflare

# Direkt als GitHub Release veröffentlichen (erfordert gh CLI):
./deploy_release.sh v1.0.1 --release
```

---

## 📜 Versionshistorie

Alle Änderungen sind im [CHANGELOG.md](CHANGELOG.md) dokumentiert.

---

## 📄 Lizenz

Dieses Projekt ist unter der [MIT-Lizenz](LICENSE) lizenziert.
