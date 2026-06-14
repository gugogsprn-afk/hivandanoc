Set oShell = CreateObject("WScript.Shell")
Set oFS = CreateObject("Scripting.FileSystemObject")
sDir = oFS.GetParentFolderName(WScript.ScriptFullName)
sBat = sDir & "\СМОТРЕТЬ.bat"

If Not oFS.FileExists(sBat) Then
  MsgBox "Файл СМОТРЕТЬ.bat не найден." & vbCrLf & sDir, vbCritical, "Healthy Spine"
  WScript.Quit 1
End If

oShell.Run """" & sBat & """", 1, False
