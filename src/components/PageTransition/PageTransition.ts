class PageTransition extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    document.addEventListener("click", (e) => this.handleClick(e));
    window.addEventListener("popstate", () => this.startTransition());
    window.addEventListener("load", () => this.endTransition());
  }

  handleClick(e: Event) {
    const target = e.target as HTMLElement;
    const link = target.closest("a");

    if (
      link &&
      link.href &&
      link.href.startsWith(window.location.origin) &&
      !link.hasAttribute("target")
    ) {
      e.preventDefault();
      this.startTransition();

      setTimeout(() => {
        window.location.href = link.href;
      }, 300);
    }
  }

  startTransition() {
    const mainContent = document.querySelector(".page-content");
    if (mainContent) {
      mainContent.setAttribute("data-transitioning", "true");
    }
  }

  endTransition() {
    const mainContent = document.querySelector(".page-content");
    if (mainContent) {
      mainContent.setAttribute("data-transitioning", "false");
    }
  }
}

customElements.define("page-transition", PageTransition);

export default PageTransition;
