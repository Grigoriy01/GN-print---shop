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
              <!-- ОБЁРТКА для фиксированного контейнера -->
              <div class="gallery-main-container">
                <img src="${mainImg}" alt="${prod.name}" class="gallery-main">
              </div>
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

  const orderBtn   = document.querySelector(".btn-order");
  const orderSec   = document.getElementById("orderSection");
  const currentSlug= new URLSearchParams(location.search).get("slug");
  const prodImg    = document.querySelector(".gallery-main");
  const prodName   = document.querySelector(".product-info h1");

  orderBtn.addEventListener("click", e => {
    e.preventDefault();

    // Собираем HTML формы
    orderSec.innerHTML = `
      <h2>Bestellung für ${prodName.textContent}</h2>
      <div class="order-content">
        <div class="order-image">
          <img src="${prodImg.src}" alt="${prodImg.alt}">
        </div>
        <div class="order-form">
          <form name="order" method="POST" data-netlify="true" netlify-honeypot="bot-field">
            <input type="hidden" name="form-name" value="order">
            <p class="hidden"><label>Don’t fill: <input name="bot-field"></label></p>
            <input type="hidden" name="productSlug" value="${currentSlug}">
            <label>Ihr Name<br><input type="text" name="customerName" required></label>
            <label>E-Mail<br><input type="email" name="customerEmail" required></label>
            <label>Telefon<br><input type="tel" name="customerPhone" required></label>
            <label>Größe<br><select name="size" id="sizeSelect" required>
              <option>…lädt Größen…</option>
            </select></label>
            <label>Anzahl<br><input type="number" name="quantity" min="1" value="1" required></label>
            <label>Kommentar<br><textarea name="comments" rows="3"></textarea></label>
            <button type="submit">Absenden</button>
          </form>
        </div>
      </div>
    `;

    // Показываем и скроллим
    orderSec.classList.remove("hidden");
    orderSec.scrollIntoView({ behavior: "smooth" });

    // DL размеров (Apps Script) — опционально, пока просто заглушка
    fetch(`https://script.google.com/macros/s/AKfycbzXCPYfYM6ElYClBLPov7avnncE4DVYDj1hQPFenXCkpGQlLOndyjG9aSolqoeQXRkq/exec`)
      .then(r => r.json())
      .then(data => {
        const sel = document.getElementById("sizeSelect");
        sel.innerHTML = data.sizes.map(s =>
          `<option value="${s.name}" ${s.available ? "" : "disabled"}>${s.name}</option>`
        ).join("");
      })
      .catch(() => {
        document.getElementById("sizeSelect").innerHTML = `<option>Fehler beim Laden</option>`;
      });
  });
  
});
