// js/app.js
document.addEventListener("DOMContentLoaded", () => {
  // 1) Навигация (гамбургер)
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav   = document.querySelector(".site-nav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      siteNav.classList.toggle("open");
    });
  }

  // 2) Галерея на product.html
  const mainImg = document.querySelector(".gallery-main");
  document.querySelectorAll(".gallery-thumbs img").forEach(thumb => {
    thumb.style.cursor = "pointer";
    thumb.addEventListener("click", () => {
      mainImg.src = thumb.src;
      mainImg.alt = thumb.alt;
    });
  });

  // 3) Кнопка «Наверх»
  const backToTopBtn = document.querySelector(".back-to-top");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) backToTopBtn.classList.add("show");
      else backToTopBtn.classList.remove("show");
    });
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 4) Корзина: открыть/закрыть
  const cartToggle = document.getElementById("cartToggle");
  const cartPanel  = document.getElementById("cartPanel");
  const cartClose  = document.getElementById("cartClose");
  console.log("app.js loaded:", { cartToggle, cartPanel, cartClose });

  if (cartToggle && cartPanel && cartClose) {
    cartToggle.addEventListener("click", () => {
      console.log("🛒 Открываем корзину");
      cartPanel.classList.add("visible");
    });
    cartClose.addEventListener("click", () => {
      console.log("✖ Закрываем корзину");
      cartPanel.classList.remove("visible");
    });
  }
});
