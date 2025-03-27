document.addEventListener("DOMContentLoaded", function () {
  // Gerenciamento de posicionamento do carrossel
  const conteudoPrincipal = document.querySelector(".conteudo-principal");
  const secaoFormulario = document.querySelector(".secao-formulario");
  const secaoRecursos = document.querySelector(".secao-recursos");
  const secaoPrincipal = document.querySelector(".secao-principal");

  // Defina o tempo de delay em milissegundos
  const delayTime = 1200; // Aumente o valor para um delay maior, por exemplo, 1200ms

  // Função para mover o carrossel
  function posicionarCarrossel() {
    if (window.innerWidth >= 1024) {
      // Desktop
      if (secaoRecursos.parentElement !== conteudoPrincipal) {
        const subtitulo = conteudoPrincipal.querySelector(".sub-title");
        if (subtitulo && subtitulo.nextSibling) {
          conteudoPrincipal.insertBefore(secaoRecursos, subtitulo.nextSibling);
        }
      }
    } else {
      // Mobile
      if (secaoRecursos.parentElement !== secaoPrincipal) {
        secaoPrincipal.insertBefore(secaoRecursos, secaoFormulario.nextSibling);
      }
    }

    // Força recálculo das dimensões do carrossel
    if (window.resourceCarousel) {
      window.resourceCarousel.calculateDimensions();
      window.resourceCarousel.setPositionByIndex();
    }
  }

  // Observar mudanças no tamanho da tela
  const resizeObserver = new ResizeObserver(() => {
    posicionarCarrossel();
  });

  resizeObserver.observe(document.body);
  posicionarCarrossel();
  inicializarValidacaoFormulario();
  aprimorarSelect();

  // Adiciona a funcionalidade de rolagem suave
  const saibaMaisBtn = document.querySelector(".botao-cta");
  const carrosselSection = document.querySelector(".carrossel-recursos");

  if (saibaMaisBtn && carrosselSection) {
    saibaMaisBtn.addEventListener("click", function (event) {
      event.preventDefault(); // Previne o comportamento padrão do botão
      carrosselSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Adiciona um atraso antes de aplicar a classe fade-in
  const content = document.querySelector(".conteudo-altura-maxima");

  // Define um atraso antes de adicionar a classe
  setTimeout(() => {
    content.classList.add("fade-in");
  }, delayTime); // Use a variável delayTime aqui

  // Melhorar a experiência de hover nos cartões
  const cartoes = document.querySelectorAll(".cartao-recurso");

  // Adicionar eventos para cada cartão
  cartoes.forEach((cartao) => {
    // Garantir que o z-index seja aplicado corretamente no hover
    cartao.addEventListener("mouseenter", function () {
      // Certificar que o z-index é maior que os outros cartões
      this.style.zIndex = "10";
    });

    cartao.addEventListener("mouseleave", function () {
      // Voltar ao z-index normal após o hover
      setTimeout(() => {
        this.style.zIndex = "";
      }, 300); // Corresponde à duração da transição CSS
    });

    // Adicionar classes para melhorar a experiência de foco por teclado
    cartao.addEventListener("focus", function () {
      this.classList.add("cartao-focado");
    });

    cartao.addEventListener("blur", function () {
      this.classList.remove("cartao-focado");
    });
  });
});

/**
 * Validação do Formulário
 */
function inicializarValidacaoFormulario() {
  const formulario = document.querySelector(".formulario-cotacao");
  const botaoEnviar = formulario.querySelector(".botao-formulario");
  const inputTermos = formulario.querySelector(".checkbox-termos");
  const mensagemTermos = formulario.querySelector(".mensagem-erro");

  botaoEnviar.disabled = true;
  let formularioEnviado = false;

  // Objeto para rastrear quais inputs foram tocados pelo usuário
  const inputsTocados = {};

  // Limpar qualquer estilo de erro que possa ter sido aplicado no carregamento da página
  const todosInputs = formulario.querySelectorAll("input, select");
  todosInputs.forEach((input) => {
    const id = input.id;
    inputsTocados[id] = false; // Inicializa todos os inputs como não tocados
    input.style.borderColor = ""; // Remove qualquer borda de erro

    const mensagemErro = input.nextElementSibling;
    if (mensagemErro && mensagemErro.classList.contains("mensagem-erro")) {
      mensagemErro.textContent = ""; // Limpa qualquer mensagem de erro
      mensagemErro.classList.remove("visivel");
    }
  });

  // Função para validar um input específico
  const validarInput = (input) => {
    // Se o input não foi tocado e está vazio, não mostra erro
    if (!inputsTocados[input.id] || input.value.trim() === "") return true;

    let valido = true;
    if (input.type === "text" && input.classList.contains("input-nome")) {
      // Validação específica para nome completo
      if (input.value.trim() !== "") {
        valido = validarInputCondicional(
          input,
          nomeCompletoValido,
          "Digite seu nome completo"
        );
      }
    } else if (input.type === "email") {
      // Validação específica para email
      if (input.value.trim() !== "") {
        valido = validarInputCondicional(
          input,
          emailValido,
          "Digite um email válido"
        );
      }
    } else if (input.type === "tel") {
      // Validação específica para telefone
      if (input.value.trim() !== "") {
        valido = validarInputCondicional(
          input,
          telefoneValido,
          "Digite um telefone válido"
        );
      }
    } else if (input.tagName.toLowerCase() === "select") {
      valido = validarSelectCondicional(input);
    }
    return valido;
  };

  // Adiciona eventos para cada input
  todosInputs.forEach((input) => {
    // Quando o usuário começa a digitar
    input.addEventListener("input", function () {
      inputsTocados[input.id] = true;
      validarInput(input);
      verificarEstadoBotao(inputsTocados);
    });

    // Quando o input perde o foco
    input.addEventListener("blur", function () {
      inputsTocados[input.id] = true;
      validarInput(input);
      verificarEstadoBotao(inputsTocados);
    });

    // Formata telefone durante a digitação
    if (input.type === "tel") {
      input.addEventListener("input", function () {
        const valor = input.value.replace(/\D/g, "");
        input.value = formatarTelefoneBrasileiro(valor);
      });
    }
  });

  // Validação do checkbox de termos
  inputTermos.addEventListener("change", function () {
    if (formularioEnviado && !inputTermos.checked) {
      mensagemTermos.classList.add("visivel");
    } else {
      mensagemTermos.classList.remove("visivel");
    }
    verificarEstadoBotao(inputsTocados);
  });

  // Submissão do formulário
  formulario.addEventListener("submit", function (e) {
    e.preventDefault();
    formularioEnviado = true;

    // Marca todos os inputs como tocados para validação completa
    todosInputs.forEach((input) => {
      inputsTocados[input.id] = true;
      validarInput(input);
    });

    // Valida todos os campos
    let formValido = true;

    todosInputs.forEach((input) => {
      if (!validarInput(input)) {
        formValido = false;
      }
    });

    // Verifica o checkbox de termos
    if (!inputTermos.checked) {
      mensagemTermos.classList.add("visivel");
      formValido = false;
    }

    if (formValido) {
      // Anima o botão de envio
      botaoEnviar.classList.add("animar-pulso");
      botaoEnviar.innerHTML = "<span>Processando...</span>";

      // Simula o envio do formulário (substitua por uma chamada de API real)
      setTimeout(() => {
        // Reseta o formulário
        formulario.reset();
        mensagemTermos.classList.remove("visivel");

        // Limpa todas as flags de inputs tocados
        todosInputs.forEach((input) => {
          inputsTocados[input.id] = false;
          input.style.borderColor = "";
          const mensagemErro = input.nextElementSibling;
          if (
            mensagemErro &&
            mensagemErro.classList.contains("mensagem-erro")
          ) {
            mensagemErro.textContent = "";
            mensagemErro.classList.remove("visivel");
          }
        });

        // Mostra mensagem de sucesso
        botaoEnviar.classList.remove("animar-pulso");
        botaoEnviar.innerHTML = "<span>Cotação Solicitada!</span>";
        botaoEnviar.style.backgroundColor = "var(--cor-sucesso)";

        // Reseta o botão após 3 segundos
        setTimeout(() => {
          botaoEnviar.innerHTML = "<span>Enviar Indicação Agora</span>";
          botaoEnviar.style.backgroundColor = "var(--cor-destaque)";
          botaoEnviar.disabled = true;
        }, 3000);
      }, 1500);
    }
  });

  // Verificação inicial do estado do botão (desativado por padrão)
  verificarEstadoBotao(inputsTocados);
}

/**
 * Funções auxiliares de validação
 */
function validarInputCondicional(
  input,
  funcaoValidacao,
  mensagemErroPersonalizada
) {
  const mensagemErro = input.nextElementSibling;
  const valido = funcaoValidacao(input.value);

  if (!valido) {
    input.style.borderColor = "var(--cor-erro)";
    if (mensagemErro && mensagemErro.classList.contains("mensagem-erro")) {
      mensagemErro.textContent = mensagemErroPersonalizada;
      mensagemErro.classList.add("visivel");
    }
  } else {
    input.style.borderColor = "";
    if (mensagemErro && mensagemErro.classList.contains("mensagem-erro")) {
      mensagemErro.textContent = "";
      mensagemErro.classList.remove("visivel");
    }
  }

  return valido;
}

function validarSelectCondicional(elementoSelect) {
  // Valida o select quando ele é tocado
  if (!inputsTocados[elementoSelect.id]) {
    return true;
  }

  const elementoErro = elementoSelect.nextElementSibling;
  const estaValido = elementoSelect.value !== "";

  if (!estaValido) {
    elementoSelect.style.borderColor = "var(--cor-erro)"; // Usa a variável CSS de erro
    if (elementoErro && elementoErro.classList.contains("mensagem-erro")) {
      elementoErro.textContent = "Este campo é obrigatório.";
      elementoErro.classList.add("visivel");
    }
  } else {
    elementoSelect.style.borderColor = ""; // Resetar a cor da borda
    if (elementoErro && elementoErro.classList.contains("mensagem-erro")) {
      elementoErro.textContent = "";
      elementoErro.classList.remove("visivel");
    }
  }

  return estaValido;
}

function emailValido(email) {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex para validação de e-mail
  return regexEmail.test(email);
}

function apenasLetrasEEspacos(texto) {
  const regexNome = /^[A-Za-zÀ-ÿ\s]+$/; // Permite letras e espaços, incluindo acentos
  return regexNome.test(texto);
}

function nomeCompletoValido(nome) {
  if (!nome.trim()) {
    return false; // Campo vazio
  }
  const nomes = nome.trim().split(/\s+/);
  return nomes.length >= 2; // Deve conter pelo menos dois nomes
}

function telefoneValido(telefone) {
  const numeroLimpo = telefone.replace(/\D/g, "");
  return numeroLimpo.length >= 10; // Verifica se tem pelo menos 10 dígitos
}

function formatarTelefoneBrasileiro(valor) {
  if (!valor) return "";
  valor = valor.replace(/\D/g, ""); // Remove caracteres não numéricos
  if (valor.length > 11) {
    valor = valor.substring(0, 11);
  }
  if (valor.length <= 2) {
    return valor;
  } else if (valor.length <= 6) {
    return `(${valor.substring(0, 2)}) ${valor.substring(
      2,
      3
    )} ${valor.substring(3)}`;
  } else {
    return `(${valor.substring(0, 2)}) ${valor.substring(
      2,
      3
    )} ${valor.substring(3, 7)}-${valor.substring(7)}`;
  }
}

// Adicione esta função na inicialização
function aprimorarSelect() {
  const selects = document.querySelectorAll("select");

  selects.forEach((select) => {
    // Adicionar event listener para marcar a opção quando houver hover
    select.addEventListener("mouseover", function (event) {
      if (event.target.tagName === "OPTION") {
        // Remover classe de qualquer opção anterior
        Array.from(select.options).forEach((opt) => {
          opt.classList.remove("option-hover");
        });

        // Adicionar classe à opção atual
        event.target.classList.add("option-hover");
      }
    });

    // Adicionar evento de clique para maior compatibilidade
    select.addEventListener("click", function () {
      // Essa função vazia melhora o comportamento em alguns navegadores
      // ao forçar o reflow dos estilos personalizados
    });

    // Envolver o select em um wrapper se ainda não estiver
    if (!select.parentNode.classList.contains("select-wrapper")) {
      const wrapper = document.createElement("div");
      wrapper.classList.add("select-wrapper");
      select.parentNode.insertBefore(wrapper, select);
      wrapper.appendChild(select);
    }
  });
}

// Função atualizada para verificar o estado do botão
function verificarEstadoBotao(inputsTocados) {
  const formulario = document.querySelector(".formulario-cotacao");
  const botaoEnviar = formulario.querySelector(".botao-formulario");
  const inputTermos = formulario.querySelector(".checkbox-termos");
  const todosInputs = formulario.querySelectorAll("input, select");

  let formValido = true;

  // Verifica se todos os campos obrigatórios foram preenchidos corretamente
  todosInputs.forEach((input) => {
    if (input.type === "text" && input.classList.contains("input-nome")) {
      if (!nomeCompletoValido(input.value)) {
        formValido = false;
      }
    } else if (input.type === "email") {
      if (!emailValido(input.value)) {
        formValido = false;
      }
    } else if (input.type === "tel") {
      if (!telefoneValido(input.value)) {
        formValido = false;
      }
    } else if (input.tagName.toLowerCase() === "select") {
      if (!input.value || input.value === "") {
        formValido = false;
      }
    }
  });

  // Verifica se os termos foram aceitos
  if (!inputTermos.checked) {
    formValido = false;
  }

  // Atualiza o estado do botão
  botaoEnviar.disabled = !formValido;
  if (formValido) {
    botaoEnviar.classList.add("ativo");
    botaoEnviar.classList.add("texto-branco");
  } else {
    botaoEnviar.classList.remove("ativo");
    botaoEnviar.classList.remove("texto-branco");
  }
}
