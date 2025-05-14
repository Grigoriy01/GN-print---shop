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
        <section id="orderSection" class="order-section hidden"></section>
      `;

      // Переключение миниатюр
      const mainEl = document.querySelector(".gallery-main");
      document.querySelectorAll(".gallery-thumbs img").forEach(img => {
        img.style.cursor = "pointer";
        img.addEventListener("click", () => {
          mainEl.src = img.src;
        });
      });

      // Логика клика по кнопке «Jetzt bestellen»
      const orderBtn = container.querySelector(".btn-order");
      const orderSec = document.getElementById("orderSection");

      orderBtn.addEventListener("click", e => {
        e.preventDefault();

        const orderID = 'ORD' + Date.now();
        const createdAt = Date.now();

        orderSec.innerHTML = `
          <h2>Bestellung für ${prod.name}</h2>
          <p>Ihre Bestellnummer: ${orderID}</p>
          <div class="order-content">
            <div class="order-image">
              <img src="${mainEl.src}" alt="${mainEl.alt}">
            </div>
            <div class="order-form-container">
              <form id="orderForm" name="order" method="POST" data-netlify="true" netlify-honeypot="bot-field">
                <input type="hidden" name="form-name" value="order">
                <input type="hidden" name="orderID" value="${orderID}">
                <input type="hidden" name="createdAt" value="${createdAt}">
                <input type="hidden" name="productSlug" value="${slug}">
                <label class="required">Ihr Name<br><input type="text" name="customerName" required></label>
                <label class="required">E-Mail<br><input type="email" name="customerEmail" required></label>
                <label class="required">Telefon<br><input type="tel" name="customerPhone" required></label>
                <label class="required">Größe<br>
                  <select name="size" id="sizeSelect" required>
                    <option>…lädt Größen…</option>
                  </select>
                </label>
                <label>Kommentar<br><textarea name="comments" rows="3"></textarea></label>
                <button type="button" id="nextBtn">Weiter</button>
              </form>
            </div>
            <div class="order-summary" id="orderSummary" style="display: none;"></div>
          </div>
        `;

        orderSec.classList.remove("hidden");
        orderSec.scrollIntoView({ behavior: "smooth" });

        // Загрузка размеров
        fetch(`https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?slug=${slug}`)
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

        // Шаг “Weiter” → показать summary
        const orderForm = document.getElementById("orderForm");
        const nextBtn = document.getElementById("nextBtn");
        const orderSummary = document.getElementById("orderSummary");

        nextBtn.addEventListener("click", () => {
          let valid = true;
          orderForm.querySelectorAll("[required]").forEach(inp => {
            const lbl = inp.closest("label");
            let msg = lbl.querySelector(".validation-message");
            if (!inp.value.trim()) {
              if (!msg) {
                msg = document.createElement("div");
                msg.className = "validation-message";
                msg.textContent = "Dieses Feld ist erforderlich.";
                lbl.appendChild(msg);
              }
              msg.style.display = "block";
              valid = false;
            } else if (msg) {
              msg.style.display = "none";
            }
          });
          if (!valid) return;

          // Сбор данных
          const formData = new FormData(orderForm);
          let summaryHtml = `<h3>Bitte überprüfen Sie Ihre Angaben</h3><ul>`;
          formData.forEach((val, key) => {
            if (key === 'bot-field' || key === 'form-name') return;
            summaryHtml += `<li><strong>${key}:</strong> ${val}</li>`;
          });
          summaryHtml += `</ul>
            <button id="backBtn">Zurück</button>
            <button id="buyBtn">Kaufen</button>`;

          orderSummary.innerHTML = summaryHtml;
          orderForm.style.display = "none";
          orderSummary.style.display = "block";

          // “Zurück”
          document.getElementById("backBtn").addEventListener("click", () => {
            orderSummary.style.display = "none";
            orderForm.style.display = "block";
          });

          // “Kaufen” → PayPal.me
          document.getElementById("buyBtn").addEventListener("click", () => {
            const age = Date.now() - createdAt;
            if (age > 24 * 60 * 60 * 1000) {
              alert("Die Zahlungsfrist ist abgelaufen. Bitte erstellen Sie eine neue Bestellung.");
            } else {
              const price = prod.price || prod.defaultPrice || 0;
              const payLink = `https://paypal.me/ВашПрофиль/${price}?note=${orderID}`;
              window.open(payLink, "_blank");
            }
          });
        });
      });
    })
    .catch(err => console.error("Ошибка в product.js:", err));
});
