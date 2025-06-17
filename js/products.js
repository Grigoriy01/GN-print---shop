// js/products.js

function restoreScroll() {
  const y = sessionStorage.getItem('lastScroll');
  if (y !== null) {
    window.scrollTo(0, +y);
    sessionStorage.removeItem('lastScroll');
  }
}
// Вызови restoreScroll() в самом конце после рендера галереи.

document.addEventListener("DOMContentLoaded", () => {
  console.log("🛠 products.js запущен");


   fetch("products.json")
    .then(res => res.json())
    .then(data => {
      const products = Array.isArray(data)
         ? data
         : (data.products || []);
      // Лог всех контейнеров
      const allContainers = document.querySelectorAll(".gallery__grid");
      console.log("Найдено секций .gallery__grid:", allContainers.length);
      allContainers.forEach(sec => console.log("  секция:", sec.id));

      products.forEach(prod => {
        const container = document.querySelector(
          `.gallery__grid[data-category="${prod.category}"]`
        );
        console.log(`Поиск контейнера для категории "${prod.category}":`, container);

        if (!container) return;

        const card = document.createElement("article");
        card.className = "product-card";
        card.innerHTML = `
          <div class="card-image">
            <a href="product.html?slug=${prod.slug}">
              <img src="${prod.image}" alt="${prod.name}">
            </a>
          </div>
          <div class="card-content">
            <h2>${prod.name}</h2>
            <p>${prod.subtitle}</p>
            <p>€ ${prod.price}</p>
            <a href="product.html?slug=${prod.slug}">
              <button>Details</button>
            </a>
          </div>
        `;
        const cardLink = card.querySelector("a[href^='product.html']");
        if (cardLink) {
          cardLink.addEventListener("click", () => {
            sessionStorage.setItem('lastScroll', window.scrollY);
          });
        }

        container.appendChild(card);
      });
      
      setTimeout(restoreScroll, 0);

      console.log("Всего карточек .product-card:", document.querySelectorAll(".product-card").length);
    })
    .catch(err => console.error("Ошибка загрузки products.json:", err));
});
