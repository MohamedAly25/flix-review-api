' FlixReview v1.2.0 - Server Startup VBScript
' This VBScript runs the PowerShell script to start both servers
' Save this as START_SERVERS.vbs and double-click to run

Dim shell, fso, scriptDir, psScript
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
psScript = scriptDir & "\START_SERVERS.ps1"

' Check if PowerShell script exists
If Not fso.FileExists(psScript) Then
    MsgBox "Error: START_SERVERS.ps1 not found in " & scriptDir, vbCritical, "FlixReview Startup Error"
    WScript.Quit 1
End If

' Check if directories exist
If Not fso.FolderExists(scriptDir & "\flixreview-backend") Then
    MsgBox "Error: flixreview-backend directory not found. Please run from project root.", vbCritical, "FlixReview Startup Error"
    WScript.Quit 1
End If

If Not fso.FolderExists(scriptDir & "\flixreview-frontend") Then
    MsgBox "Error: flixreview-frontend directory not found. Please run from project root.", vbCritical, "FlixReview Startup Error"
    WScript.Quit 1
End If

' Execute PowerShell script
Dim command
command = "powershell.exe -ExecutionPolicy Bypass -File """ & psScript & """"

' Run the command (0 = hidden window, false = don't wait)
shell.Run command, 0, false

' Optional: Show a message
' MsgBox "FlixReview servers are starting...", vbInformation, "FlixReview v1.2.0"