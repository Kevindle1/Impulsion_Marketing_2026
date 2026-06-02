Set objShell = CreateObject("WScript.Shell")
strPath = objShell.CurrentDirectory

' Déterminer le navigateur à utiliser (Chrome ou Edge)
chromeExe = "C:\Program Files\Google\Chrome\Application\chrome.exe"
edgeExe = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

Set objFSO = CreateObject("Scripting.FileSystemObject")

If objFSO.FileExists(chromeExe) Then
    browser = chromeExe
ElseIf objFSO.FileExists(edgeExe) Then
    browser = edgeExe
Else
    MsgBox "Chrome ou Edge requis pour lancer Impulsion Marketing", vbCritical, "Navigateur non trouvé"
    WScript.Quit
End If

' Lancer l'application en mode app (sans barre d'adresse) — écran de connexion
htmlPath = "file:///" & Replace(strPath, "\", "/") & "/login.html"
objShell.Run """" & browser & """ --app=""" & htmlPath & """ --window-size=1400,900", 1, False
