// js/app.js

// === Защита от возврата назад с PayPal на стартовой странице
  if (window.name === "ORDER_SENT") {
  window.name = "";
  localStorage.removeItem("cart");
  sessionStorage.removeItem("orderSubmitted");
  window.location.href = "index.html";
  }


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

  // 4) Корзина: открыть/закрыть + отрисовать

  const cartToggle = document.getElementById("cartToggle");
  const cartPanel  = document.getElementById("cartPanel");
  const cartClose  = document.getElementById("cartClose");
  console.log("app.js loaded:", { cartToggle, cartPanel, cartClose });

  if (cartToggle && cartPanel && cartClose) {
    // Открытие: сначала рендерим содержимое, затем показываем панель
    cartToggle.addEventListener("click", () => {
      console.log("🛒 Открываем корзину");
      renderCart();               // убедиться, что эта функция глобально доступна
      cartPanel.classList.add("visible");
    });
    const toggle = document.getElementById("cartToggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        document.getElementById("cartPanel").classList.add("visible");
        renderCart(); // отрисовка корзины
      });
    }

    // Закрытие
    cartClose.addEventListener("click", () => {
      console.log("✖ Закрываем корзину");
      cartPanel.classList.remove("visible");
    });
  }
});
