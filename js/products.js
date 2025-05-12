// js/products.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("products.js загружен");
  fetch("products.json")
    .then(res => {
      console.log("Fetch products.json, status:", res.status);
      return res.json();
    })
    .then(products => {
      console.log("Загружено товаров:", products.length);
      products.forEach(prod => {
        console.log("Добавляем карточку:", prod.slug, prod.category);
        const container = document.querySelector(
          `.gallery__grid[data-category="${prod.category}"]`
        );
        if (!container) return console.warn("Нет контейнера для", prod.category);

        // создаём карточку
        const card = document.createElement("article");
        card.className = "product-card";
        card.innerHTML = `
          <a href="product.html?slug=${prod.slug}">
            <img src="${prod.image}" alt="${prod.name}">
          </a>
          <h2>${prod.name}</h2>
          <p>${prod.description}</p>
          <a href="product.html?slug=${prod.slug}">
            <button>Details</button>
          </a>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => console.error("Ошибка загрузки products.json:", err));
});
