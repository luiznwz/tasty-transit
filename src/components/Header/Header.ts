export default class Header extends HTMLElement {
  iconMenu: HTMLElement;
  menuMobile: HTMLElement;
  closeMenuMobile: HTMLElement;
  mainLinkWithMenu: NodeListOf<HTMLElement>;
  submenus: NodeListOf<HTMLElement>;
  submenuBack: NodeListOf<HTMLElement>;
  mainLinks: HTMLElement;

  searchBtn: HTMLElement;
  searchInputContainer: HTMLElement;

  menuDesktop: HTMLElement;
  scrollPosition: number = 0;

  constructor() {
    super();

    // Use querySelector no this para elementos dentro do componente
    this.iconMenu = this.querySelector(".menu_svg") as HTMLElement;
    this.menuMobile = this.querySelector(".header__mobile_menu .nav_items") as HTMLElement;
    this.closeMenuMobile = this.querySelector(".header__mobile_menu .close_nav_items") as HTMLElement;
    this.mainLinkWithMenu = this.querySelectorAll(".nav_items [data-menu]") as NodeListOf<HTMLElement>;
    this.mainLinks = this.querySelector(".header__mobile_menu .main_items") as HTMLElement;
    this.submenus = this.querySelectorAll(".nav_items [data-submenu]") as NodeListOf<HTMLElement>;
    this.submenuBack = this.querySelectorAll(".nav_items .submenu_back__container") as NodeListOf<HTMLElement>;

    // Estes elementos podem estar fora do componente, então use document.querySelector
    this.searchBtn = document.querySelector(".header__nav_icons .search_btn") as HTMLElement;
    this.searchInputContainer = document.querySelector(".header__nav_icons .search_input__container") as HTMLElement;
    this.menuDesktop = document.querySelector(".header__desktop_menu") as HTMLElement;

    if (!this.iconMenu || !this.menuMobile) {
        console.error('Required elements not found in Header component');
        return;
    }

    this.initEventListeners();
}

  initEventListeners() {
    this.iconMenu.addEventListener("click", () => this.toggleMenuMobile());
    this.closeMenuMobile.addEventListener("click", () =>
      this.toggleMenuMobile()
    );
    this.mainLinkWithMenu.forEach((element) => {
      element.addEventListener("click", () =>
        this.toggleSubMenu(element.dataset.menu as string, element)
      );
      element.addEventListener("mouseenter", () =>
        this.toggleSubMenu(element.dataset.menu as string, element)
      );
      this.addEventListener("mouseleave", () => this.closeSubmenus());
    });

    this.submenuBack.forEach((element) => {
      element.addEventListener("click", () => this.closeSubmenus());
    });

    this.searchBtn.addEventListener("click", () => this.toggleSearchInput());

    window.addEventListener("scroll", (e) => {
      if (window.scrollY > this.scrollPosition) {
        this.menuDesktop.toggleAttribute("closed", window.scrollY > 200);
      } else {
        this.menuDesktop.removeAttribute("closed");
      }
      this.scrollPosition = window.scrollY;
    });
  }

  toggleMenuMobile() {
    this.menuMobile.toggleAttribute("open");
    if (this.menuMobile.hasAttribute("open")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    this.closeSubmenus();
  }

  toggleSubMenu(dataset: string, element: HTMLElement) {
    const submenuSelected = this.querySelectorAll(
      `[data-submenu="${dataset}"]`
    ) as NodeListOf<HTMLElement>;

    this.closeSubmenus();
    submenuSelected.forEach((submenu) => {
      element.setAttribute("active", "");
      submenu.removeAttribute("closed");
      this.mainLinks.setAttribute("closed", "");
    });
  }

  closeSubmenus() {
    this.submenus.forEach((submenu) => {
      submenu.setAttribute("closed", "");
    });

    this.mainLinkWithMenu.forEach((element) => {
      element.removeAttribute("active");
    });

    this.mainLinks.removeAttribute("closed");
  }

  toggleSearchInput() {
    this.searchInputContainer.toggleAttribute("open");
  }
}
// ... no final do arquivo, após a definição da classe
customElements.define('header-component', Header);
