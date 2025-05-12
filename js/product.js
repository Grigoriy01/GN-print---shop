// js/product.js
document.addEventListener("DOMContentLoaded", () => {
  const slug = new URLSearchParams(location.search).get("slug");
  console.log("Slug:", slug);

  fetch("products.json")
    .then(res => res.json())
    .then(products => {
      const prod = products.find(p => p.slug === slug);
      if (!prod) {
        document.querySelector(".product-detail-container")
                .innerHTML = "<p>Produkt nicht gefunden</p>";
        return;
      }

      // если нет больших картинок/миниатюр, используем prod.image
      const mainImg = prod.imageLarge || prod.image;
      const thumbs  = prod.thumbs && prod.thumbs.length
                      ? prod.thumbs
                      : [prod.image];

      document.querySelector(".product-detail-container").innerHTML = `
        <section class="product-detail">
          <div class="product-gallery">
            <img src="${mainImg}" alt="${prod.name}" class="gallery-main">
            <div class="gallery-thumbs">
              ${thumbs.map(src =>
                `<img src="${src}" alt="${prod.name}">`
              ).join("")}
            </div>
          </div>
          <div class="product-info">
            <h1>${prod.name}</h1>
            <p>${prod.description}</p>
            <ul class="specs">
              ${prod.specs.map(s =>
                `<li><strong>${s.label}:</strong> ${s.value}</li>`
              ).join("")}
            </ul>
            <a href="#bestellen" class="btn-order">Jetzt bestellen</a>
          </div>
        </section>
      `;

      // переключение миниатюр
      const mainEl = document.querySelector(".gallery-main");
      document.querySelectorAll(".gallery-thumbs img")
        .forEach(img => {
          img.style.cursor = "pointer";
          img.addEventListener("click", () => mainEl.src = img.src);
        });
    })
    .catch(console.error);
});
