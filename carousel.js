class Carousel {
  constructor(elementId, options = {}) {
    console.log(`Inicializando carrossel com ID: ${elementId}`);

    // Elementos do DOM
    this.carousel = document.getElementById(elementId);
    if (!this.carousel) {
      console.error(`Elemento com ID "${elementId}" não encontrado.`);
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
      this.prevButton = document.getElementById("botaoAnterior");
      this.nextButton = document.getElementById("botaoProximo");
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
      if (index === this.currentIndex) {
        slide.setAttribute("tabindex", "0");
        slide.setAttribute("aria-hidden", "false");
      } else {
        slide.setAttribute("tabindex", "-1");
        slide.setAttribute("aria-hidden", "true");
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
      this.track.style.transform = `translateX(${this.currentTranslate}px)`;
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

document.addEventListener("DOMContentLoaded", () => {
  const resourceCarousel = new Carousel("carrossel-recursos", {
    elasticEdges: true,
    elasticFactor: 0.3,
  });
});
