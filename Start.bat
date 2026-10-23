@echo off
echo Der Vulkan Entdecker benoetigt wegen moderner 3D-Technik (Web-Worker) einen lokalen Server.
echo Server wird gestartet...
start http://localhost:8080/index.html
python -m http.server 8080
pause
