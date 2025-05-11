// js/app.js

// По загрузке DOM
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav    = document.querySelector(".site-nav");
  // Переключение main-картинки по клику на миниатюру
  const mainImg = document.querySelector(".gallery-main");
  document.querySelectorAll(".gallery-thumbs img").forEach(thumb => {
    thumb.style.cursor = "pointer";               // курсор «рука»
    thumb.addEventListener("click", () => {
      mainImg.src = thumb.src;                    // заменяем src
      mainImg.alt = thumb.alt;                    // обновляем alt
    });
});


  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
});
// Кнопка «Наверх»
const backToTopBtn = document.querySelector(".back-to-top");

window.addEventListener("scroll", () => {
  if (window.pageYOffset > 300) {
    backToTopBtn.classList.add("show");
  } else {
    backToTopBtn.classList.remove("show");
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
