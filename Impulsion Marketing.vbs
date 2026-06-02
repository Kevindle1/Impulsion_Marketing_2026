' ============================================================
'  Impulsion Marketing — Lanceur de l'application
'  Ouvre l'app en mode "application" (fenêtre dédiée, sans barre
'  d'adresse ni onglets), via Google Chrome (ou Microsoft Edge).
'  Crée aussi un raccourci sur le Bureau. Double-cliquer pour démarrer.
' ============================================================
Option Explicit
Dim objShell, objFSO, appDir, browser, htmlPath, candidates, i

Set objShell = CreateObject("WScript.Shell")
Set objFSO   = CreateObject("Scripting.FileSystemObject")

' Dossier du script = racine de l'application (robuste, peu importe d'où on lance)
appDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Créer / mettre à jour le raccourci "Impulsion Marketing" sur le Bureau, avec l'icône de l'app.
' (Idempotent : corrige automatiquement un raccourci déjà présent — ex. icône obsolète.)
On Error Resume Next
Dim desktopDir, lnkPath, lnk
desktopDir = objShell.SpecialFolders("Desktop")
lnkPath = desktopDir & "\Impulsion Marketing.lnk"
Set lnk = objShell.CreateShortcut(lnkPath)
lnk.TargetPath = "wscript.exe"
lnk.Arguments = """" & WScript.ScriptFullName & """"
lnk.WorkingDirectory = appDir
lnk.Description = "Impulsion Marketing — pilotage des campagnes"
If objFSO.FileExists(appDir & "\impulsion.ico") Then
    lnk.IconLocation = appDir & "\impulsion.ico, 0"
End If
lnk.Save
On Error Goto 0

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
