import AboutProduct from "@/components/AboutProduct/AboutProduct";
import Account from "@/components/Account/Account";
import AccountAccess from "@/components/AccountAccess/AccountAccess";
import Alert from "@/components/Alert/Alert";
import ArticleComponent from "@/components/ArticleComponent/ArticleComponent";
import BannerCarouselProducts from "@/components/BannerCarouselProducts/BannerCarouselProducts";
import BannerCarrousel from "@/components/BannerCarrousel/BannerCarrousel";
import CarouselProduct from "@/components/CarouselProducts/CarouselProducts";
import CartDrawer from "@/components/CartDrawer/CartDrawer";
import CartSection from "@/components/CartSection/CartSection";
import CollectionFilter from "@/components/CollectionFilter/CollectionFilter";
import CollectionGrid from "@/components/CollectionGrid/CollectionGrid";
import DescriptionSEO from "@/components/DescriptionSEO/DescriptionSEO";
import DiscountCoupon from "@/components/DiscountCoupon/DiscountCoupon";
import Footer from "@/components/Footer/Footer";
import GridArticles from "@/components/GridArticles/GridArticles";
import Header from "@/components/Header/Header";
import HelloWorld from "@/components/HelloWorld/HelloWorld";
import ImageGridCarousel from "@/components/ImageGridCarousel/ImageGridCarousel";
import Influencers from "@/components/Influencers/Influencers";
import LookBook from "@/components/LookBook/LookBook";
import MainOrder from "@/components/MainOrder/MainOrder";
import MainProduct from "@/components/MainProduct/MainProduct";
import Popup from "@/components/Popup/Popup";
import ProductCard from "@/components/ProductCard/ProductCard";
import ProductReviews from "@/components/ProductReviews/ProductReviews";
import ShippingCalculator from "@/components/ShippingCalculator/ShippingCalculator";
import ShippingCalculatorCartDrawer from "@/components/ShippingCalculatorCartDrawer/ShippingCalculatorCartDrawer";
import Shopbar from "@/components/Shopbar/Shopbar";
import TextSection from "@/components/TextSection/TextSection";
import WishlistGrid from "@/components/WishlistGrid/WishlistGrid";
import "../components/PageTransition/PageTransition";
import "../components/PageTransition/PageTransition.css";
import TestimonialSlider from '../components/TestimonialSlider/TestimonalSlider';

window.customElements.define("hello-world", HelloWorld);
window.customElements.define("footer-component", Footer);
window.customElements.define("product-card", ProductCard);
window.customElements.define("carousel-products", CarouselProduct);
window.customElements.define("main-product", MainProduct);
window.customElements.define("shipping-calculator", ShippingCalculator);
window.customElements.define(
  "banner-carousel-products",
  BannerCarouselProducts
);
window.customElements.define("header-component", Header);
window.customElements.define("influencers-component", Influencers);
window.customElements.define("product-reviews", ProductReviews);
window.customElements.define("banner-carrousel", BannerCarrousel);
window.customElements.define("about-product", AboutProduct);
window.customElements.define("wishlist-grid", WishlistGrid);
window.customElements.define("text-section", TextSection);
window.customElements.define("image-grid-carousel", ImageGridCarousel);
window.customElements.define("popup-component", Popup);
window.customElements.define("look-book", LookBook);
window.customElements.define("cart-drawer", CartDrawer);
window.customElements.define("discount-coupon", DiscountCoupon);
window.customElements.define("cart-section", CartSection);
window.customElements.define(
  "shipping-calculator-cart-drawer",
  ShippingCalculatorCartDrawer
);
window.customElements.define("collection-grid", CollectionGrid);
window.customElements.define("collection-filter", CollectionFilter);
window.customElements.define("description-seo", DescriptionSEO);
window.customElements.define("alert-component", Alert);
window.customElements.define("shopbar-component", Shopbar);
window.customElements.define("account-component", Account);
window.customElements.define("account-access", AccountAccess);
window.customElements.define("grid-articles", GridArticles);
window.customElements.define("article-component", ArticleComponent);
window.customElements.define("main-order", MainOrder);
window.customElements.define("testimonial-slider", TestimonialSlider as unknown as CustomElementConstructor);
