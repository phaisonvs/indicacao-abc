#!/bin/bash
echo "Iniciando o processo de envio para o Git..."

# Configurações do Git para resolver problemas comuns
git config core.autocrlf true
git config core.safecrlf false
git config core.longpaths true
git config http.postBuffer 157286400
git config pull.rebase false
git config push.default current

# Verifica se existe o diretório programa-de-indicacao-abc e remove se existir
if [ -d "programa-de-indicacao-abc" ]; then
    echo "Removendo diretório problemático..."
    rm -rf programa-de-indicacao-abc
fi

# Adiciona todas as alterações
echo "Adicionando alterações..."
git add .

# Solicita mensagem de commit
echo "Digite a mensagem do commit:"
read commit_msg

# Cria o commit
echo "Criando commit..."
git commit -m "$commit_msg"

# Envia para o repositório remoto
echo "Enviando para o repositório remoto..."
git push -f origin main

echo "Processo concluído!" 