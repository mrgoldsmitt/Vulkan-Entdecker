#!/usr/bin/env bash
# ==============================================================================
# deploy_release.sh - Build & Release-Paketierung für Vulkan Entdecker
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

APP_NAME="Vulkan-Entdecker"
VERSION="${1:-v1.0.0}"
VERSION="${VERSION#v}" # remove leading v if present
TAG="v${VERSION}"
DIST_DIR="${SCRIPT_DIR}/dist"
ZIP_NAME="${APP_NAME}-v${VERSION}.zip"
ZIP_PATH="${DIST_DIR}/${ZIP_NAME}"

echo "=============================================="
echo " Packaging ${APP_NAME} Release: ${TAG}"
echo "=============================================="

# 1. Dist-Ordner vorbereiten
mkdir -p "${DIST_DIR}"
rm -f "${ZIP_PATH}"

# 2. Temporäres Verzeichnis für sauberen Build erstellen
TMP_BUILD_DIR="$(mktemp -d -t vulkan-build-XXXXXX)"
cleanup() {
    rm -rf "${TMP_BUILD_DIR}"
}
trap cleanup EXIT

echo "-> Kopiere Projektdateien in Staging-Bereich..."
STAGING_DIR="${TMP_BUILD_DIR}/${APP_NAME}"
mkdir -p "${STAGING_DIR}"

# Kopiere relevante Dateien
cp -R index.html Start.bat Start.command css js assets README.md LICENSE "${STAGING_DIR}/"

# Bereinige etwaige .DS_Store oder temporäre Dateien im Staging-Ordner
find "${STAGING_DIR}" -name ".DS_Store" -delete
find "${STAGING_DIR}" -name "*.tmp" -delete

echo "-> Erstelle ZIP-Archiv: ${ZIP_PATH}"
(cd "${TMP_BUILD_DIR}" && zip -r -q -9 "${ZIP_PATH}" "${APP_NAME}")

ZIP_SIZE="$(du -h "${ZIP_PATH}" | cut -f1)"
echo "✓ Release-Archiv erfolgreich erstellt: ${ZIP_PATH} (${ZIP_SIZE})"

# Optional: GitHub Release erstellen, falls gewünscht oder Argument übergeben
if [[ "${2:-}" == "--release" || "${2:-}" == "--publish" || "${1:-}" == "--release" ]]; then
    echo "-> Veröffentliche Release auf GitHub via gh CLI..."
    if command -v gh >/dev/null 2>&1; then
        gh release create "${TAG}" "${ZIP_PATH}" \
            --title "Vulkan Entdecker ${TAG}" \
            --notes "Offizielles Release ${TAG} des interaktiven 3D Vulkan Entdeckers."
        echo "✓ GitHub Release ${TAG} erfolgreich veröffentlicht!"
    else
        echo "Hinweis: GitHub CLI ('gh') nicht gefunden. Überspringe automatischen Upload."
    fi
fi

echo "Fertig!"
