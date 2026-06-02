@echo off
REM Régénère js\bundle.js à partir des modules js\*-standalone.js
REM Nécessite Node.js installé. Équivaut à `npm run build`.
cd /d "%~dp0"
node build-bundle.mjs
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo ECHEC de la generation du bundle.
  pause
  exit /b 1
)
echo bundle.js regenere avec succes.
pause
