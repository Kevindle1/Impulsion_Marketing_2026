' ============================================================
'  Impulsion Marketing — Lanceur de l'application
'  Ouvre l'app en mode "application" (fenêtre dédiée, sans barre
'  d'adresse ni onglets), via Microsoft Edge (intégré à Windows)
'  ou Google Chrome. Double-cliquer ce fichier pour démarrer.
' ============================================================
Option Explicit
Dim objShell, objFSO, appDir, browser, htmlPath, candidates, i

Set objShell = CreateObject("WScript.Shell")
Set objFSO   = CreateObject("Scripting.FileSystemObject")

' Dossier du script = racine de l'application (robuste, peu importe d'où on lance)
appDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Navigateurs candidats : Google Chrome d'abord, puis Microsoft Edge en secours.
candidates = Array( _
    objShell.ExpandEnvironmentStrings("%ProgramFiles%\Google\Chrome\Application\chrome.exe"), _
    objShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"), _
    objShell.ExpandEnvironmentStrings("%LocalAppData%\Google\Chrome\Application\chrome.exe"), _
    objShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"), _
    objShell.ExpandEnvironmentStrings("%ProgramFiles%\Microsoft\Edge\Application\msedge.exe") _
)

browser = ""
For i = 0 To UBound(candidates)
    If objFSO.FileExists(candidates(i)) Then
        browser = candidates(i)
        Exit For
    End If
Next

If browser = "" Then
    MsgBox "Google Chrome (ou Microsoft Edge) est requis pour lancer Impulsion Marketing.", _
           vbCritical, "Impulsion Marketing"
    WScript.Quit
End If

' Page d'entrée : écran de connexion
htmlPath = "file:///" & Replace(appDir, "\", "/") & "/login.html"

' Mode application : fenêtre dédiée, sans interface de navigateur, maximisée
objShell.Run """" & browser & """ --app=""" & htmlPath & """ --start-maximized --no-first-run --no-default-browser-check", 1, False
