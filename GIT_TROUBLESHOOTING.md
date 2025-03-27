# Solução de Problemas do Git - Projeto Indicação ABC

Este documento fornece soluções para problemas comuns ao trabalhar com o repositório Git do projeto Indicação ABC.

## Problemas Comuns e Soluções

### 1. Erro ao fazer push: "Updates were rejected because the remote contains work that you do not have locally"

**Solução**:

```
git pull --allow-unrelated-histories origin main
git push origin main
```

Se persistir, tente:

```
git push -f origin main
```

### 2. Erro ao adicionar arquivos: "error: 'programa-de-indicacao-abc/' does not have a commit checked out"

**Solução**:

```
rmdir /S /Q programa-de-indicacao-abc  # Windows
rm -rf programa-de-indicacao-abc       # Linux/macOS
git add .
```

### 3. Erro de quebra de linha CRLF/LF

**Solução**:

```
git config core.autocrlf true
git config core.safecrlf false
```

### 4. Erro de arquivo muito grande ou path muito longo

**Solução**:

```
git config http.postBuffer 157286400
git config core.longpaths true
```

### 5. Erro de conflito de mesclagem (merge conflict)

**Solução**:

1. Resolva os conflitos em cada arquivo modificado (procure por marcações como `<<<<<<< HEAD`, `=======`, e `>>>>>>> branch-name`)
2. Depois de resolver, adicione os arquivos:
   ```
   git add .
   ```
3. Complete o merge:
   ```
   git commit -m "Resolve merge conflicts"
   ```

### 6. Quando tudo mais falhar: clonar novamente e recriar as alterações

Se nenhuma das soluções acima funcionar, esta é uma abordagem radical, mas eficaz:

1. Faça backup dos seus arquivos atuais
2. Clone o repositório em uma nova pasta:
   ```
   git clone https://github.com/phaisonvs/indicacao-abc.git indicacao-abc-novo
   ```
3. Copie seus arquivos modificados para a nova pasta
4. Adicione e comite a partir da nova pasta

## Configurações Recomendadas do Git

Para evitar problemas, recomendamos configurar o Git da seguinte forma:

```
git config core.autocrlf true
git config core.safecrlf false
git config core.longpaths true
git config http.postBuffer 157286400
git config pull.rebase false
git config push.default current
```

## Scripts de Automação

Você pode usar os scripts fornecidos no projeto para automatizar o processo de envio ao Git:

- `push_to_git.bat` (Windows)
- `push_to_git.sh` (Linux/macOS)

Esses scripts aplicam as configurações recomendadas e lidam com casos comuns de erro.
