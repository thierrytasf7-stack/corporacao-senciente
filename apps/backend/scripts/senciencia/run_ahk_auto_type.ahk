#NoEnv
SendMode Input
SetWorkingDir %A_ScriptDir%

commandFile := A_ScriptDir "\senc_command.txt"
stopFile := A_ScriptDir "\senc_stop"
processingFile := A_ScriptDir "\senc_processing"

Loop {
    Sleep, 300
    
    ; Verificar sinal de parada
    if FileExist(stopFile) {
        FileDelete, %stopFile%
        if FileExist(processingFile)
            FileDelete, %processingFile%
        ExitApp
    }
    
    ; BUG FIX: Verificar se já está processando (evitar race condition)
    if FileExist(processingFile) {
        Continue
    }
    
    if FileExist(commandFile) {
        ; Marcar como processando
        FileAppend, processing, %processingFile%
        
        FileRead, content, %commandFile%
        content := Trim(content)
        
        if (content != "") {
            WinActivate, Cursor
            WinWaitActive, Cursor, , 2
            if !WinActive("Cursor") {
                WinActivate, ahk_exe code.exe
                WinWaitActive, ahk_exe code.exe, , 2
            }
            Sleep, 120
            SendInput, %content%
            Sleep, 80
            SendInput, {Enter}
            
            ; Deletar arquivo de comando
            FileDelete, %commandFile%
            
            ; Pequeno delay antes de remover lock de processamento
            Sleep, 200
        } else {
            ; Arquivo vazio, apenas deletar
            FileDelete, %commandFile%
        }
        
        ; Remover lock de processamento
        FileDelete, %processingFile%
    }
}
