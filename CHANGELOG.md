# Changelog

Alle relevanten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.
Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/) und dieses Projekt folgt [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-10-23

### Hinzugefügt
- **Cloudflare Pages Deployment:** Vollständige Bereitstellung der interaktiven Web-Anwendung auf Cloudflare Pages unter [https://vulkan-entdecker.pages.dev](https://vulkan-entdecker.pages.dev).
- **Automatisierte Cloudflare-Bereitstellung in `deploy_release.sh`:** Neuer Parameter `--cloudflare` hinzugefügt, um Web-Assets isoliert und unter Einhaltung von Upload-Limits automatisch zu deployen.
- **Changelog:** Ausführliche Dokumentation der Versionshistorie (`CHANGELOG.md`).
- **Obsidian Gesamtdokumentation:** Technische Spezifikation `Vulkan Entdecker.md` im zentralen Obsidian-Vault hinterlegt und synchronisiert.

### Geändert
- **README.md:** Live-Demo-Link zu Cloudflare Pages und erweiterte Deployment-Befehle ergänzt.

---

## [1.0.0] - 2026-10-23

### Hinzugefügt
- Erstes offizielles Release der interaktiven 3D-Lernanwendung **Vulkan Entdecker**.
- **Interaktives 3D-Modell:** Three.js-Szenenaufbau mit WebGL, 360°-OrbitControls und stufenlosem Schichten-Querschnitt bei Annäherung der Kamera (Magmakammer, Förderschlot, Krater, Lavaschichten).
- **Physikbasierte Eruptionssimulation:** Partikelsystem für Lavafontänen, gravitativ abfließende Lavaströme am Berghang und aufsteigende Aschewolken.
- **Adaptiver Lite-Modus:** Automatischer 2D-Fallback für rechenschwächere Mobilgeräte und Touchscreens mit manuellem Umschalter in der UI.
- **Interaktiver Forscher:** Integrierter Avatar (*Forscher Tom*) mit didaktischen Hinweisen zu den geologischen Besonderheiten.
- **Cinematische Oberfläche:** Modernes Glassmorphism-UI mit Steuerung für den atmosphärischen Hintergrundvideoloop.
- **Plattformübergreifender Schnellstart:** Ein-Klick-Starter für macOS (`Start.command`) und Windows (`Start.bat`).
- **Packaging:** Distributionsskript `deploy_release.sh` zur Erstellung des Offline-Release-ZIP-Archivs.
- **Open Source:** Veröffentlichung unter der MIT-Lizenz auf GitHub.
