// js/product.js
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
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

      const mainImgSrc = prod.imageLarge || prod.image;
      const thumbs = (prod.thumbs && prod.thumbs.length) ? prod.thumbs : [prod.image];

      const container = document.querySelector(".product-detail-container");
      container.innerHTML = `
        <section class="product-detail">
          <div class="product-gallery">
            <div class="gallery-main-container">
              <img src="${mainImgSrc}" alt="${prod.name}" class="gallery-main">
            </div>
            <div class="gallery-thumbs">
              ${thumbs.map(src => `<img src="${src}" alt="${prod.name}">`).join("")}
            </div>
          </div>
          <div class="product-info">
            <h1>${prod.name}</h1>
            <p>${prod.description}</p>
            <ul class="specs">
              ${prod.specs.map(s => `<li><strong>${s.label}:</strong> ${s.value}</li>`).join("")}
            </ul>
            <button type="button" class="btn-order">Jetzt bestellen</button>
          </div>
        </section>
      `;

      // Переключение миниатюр
      const mainEl = document.querySelector(".gallery-main");
      document.querySelectorAll(".gallery-thumbs img").forEach(img => {
        img.style.cursor = "pointer";
        img.addEventListener("click", () => {
          mainEl.src = img.src;
        });
      });

      // Вставляем секцию заказа, если её ещё нет
      let orderSec = document.getElementById("orderSection");
      if (!orderSec) {
        container.insertAdjacentHTML("beforeend",
          '<section id="orderSection" class="order-section hidden"></section>'
        );
        orderSec = document.getElementById("orderSection");
      }

      // Логика клика по кнопке «Jetzt bestellen»
      const orderBtn = container.querySelector(".btn-order");
      orderBtn.addEventListener("click", e => {
        e.preventDefault();
        orderSec.innerHTML = `
          <h2>Bestellung für ${prod.name}</h2>
          <div class="order-content">
            <div class="order-image">
              <img src="${mainEl.src}" alt="${mainEl.alt}">
            </div>
            <div class="order-form">
              <form name="order" method="POST" data-netlify="true" netlify-honeypot="bot-field">
                <input type="hidden" name="form-name" value="order">
                <p class="hidden"><label>Don’t fill:<input name="bot-field"></label></p>
                <input type="hidden" name="productSlug" value="${slug}">
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
        orderSec.classList.remove("hidden");
        orderSec.scrollIntoView({ behavior: "smooth" });

        // Загрузка размеров (замените YOUR_SCRIPT_ID на ваш Web App URL)
        fetch(`https://script.google.com/macros/s/AKfycbzXCPYfYM6ElYClBLPov7avnncE4DVYDj1hQPFenXCkpGQlLOndyjG9aSolqoeQXRkq/exec`)
          .then(r => r.json())
          .then(data => {
            const sel = document.getElementById("sizeSelect");
            sel.innerHTML = data.sizes.map(s =>
              `<option value="${s.name}" ${s.available ? "" : "disabled"}>${s.name}</option>`
            ).join("");
          })
          .catch(() => {
            document.getElementById("sizeSelect")
                    .innerHTML = `<option>Fehler beim Laden</option>`;
          });
      });
    })
    .catch(err => console.error("Ошибка в product.js:", err));
});
