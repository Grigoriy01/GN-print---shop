const versand = 4.90;
// === Тост для уведомлений
function showToast(message) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = message;
  document.body.appendChild(t);
  t.addEventListener("animationend", () => t.remove());
}

// === Добавление товара в корзину
function addToCartItem(prod, mainImgSrc) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const size = prod.selectedSize || "";
  const qty  = Number(prod.selectedQty) || 1;
  const price = Number(prod.price) || 0;

  const exists = cart.find(item => item.slug === prod.slug && item.size === size);
  if (exists) {
    exists.qty = Number(exists.qty) + qty;
  } else {
    cart.push({
      slug: prod.slug,
      name: prod.name,
      price: price,
      qty: qty,
      image: mainImgSrc,
      size: size
    });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCounter();

  showToast("✅ Artikel zum Warenkorb hinzugefügt");
   
   // Сохраняем срок действия — *** минут (wenn 1 min. -- 1*60*1000; 30sek. -- + 10*1000)
  localStorage.setItem("cartExpireAt", Date.now() + 30 * 60 * 1000); 
  

}

function generateRandomDiscount(min = 0.11, max = 1.11) {
    // Генерирует случайную скидку в нужном диапазоне
    return +(Math.random() * (max - min) + min).toFixed(2);
}



// === Отрисовка корзины и формы
function renderCart() {
  const content = document.getElementById("cartContent");
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  let cartDiscount = localStorage.getItem('cartDiscount');

  if (cartDiscount) cartDiscount = parseFloat(cartDiscount);


  if (!cart.length) {
    content.innerHTML = `<p>Ihr Warenkorb ist leer.</p>`;
    return;
  }

  let subTotal = 0;
  const itemsHtml = cart.map(item => {
    const line = item.price * item.qty;
    subTotal += line;
    return `
      <li class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <strong>${item.name}</strong><br>
          Größe: ${item.size}<br>
          Anzahl: <input type="number" class="cart-qty-input" 
                      data-slug="${item.slug}" data-size="${item.size}" 
                      min="1" value="${item.qty}" style="width:38px"><br>
          Preis: €${item.price.toFixed(2)}<br>
          Gesamt: €${line.toFixed(2)}
        </div>
        <button class="cart-item-remove" data-slug="${item.slug}" data-size="${item.size}">×</button>
      </li>`;
  }).join("");

  
  //const total = subTotal + versand;
  let finalSum = subTotal + versand;
    if (cartDiscount) finalSum -= cartDiscount;

  const discountBtnHtml = `
  <button id="discountBtn" class="btn-discount"${cartDiscount ? ' disabled' : ''}>Rabatt sichern</button>
  `;
  const checkoutBtnHtml = `
    <button id="cartCheckout" class="btn-order"${cartDiscount ? '' : ' style="display:none;"'}>Kaufen</button>
  `;
  content.innerHTML = `
    <ul class="cart-list">${itemsHtml}</ul>
    <div class="cart-totals">
      <p>Zwischensumme: €${subTotal.toFixed(2)}</p>
      <p>Versandkosten: €${versand.toFixed(2)}</p>
      <div class="discount-row">
        <span class="discount-info">${cartDiscount ? `Ihr Rabatt: ${cartDiscount.toFixed(2)} €` : ''}</span>
      </div>
      <p><strong>Gesamt: €${finalSum.toFixed(2)}</strong></p>
      <div class="cart-btn-row">
        ${discountBtnHtml}
        ${checkoutBtnHtml}
      </div>
    </div>
  `;
    // --- JS логика ---
  setTimeout(() => {
    const discountBtn = document.getElementById('discountBtn');
    const checkoutBtn = document.getElementById('cartCheckout');

    // До применения скидки видна только discountBtn, checkoutBtn скрыта
    if (!cartDiscount) {
      checkoutBtn.style.display = "none";
      discountBtn.disabled = false; 
      discountBtn.style.display = "";
    } else {
      discountBtn.disabled = true;
      checkoutBtn.style.display = "";
    }

    // Обработчик на "Получить скидку"
    if (discountBtn && !cartDiscount) {
      discountBtn.addEventListener('click', () => {
        const discount = generateRandomDiscount();
        localStorage.setItem('cartDiscount', discount);
        renderCart(); // всё обновится само
      });
    }
  }, 10);
  // Кнопка удалить
  content.querySelectorAll(".cart-item-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const updated = cart.filter(i => !(i.slug === btn.dataset.slug && i.size === btn.dataset.size));
      localStorage.setItem("cart", JSON.stringify(updated));
      if (updated.length === 0) {
        localStorage.removeItem('cartDiscount');
      }

      renderCart();
      updateCartCounter(); // 👉 обновляем счётчик после удаления
    });
  });
    // === Обработчик изменения количества прямо в корзине ===
    content.querySelectorAll('.cart-qty-input').forEach(input => {
    input.addEventListener('change', function () {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const slug = this.dataset.slug;
      const size = this.dataset.size;
      let qty = parseInt(this.value, 10);
      if (!qty || qty < 1) qty = 1;
      this.value = qty; // если ввели 0 или пусто — автофикс
    
      // Находим нужную позицию и меняем qty
      const item = cart.find(i => i.slug === slug && i.size === size);
      if (item) item.qty = qty;
    
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart(); // перерисовать корзину (и обновить суммы)
      updateCartCounter();
    });
  });


  // Кнопка "Kaufen" — показать форму
  document.getElementById("cartCheckout").addEventListener("click", () => {
    const lastItem = cart[cart.length - 1];
    const wrapper = document.querySelector(".order-form-wrapper");
    if (!wrapper) return;

    wrapper.innerHTML = `
      <button class="form-back" title="Zurück zur Übersicht">↩</button>
      <h2>Bestellformular</h2>
      <form id="checkoutForm">
        <input type="hidden" name="model" value="${lastItem.name}">
        <input type="hidden" name="size" value="${lastItem.size}">
        <input type="hidden" name="qty" value="${lastItem.qty}">

        <label>Ihr Name:</label>
        <input type="text" placeholder="Name / Vorname" name="fullname" required>

        <label>E-Mail:</label>
        <input type="email" placeholder="name@mess.com" name="email" required>

        <label>Telefon (optional):</label>
        <input type="tel" name="phone" placeholder="+49 …">

        <label>Lieferadresse:</label>
        <input type="text" placeholder="Straße 87" name="address" required>

        <label>PLZ:</label>
        <input type="text" placeholder="12345" name="zip" pattern="\\d{5}" required>

        <label>Ort:</label>
        <input type="text" placeholder="Stadt" name="city" required>

        <label>Bemerkung (optional):</label>
        <textarea name="notes" rows="3"></textarea>

        <button type="submit" class="submit-btn">Absenden</button>
      </form>
    `;

    // Показ формы
  wrapper.classList.remove("hidden");
  void wrapper.offsetWidth; // фикс для повторного применения transition
  wrapper.classList.add("visible");

  // Обработчик кнопки ←
  wrapper.querySelector(".form-back").addEventListener("click", () => {
    wrapper.classList.remove("visible");
    setTimeout(() => {
      wrapper.classList.add("hidden");
      wrapper.innerHTML = ""; // очистка для повторного использования
    }, 400); // совпадает с CSS transition
    });
  });

  setTimeout(() => {
  const discountBtn = document.getElementById('discountBtn');
    if (discountBtn && !cartDiscount) {
      discountBtn.addEventListener('click', () => {
        const discount = generateRandomDiscount();
        localStorage.setItem('cartDiscount', discount);
        renderCart(); // перерисовать корзину, чтобы всё обновилось
      });
    }
  }, 10);

}

window.renderCart = renderCart;

// === Защита от возврата назад с PayPal
  if (window.name === "ORDER_SENT") {
  // Очистка и защита при возврате из PayPal
  window.name = ""; // сбрасываем
  localStorage.removeItem("cart");
  localStorage.removeItem('cartDiscount');
  sessionStorage.removeItem("orderSubmitted");
  

  window.location.href = "index.html"; // на главную
  }


// === Отрисовка карточки товара
document.addEventListener("DOMContentLoaded", () => {
  const slug = new URLSearchParams(window.location.search).get("slug");
  // ⏳ Автоочистка корзины через таймер
  const expireKey = "cartExpireAt";
  const now = Date.now();
  const expire = Number(localStorage.getItem(expireKey));

  if (expire && now > expire) {
    localStorage.removeItem("cart");
    localStorage.removeItem('cartDiscount');
    localStorage.removeItem(expireKey);
  }

  fetch("products.json")
    .then(r => r.json())
    .then(data => {
      // 1) определяем, что пришло: чистый массив или объект с { products, lastEdit, comment }
      const products = Array.isArray(data)
        ? data
        : (data.products || []);
      const { lastEdit, comment } = (!Array.isArray(data) ? data : {});

      // (опционально) вывести метаданные куда-нибудь в шапку/футер
      if (lastEdit || comment) {
        const info = document.getElementById("versionInfo");
        if (info) info.textContent = `${comment || ""} (${new Date(lastEdit).toLocaleString()})`;
      }
      const prod = products.find(p => p.slug === slug);
      if (!prod) {
        const container = document.querySelector(".product-detail-container");
          if (container) {
            container.innerHTML = "<p>Produkt nicht gefunden</p>";
          } else {
            console.warn("Контейнер .product-detail-container не найден в DOM");
          }
          return;
      }

      const mainImgSrc = prod.imageLarge || prod.image;
      const thumbs = prod.thumbs?.length ? prod.thumbs : [prod.image];

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
            <div class="product-price mobile-only">€${Number(prod.price).toFixed(2)}</div>

            <p>${prod.description}</p>
          
            <ul class="specs">
              ${prod.specs.map(s => `<li><h4>${s.label}:</h4><p> ${s.value} </p></li>`).join("")}
            </ul>
            <div class="product-price desktop-only">
              €${Number(prod.price).toFixed(2)}
            </div>
              <label>Verfügbarkeit Größe:<br>
                <select id="sizeSelect" name="size" required>
                  <option value="" disabled selected > Größe wählen</option>
                </select>
              </label>
            <div class="product-info_anzahl-label">
              <label>Anzahl<br>
              <input type="number" id="qtyInput" name="quantity" min="1" value="1" required>
              </label>
            </div>
            <div class="product-info_btn-row">
              <button type="button" class="btn-order">Jetzt bestellen</button>
              <button type="button" class="add-cart-btn" title="In den Warenkorb">+🛒</button>
            </div>
          </div>
        </section>
      `;

      document.querySelectorAll(".gallery-thumbs img").forEach(thumb => {
        thumb.addEventListener("click", () => {
          document.querySelector(".gallery-main").src = thumb.src;
        });
        
      });

      const selectEl = document.getElementById("sizeSelect");
      fetch(`https://script.google.com/macros/s/AKfycbzXCPYfYM6ElYClBLPov7avnncE4DVYDj1hQPFenXCkpGQlLOndyjG9aSolqoeQXRkq/exec?slug=${slug}`)
        .then(r => r.json())
        .then(data => {
          selectEl.innerHTML = `<option value="" disabled selected>Größe wählen</option>` +
            data.sizes.map(s => `<option value="${s.name}" ${s.available ? "" : "disabled"}>${s.name}</option>`).join("");
        });

      container.querySelector(".add-cart-btn").addEventListener("click", () => {
        const size = selectEl.value;
        const qty = Number(document.getElementById("qtyInput").value);
        if (!size || qty < 1) return showToast("Größe & Menge wählen");
        prod.selectedSize = size;
        prod.selectedQty = qty;
        addToCartItem(prod, mainImgSrc);
      });

      container.querySelector(".btn-order").addEventListener("click", () => {
        const size = selectEl.value;
        const qty = Number(document.getElementById("qtyInput").value);
        if (!size || qty < 1) return showToast("Größe & Menge wählen");
        prod.selectedSize = size;
        prod.selectedQty = qty;
        addToCartItem(prod, mainImgSrc);
        renderCart();
        document.getElementById("cartPanel").classList.add("visible");
      });
    });
    
});

document.addEventListener("submit", (e) => {
  if (e.target.id === "checkoutForm") {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const panel = document.getElementById("confirmPanel");
    if (!panel || !cart.length) return;

    const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
    const discount = parseFloat(localStorage.getItem('cartDiscount')) || 0;
    let subTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    let finalSum = subTotal + versand - discount;

    const lastItem = cartItems[cartItems.length - 1];
    const qty = Number(lastItem.qty) || 1;
    const unitPrice = qty ? Number(lastItem.price) : 0;

    const itemsHtml = cart.map(item =>
      `${item.name} – Größe: ${item.size}, Anzahl: ${item.qty}`
    ).join("<br>");

    const orderId = "GN-" + Date.now();

    panel.innerHTML = `
      <div class="confirm-header">
        <button class="back-btn" title="Zurück zur Bestellung">↩</button>
        <h2>Bestellübersicht</h2>
      </div>
      <div class="confirm-inner">
        <div class="field-group"><label>Bestellnummer:</label><div class="value">${orderId}</div></div>
        <div class="field-group"><label>Produkte:</label><div class="value">${itemsHtml}</div></div>
        <div class="field-group"><label>Gesamtbetrag:<p style="font-size:0.6rem;" >inkl.Versandkosten</p></label><div class="value">€${finalSum.toFixed(2)}</div></div>
        <div class="field-group"><label>Name:</label><div class="value">${data.fullname}</div></div>
        <div class="field-group"><label>E-Mail:</label><div class="value">${data.email}</div></div>
        <div class="field-group"><label>Telefon:</label><div class="value">${data.phone || "-"}</div></div>
        <div class="field-group"><label>Lieferadresse:</label><div class="value">${data.address}, ${data.zip} ${data.city}</div></div>
        <div class="field-group"><label>Bemerkung:</label><div class="value">${data.notes || "-"}</div></div>
        <div class="button-row">
          <button class="back-btn">Zurück</button>
          <button class="pay-btn">Bezahlen</button>
        </div>
      </div>
    `;

    panel.classList.remove("hidden");
    panel.classList.add("visible");
    panel.scrollTo({ top: 0, behavior: "instant" });

    // Обе кнопки "←"
    panel.querySelectorAll(".back-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        panel.classList.remove("visible");
        setTimeout(() => panel.classList.add("hidden"), 400);
      });
    });

    // Кнопка "Bezahlen"
    panel.querySelector(".pay-btn").addEventListener("click", () => {
      const payload = {
        orderId: orderId,
        products: itemsHtml.replace(/<br>/g, "; "),
        unitPrice: unitPrice.toFixed(2),
        total: finalSum.toFixed(2),
        fullname: data.fullname,
        email: data.email,
        phone: data.phone,
        address: data.address,
        zip: data.zip,
        city: data.city,
        notes: data.notes
      };

      fetch("https://proxy-printshop.m9258923028.workers.dev/?url=https://script.google.com/macros/s/AKfycbyPsWIINa4FdIy62ULSl9Y3Adr9Byo53SxpXFbdvoNiGbHB-k_GRHYubJ0QBbQEXEvxfA/exec", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          // Устанавливаем защитные флаги
          localStorage.removeItem("cart");
          localStorage.removeItem('cartDiscount');
          sessionStorage.setItem("orderSubmitted", "1");
          window.name = "ORDER_SENT";
        
          // Перенаправляем без возможности возврата назад
          const paypalURL = `https://paypal.me/GrigoriyNikitenko/${finalSum.toFixed(2)}`;
          window.location.replace(paypalURL);
        } else {
          showToast("❌ Fehler beim Speichern. Bitte später versuchen.");
        }
      })
      .catch(err => {
        showToast("❌ Verbindung fehlgeschlagen (Proxy).");
        console.error("Proxy-Fehler:", err);
      });
    });
  }
});

function updateCartCounter() {
  const countEl = document.getElementById("cartCount");
  if (!countEl) return;

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const count = cart.length;

  if (count > 0) {
    countEl.textContent = count;
    countEl.classList.remove("hidden");
  } else {
    countEl.classList.add("hidden");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  updateCartCounter();
});


