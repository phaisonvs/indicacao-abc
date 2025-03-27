# Programa de Indicação ABC

Uma landing page responsiva para o programa de indicação da ABC da Construção, com formulário interativo e carrossel de recursos animado.

## Funcionalidades

- **Design Responsivo**: Layout totalmente responsivo que funciona em telas móveis, tablets e desktops
- **Formulário Interativo**: Formulário com validação em tempo real e feedback visual
- **Carrossel de Recursos Animado**: Carrossel amigável para dispositivos móveis que apresenta os benefícios do programa
- **Acessibilidade**: Atributos ARIA e HTML semântico para melhor acessibilidade
- **Interface Moderna**: Design limpo e moderno com animações e transições suaves

## Tecnologias Utilizadas

- HTML5
- CSS3 (com classes utilitárias customizadas)
- JavaScript (ES6+)
- Font Awesome para ícones

## Estrutura do Projeto

```
indicacao-abc/
├── index.html          # Arquivo HTML principal
├── styles.css          # Estilos CSS customizados
├── script.js           # Funcionalidades JavaScript (incluindo o carrossel)
├── push_to_git.bat     # Script para envio ao Git (Windows)
├── push_to_git.sh      # Script para envio ao Git (Linux/macOS)
├── assets/             # Pasta de imagens e recursos
└── README.md           # Documentação do projeto
```

## Envio de Atualizações para o GitHub

### Usando os Scripts Automatizados

Para facilitar o envio das alterações para o GitHub e evitar problemas comuns, foram criados scripts automatizados:

#### Windows:

1. Abra o Windows Explorer e navegue até a pasta do projeto
2. Dê um duplo clique em `push_to_git.bat`
3. Siga as instruções na tela para digitar a mensagem do commit
4. O script fará o resto!

#### Linux/macOS:

1. Abra o Terminal
2. Navegue até a pasta do projeto usando `cd caminho/para/o/projeto`
3. Execute o script com `sh push_to_git.sh`
4. Siga as instruções na tela para digitar a mensagem do commit

### Envio Manual

Se preferir enviar manualmente, siga estes passos:

1. Configure o Git para lidar com caminhos longos e quebra de linha:

   ```
   git config core.autocrlf true
   git config core.safecrlf false
   git config core.longpaths true
   git config http.postBuffer 157286400
   ```

2. Adicione todos os arquivos modificados:

   ```
   git add .
   ```

3. Crie um commit com uma mensagem descritiva:

   ```
   git commit -m "Descrição das alterações"
   ```

4. Envie para o GitHub:

   ```
   git push origin main
   ```

5. Se ocorrer algum erro, tente com a opção de força:
   ```
   git push -f origin main
   ```

## Detalhes de Implementação

### Tipografia Responsiva

O projeto utiliza a função CSS `clamp()` para criar tipografia responsiva que se adapta suavemente a diferentes tamanhos de tela:

```css
:root {
  --font-h1-hero-section: clamp(40px, 3vw + 28px, 64px);
  --font-h2-sub-title: clamp(16px, 1.2vw, 18px);
  --font-h3-section-title: clamp(24px, 1.5vw, 32px);
}
```

### Validação de Formulário

O formulário inclui validação em tempo real com feedback visual:

- Validação de nome completo
- Formatação e validação de número de telefone
- Feedback visual para todos os estados de entrada (foco, preenchido, erro, desativado)

### Carrossel de Recursos

Em dispositivos móveis e tablets, a seção de recursos se transforma em um carrossel interativo:

- Botões de navegação para controle manual
- Transições suaves entre slides
- Conversão automática para layout em grade em desktop
- Suporte para interação via teclado

## Boas Práticas Implementadas

1. **HTML Semântico**: Uso de elementos HTML apropriados para melhor acessibilidade e SEO
2. **Abordagem Mobile-First**: Design para dispositivos móveis primeiro, depois aprimorado para telas maiores
3. **Melhoramento Progressivo**: Funcionalidade principal funciona sem JavaScript
4. **Acessibilidade**: Rótulos ARIA, navegação por teclado e suporte para leitores de tela
5. **Otimização de Desempenho**: Animações e transições aceleradas por hardware
6. **Código Limpo**: Código bem organizado e comentado para facilitar a manutenção

## Executando o Projeto

Basta abrir o arquivo `index.html` em um navegador web moderno. Nenhuma etapa de compilação ou configuração de servidor é necessária.

## Compatibilidade com Navegadores

- Chrome (mais recente)
- Firefox (mais recente)
- Safari (mais recente)
- Edge (mais recente)
- Navegadores móveis (iOS Safari, Android Chrome)

## Créditos

- Ícones do [Font Awesome](https://fontawesome.com)
- Fonte [Chivo](https://fonts.google.com/specimen/Chivo) do Google Fonts
