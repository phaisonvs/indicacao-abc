// Classe Carousel para gerenciar o carrossel de recursos
class Carousel {
  constructor(carouselClass, options = {}) {
    console.log(`Inicializando carrossel com classe: ${carouselClass}`);

    // Elementos do DOM
    this.carousel = document.querySelector(`.${carouselClass}`);
    if (!this.carousel) {
      console.error(`Elemento com classe "${carouselClass}" não encontrado.`);
      return;
    }

    // Encontrar pais e elementos relacionados
    const secaoRecursos = this.carousel.closest(".secao-recursos");
    this.track = this.carousel.querySelector(".trilha-recursos");

    if (secaoRecursos) {
      this.prevButton = secaoRecursos.querySelector(
        '.botao-carrossel[aria-label="Recursos anteriores"]'
      );
      this.nextButton = secaoRecursos.querySelector(
        '.botao-carrossel[aria-label="Próximos recursos"]'
      );
    } else {
      this.prevButton = document.querySelector(".botao-anterior");
      this.nextButton = document.querySelector(".botao-proximo");
    }

    if (!this.track) {
      console.error("Elemento .trilha-recursos não encontrado.");
      return;
    }

    if (!this.prevButton) {
      console.error("Botão anterior não encontrado.");
      return;
    }

    if (!this.nextButton) {
      console.error("Botão próximo não encontrado.");
      return;
    }

    // Configurações
    this.options = {
      transitionDuration: 300,
      elasticEdges: true, // Nova opção para bordas elásticas
      elasticFactor: 0.3, // Fator de resistência para o efeito elástico
      ...options,
    };

    // Estado
    this.slides = Array.from(this.track.querySelectorAll(".cartao-recurso"));
    this.slideCount = this.slides.length;
    this.currentIndex = 0;
    this.slideWidth = 0;
    this.isDragging = false;
    this.startPos = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.animationID = 0;
    this.dragThreshold = 50;
    this.maxDragResistance = 100; // Limite máximo de arrasto nas bordas

    this.init();
  }

  init() {
    this.setupAccessibility();
    this.calculateDimensions();
    this.setupEventListeners();
    this.setPositionByIndex();
    this.setupResizeObserver();
    this.updateButtonStates();
    console.log("Carrossel inicializado com sucesso!");
  }

  setupAccessibility() {
    // Adicionar atributos ARIA
    this.carousel.setAttribute("role", "region");
    this.carousel.setAttribute("aria-label", "Carrossel de recursos");
    this.track.setAttribute("role", "list");
    this.track.setAttribute("aria-live", "polite");

    // Configurar os slides com atributos ARIA
    this.slides.forEach((slide, index) => {
      slide.setAttribute("role", "listitem");
      slide.setAttribute("tabindex", index === 0 ? "0" : "-1");
      slide.setAttribute(
        "aria-label",
        `Slide ${index + 1} de ${this.slideCount}`
      );
    });

    // Adicionar instruções de acessibilidade (hidden para usuários visuais)
    const instructions = document.createElement("div");
    instructions.className = "sr-only";
    instructions.textContent =
      "Use as setas esquerda e direita para navegar entre os slides";
    this.carousel.prepend(instructions);
  }

  calculateDimensions() {
    const carouselWidth = this.carousel.clientWidth;
    let slidesPerView = 1;

    if (window.innerWidth >= 1024) {
      slidesPerView = 2.5;
    } else if (window.innerWidth >= 640) {
      slidesPerView = 2;
    }

    this.slideWidth = carouselWidth / slidesPerView;
    this.maxScroll = -(this.slideWidth * (this.slideCount - slidesPerView));

    // Ajustar a largura dos slides
    this.slides.forEach((slide) => {
      slide.style.width = `${this.slideWidth - 24}px`;
    });

    // Equalizar a altura dos slides para o maior conteúdo (opcional)
    this.adjustSlideHeights();
  }

  // Método para ajustar as alturas dos slides
  adjustSlideHeights() {
    // Resetar todas as alturas para que sejam baseadas no conteúdo
    this.slides.forEach((slide) => {
      slide.style.minHeight = "auto";
      slide.style.height = "auto";
    });

    // Não vamos mais definir uma altura mínima uniforme
    // Cada card terá sua própria altura com base no conteúdo
  }

  setupEventListeners() {
    // Navegação com botões
    this.prevButton.addEventListener("click", () => this.goToPrev());
    this.nextButton.addEventListener("click", () => this.goToNext());

    // Suporte a teclado
    this.carousel.addEventListener("keydown", this.handleKeyDown.bind(this));

    if (this.options.useDragScroll) {
      // Eventos de arrastar (mouse)
      this.track.addEventListener("mousedown", this.dragStart.bind(this));
      this.track.addEventListener("mousemove", this.drag.bind(this));
      this.track.addEventListener("mouseup", this.dragEnd.bind(this));
      this.track.addEventListener("mouseleave", this.dragEnd.bind(this));

      // Eventos de arrastar (touch)
      this.track.addEventListener("touchstart", this.dragStart.bind(this));
      this.track.addEventListener("touchmove", this.drag.bind(this));
      this.track.addEventListener("touchend", this.dragEnd.bind(this));

      // Desabilitar comportamento padrão (como seleção de texto)
      this.track.addEventListener("dragstart", (e) => e.preventDefault());
    }
  }

  setupResizeObserver() {
    // Observar mudanças de tamanho da janela
    window.addEventListener("resize", () => {
      // Debounce para evitar cálculos excessivos
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.calculateDimensions();
        this.setPositionByIndex();
      }, 200);
    });

    // Ajustar alturas quando o conteúdo for carregado completamente
    window.addEventListener("load", () => {
      this.adjustSlideHeights();
    });
  }

  updateButtonStates() {
    // Atualizar estado dos botões baseado na posição atual
    if (this.prevButton) {
      this.prevButton.disabled = this.currentIndex === 0;
      this.prevButton.style.opacity = this.currentIndex === 0 ? "0.5" : "1";
    }

    if (this.nextButton) {
      const isLastSlide =
        this.currentIndex >= this.slideCount - this.getVisibleSlides();
      this.nextButton.disabled = isLastSlide;
      this.nextButton.style.opacity = isLastSlide ? "0.5" : "1";
    }
  }

  getVisibleSlides() {
    if (window.innerWidth >= 1024) return 2.5;
    if (window.innerWidth >= 640) return 2;
    return 1;
  }

  setPositionByIndex(withTransition = true) {
    const visibleSlides = this.getVisibleSlides();
    const maxIndex = this.slideCount - visibleSlides;

    // Garantir que o índice esteja dentro dos limites
    this.currentIndex = Math.max(0, Math.min(this.currentIndex, maxIndex));

    // Calcular a nova posição
    this.currentTranslate = this.currentIndex * -this.slideWidth;
    this.prevTranslate = this.currentTranslate;

    // Aplicar a transformação com animação suave
    cancelAnimationFrame(this.animationID);
    this.animationID = requestAnimationFrame(() => {
      this.track.style.transition = withTransition
        ? `transform ${this.options.transitionDuration}ms ease-out`
        : "none";
      this.track.style.transform = `translateX(${this.currentTranslate}px)`;
    });

    this.updateButtonStates();
    this.updateActiveStates();
  }

  updateActiveStates() {
    // Atualizar estado ativo dos slides para acessibilidade
    this.slides.forEach((slide, index) => {
      const isActive = index === this.currentIndex;
      if (isActive) {
        slide.setAttribute("tabindex", "0");
        slide.setAttribute("aria-hidden", "false");
        // Não alteramos o estilo dos elementos para não interferir com o hover
      } else {
        slide.setAttribute("tabindex", "-1");
        slide.setAttribute("aria-hidden", "true");
        // Não alteramos o estilo dos elementos para não interferir com o hover
      }
    });

    // Anunciar para leitores de tela
    const liveRegion = this.track.getAttribute("aria-live");
    if (liveRegion) {
      this.track.setAttribute("aria-live", "off");
      setTimeout(() => {
        this.track.setAttribute("aria-live", liveRegion);
      }, 50);
    }
  }

  /* Funcionalidade de arrasto */
  getPositionX(event) {
    return event.type.includes("mouse")
      ? event.pageX
      : event.touches[0].clientX;
  }

  dragStart(event) {
    // Obter a posição inicial
    this.startPos = this.getPositionX(event);
    this.isDragging = true;
    this.startTime = new Date();

    // Desabilitar transição durante o arrasto
    this.track.style.transition = "none";

    // Cancelar qualquer animação em andamento
    cancelAnimationFrame(this.animationID);
  }

  drag(event) {
    if (!this.isDragging) return;
    event.preventDefault();

    const currentPosition = this.getPositionX(event);
    const diff = currentPosition - this.startPos;
    let newTranslate = this.prevTranslate + diff;

    // Aplicar resistência nas extremidades
    if (this.options.elasticEdges) {
      if (newTranslate > 0) {
        // Resistência no início
        newTranslate = newTranslate * this.options.elasticFactor;
      } else if (newTranslate < this.maxScroll) {
        // Resistência no final
        const overScroll = newTranslate - this.maxScroll;
        newTranslate = this.maxScroll + overScroll * this.options.elasticFactor;
      }
    }

    this.currentTranslate = newTranslate;

    requestAnimationFrame(() => {
      // Aplicamos a transformação apenas ao trilho, não aos cartões individuais
      this.track.style.transform = `translateX(${this.currentTranslate}px)`;

      // Garantimos que a transformação não afete o hover dos cartões
      this.slides.forEach((slide) => {
        // Mantemos o z-index e outras propriedades que afetam o hover
        slide.style.pointerEvents = "auto";
      });
    });
  }

  dragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;

    const movedDistance = this.currentTranslate - this.prevTranslate;
    const threshold = this.slideWidth * 0.2; // 20% da largura do slide

    if (Math.abs(movedDistance) > threshold) {
      if (
        movedDistance < 0 &&
        this.currentIndex < this.slideCount - this.getVisibleSlides()
      ) {
        this.currentIndex++;
      } else if (movedDistance > 0 && this.currentIndex > 0) {
        this.currentIndex--;
      }
    }

    // Sempre retornar para uma posição válida
    this.setPositionByIndex(true);
  }

  goToNext() {
    if (this.currentIndex < this.slideCount - this.getVisibleSlides()) {
      this.currentIndex++;
      this.setPositionByIndex();
    } else {
      // Efeito de resistência ao tentar avançar no último slide
      this.track.style.transform = `translateX(${
        this.currentTranslate - 10
      }px)`;
      setTimeout(() => {
        this.track.style.transform = `translateX(${this.currentTranslate}px)`;
      }, 150);
    }
  }

  goToPrev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.setPositionByIndex();
    } else {
      // Efeito de resistência ao tentar voltar no primeiro slide
      this.track.style.transform = `translateX(${
        this.currentTranslate + 10
      }px)`;
      setTimeout(() => {
        this.track.style.transform = `translateX(${this.currentTranslate}px)`;
      }, 150);
    }
  }

  handleKeyDown(event) {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        this.goToPrev();
        break;
      case "ArrowRight":
        event.preventDefault();
        this.goToNext();
        break;
      default:
        return;
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Gerenciamento de posicionamento do carrossel
  const conteudoPrincipal = document.querySelector(".conteudo-principal");
  const secaoFormulario = document.querySelector(".secao-formulario");
  const secaoRecursos = document.querySelector(".secao-recursos");
  const secaoPrincipal = document.querySelector(".secao-principal");

  // Defina o tempo de delay em milissegundos
  const delayTime = 1200; // Aumente o valor para um delay maior, por exemplo, 1200ms

  // Inicializar o carrossel e torná-lo disponível globalmente
  window.resourceCarousel = new Carousel("carrossel-recursos", {
    elasticEdges: true,
    elasticFactor: 0.3,
  });

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
    // Usar classes como identificadores em vez de IDs
    const inputIdentifier =
      Array.from(input.classList).find(
        (className) =>
          className.includes("nome-") ||
          className.includes("telefone-") ||
          className.includes("loja-") ||
          className.includes("campo-")
      ) || input.classList[0];

    inputsTocados[inputIdentifier] = false; // Inicializa todos os inputs como não tocados
    input.style.borderColor = ""; // Remove qualquer borda de erro

    const mensagemErro = input.nextElementSibling;
    if (mensagemErro && mensagemErro.classList.contains("mensagem-erro")) {
      mensagemErro.textContent = ""; // Limpa qualquer mensagem de erro
      mensagemErro.classList.remove("visivel");
    }
  });

  // Função para validar um input específico
  const validarInput = (input) => {
    // Identificar o input por sua classe específica
    const inputIdentifier =
      Array.from(input.classList).find(
        (className) =>
          className.includes("nome-") ||
          className.includes("telefone-") ||
          className.includes("loja-") ||
          className.includes("campo-")
      ) || input.classList[0];

    // Se o input não foi tocado e está vazio, não mostra erro
    if (!inputsTocados[inputIdentifier] || input.value.trim() === "")
      return true;

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
    // Identificar o input por sua classe específica
    const inputIdentifier =
      Array.from(input.classList).find(
        (className) =>
          className.includes("nome-") ||
          className.includes("telefone-") ||
          className.includes("loja-") ||
          className.includes("campo-")
      ) || input.classList[0];

    // Quando o usuário começa a digitar
    input.addEventListener("input", function () {
      inputsTocados[inputIdentifier] = true;
      validarInput(input);
      verificarEstadoBotao(inputsTocados);
    });

    // Quando o input perde o foco
    input.addEventListener("blur", function () {
      inputsTocados[inputIdentifier] = true;
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
      // Identificar o input por sua classe específica
      const inputIdentifier =
        Array.from(input.classList).find(
          (className) =>
            className.includes("nome-") ||
            className.includes("telefone-") ||
            className.includes("loja-") ||
            className.includes("campo-")
        ) || input.classList[0];

      inputsTocados[inputIdentifier] = true;
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
          // Identificar o input por sua classe específica
          const inputIdentifier =
            Array.from(input.classList).find(
              (className) =>
                className.includes("nome-") ||
                className.includes("telefone-") ||
                className.includes("loja-") ||
                className.includes("campo-")
            ) || input.classList[0];

          inputsTocados[inputIdentifier] = false;
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
  // Identificar o select por sua classe específica
  const selectIdentifier =
    Array.from(elementoSelect.classList).find((className) =>
      className.includes("loja-")
    ) || elementoSelect.classList[0];

  // Valida o select quando ele é tocado
  if (!inputsTocados[selectIdentifier]) {
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
