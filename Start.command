#!/bin/bash
echo "Der Vulkan Entdecker benoetigt wegen moderner 3D-Technik (Web-Worker) einen lokalen Server."
echo "Server wird gestartet..."

# Zum Verzeichnis dieses Skripts wechseln
cd "$(dirname "$0")"

# Browser nach 1 Sekunde Verzögerung öffnen
(sleep 1 && open "http://localhost:8080/index.html") &

# Python HTTP-Server starten (Mac nutzt primär python3)
python3 -m http.server 8080 || python -m http.server 8080
