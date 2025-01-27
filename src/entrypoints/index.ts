import Header from '@/components/Header/Header';
import HelloWorld from '../components/HelloWorld/HelloWorld';
import CartDrawer from '@/components/CartDrawer/CartDrawer';

window.customElements.define("hello-world", HelloWorld);
window.customElements.define('header-component', Header);
window.customElements.define('cart-drawer', CartDrawer)
