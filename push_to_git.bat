@echo off
echo Iniciando o processo de envio para o Git...

REM Configurações do Git para resolver problemas comuns
git config core.autocrlf true
git config core.safecrlf false
git config core.longpaths true
git config http.postBuffer 157286400
git config pull.rebase false
git config push.default current

REM Verifica se existe o diretório programa-de-indicacao-abc e remove se existir
if exist "programa-de-indicacao-abc" (
    echo Removendo diretório problemático...
    rmdir /S /Q programa-de-indicacao-abc
)

REM Adiciona todas as alterações
echo Adicionando alterações...
git add .

REM Solicita mensagem de commit
set /p commit_msg="Digite a mensagem do commit: "

REM Cria o commit
echo Criando commit...
git commit -m "%commit_msg%"

REM Envia para o repositório remoto
echo Enviando para o repositório remoto...
git push -f origin main

echo Processo concluído!
pause 