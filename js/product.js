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
                <label class="required">Ihr Name<br><input type="text" name="customerName" required><br></label>
                <label class="required">E-Mail<br><input type="email" name="customerEmail" required><br></label>
                <label class="required">Telefon<br><input type="tel" name="customerPhone" required><br></label>
                <label class="required">Größe<br>
                  <select name="size" id="sizeSelect" required>
                    <option value="" disabled selected>Größe wählen</option>
                  </select>  <br>
                </label>
                <label>Kommentar<br><textarea name="comments" rows="3"></textarea><br></label>
                <button type="button" id="nextBtn">Weiter</button>
              </form>
            </div>
            <div class="order-summary" id="orderSummary" style="display: none;"></div>
          </div>
        `;

        orderSec.classList.remove("hidden");
        orderSec.scrollIntoView({ behavior: "smooth" });

        // Загрузка размеров
        fetch(`https://script.google.com/macros/s/AKfycbzXCPYfYM6ElYClBLPov7avnncE4DVYDj1hQPFenXCkpGQlLOndyjG9aSolqoeQXRkq/exec?slug=${slug}`)
          .then(r => {
            console.log("Sizes-fetch status:", r.status);
            return r.json();
          })
          .then(data => {
            console.log("Sizes data:", data);
            const sel = document.getElementById("sizeSelect");
            sel.innerHTML = `<option value="" disabled selected>Größe wählen</option>`
              + data.sizes.map(s =>
                  `<option value="${s.name}" ${s.available ? "" : "disabled"}>${s.name}</option>`
                ).join("");
          })
          .catch(err => {
            console.error("Ошибка загрузки размеров:", err);
            document.getElementById("sizeSelect")
                    .innerHTML = `<option value="" disabled>Fehler beim Laden</option>`;
        });


        // Шаг “Weiter” → показать summary
        const orderForm = document.getElementById("orderForm");
        const nextBtn = document.getElementById("nextBtn");
        const orderSummary = document.getElementById("orderSummary");

        nextBtn.addEventListener("click", () => {
            let valid = true;
            // Сброс старых ошибок
            orderForm.querySelectorAll(".invalid, .validation-message").forEach(el => {
              el.classList.remove("invalid");
              if (el.classList.contains("validation-message")) el.remove();
            });
          
            orderForm.querySelectorAll("[required]").forEach(inp => {
              const val = inp.value.trim();
              let msgText = "";
            
              // Сперва проверяем select
              if (inp.tagName.toLowerCase() === "select" && val === "") {
                msgText = "Bitte wählen Sie eine Größe.";
              }
              // Затем остальные поля
              else if (!val) {
                msgText = "Dieses Feld ist erforderlich.";
              } else if (inp.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                msgText = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
              } else if (inp.name === "customerPhone" && !/^\d+$/.test(val)) {
                msgText = "Bitte geben Sie nur Ziffern ein.";
              }
            
              if (msgText) {
                valid = false;
                inp.classList.add("invalid");
                const lbl = inp.closest("label");
                const msg = document.createElement("div");
                msg.className = "validation-message";
                msg.textContent = msgText;
                lbl.appendChild(msg);
              }
            });
          
            if (!valid) return;

          // Сбор данных
          const formData = new FormData(orderForm);
          let summaryHtml = `<h3>Bitte überprüfen Sie Ihre Angaben</h3><ul>`;
          formData.forEach((val, key) => {
            if (["bot-field","form-name","createdAt"].includes(key)) return;
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
