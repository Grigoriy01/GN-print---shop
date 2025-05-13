// js/products.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("🛠 products.js запущен");
  fetch("products.json")
    .then(res => res.json())
    .then(products => {
      products.forEach(prod => {
        const container = document.querySelector(
          `.gallery__grid[data-category="${prod.category}"]`
        );
        if (!container) return;

        // создаём карточку
        const card = document.createElement("article");
        card.className = "product-card";

        // вот здесь — новый шаблон разметки
        card.innerHTML = `
          <div class="card-image">
            <a href="product.html?slug=${prod.slug}">
              <img src="${prod.image}" alt="${prod.name}">
            </a>
          </div>
          <div class="card-content">
            <h2>${prod.name}</h2>
            <p class="card-subtitle">${prod.subtitle || ""}</p>
            <a href="product.html?slug=${prod.slug}">
              <button>Details</button>
            </a>
          </div>
        `;

        container.appendChild(card);
      });
    })
    .catch(console.error);
});
