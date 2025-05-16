// js/product.js

// — Тост для уведомлений
function showToast(message) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = message;
  document.body.appendChild(t);
  t.addEventListener("animationend", () => t.remove());
}

// — Добавление товара в корзину
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
  console.log("Cart now:", cart);
  showToast("✅ Artikel zum Warenkorb hinzugefügt");
}

// — Отрисовка панели корзины
function renderCart() {
  const content = document.getElementById("cartContent");
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  console.log("Rendering cart:", cart);

  if (!cart.length) {
    content.innerHTML = `<p>Ihr Warenkorb ist leer.</p>`;
    return;
  }

  let subTotal = 0;
  const itemsHtml = cart.map(item => {
    const price = Number(item.price) || 0;
    const qty   = Number(item.qty)   || 1;
    const line  = price * qty;
    subTotal   += line;
    return `
      <li class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <strong>${item.name}</strong><br>
          Größe: ${item.size}<br>
          Anzahl: ${qty}<br>
          Preis: €${price.toFixed(2)}<br>
          Gesamt: €${line.toFixed(2)}
        </div>
        <button class="cart-item-remove" data-slug="${item.slug}" data-size="${item.size}">×</button>
      </li>`;
  }).join("");

  const versand = 4.90;
  const total = subTotal + versand;

  content.innerHTML = `
    <ul class="cart-list">${itemsHtml}</ul>
    <div class="cart-totals">
      <p>Zwischensumme: €${subTotal.toFixed(2)}</p>
      <p>Versandkosten: €${versand.toFixed(2)}</p>
      <p><strong>Gesamt: €${total.toFixed(2)}</strong></p>
      <button id="cartCheckout" class="btn-order">Kaufen</button>
    </div>
  `;

  // Удаление товара
  content.querySelectorAll(".cart-item-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const slug = btn.dataset.slug;
      const size = btn.dataset.size;
      const updated = cart.filter(i => !(i.slug === slug && i.size === size));
      localStorage.setItem("cart", JSON.stringify(updated));
      renderCart();
    });
  });

  // Checkout (пока только скролл к форме)
  document.getElementById("cartCheckout").addEventListener("click", () => {
    document.getElementById("cartPanel").scrollIntoView({ behavior: "smooth" });
  });
}

// Делаем renderCart глобально доступным
window.renderCart = renderCart;

document.addEventListener("DOMContentLoaded", () => {
  console.log("🛠 product.js запущен");
  const slug = new URLSearchParams(window.location.search).get("slug");

  fetch("products.json")
    .then(r => r.json())
    .then(products => {
      const prod = products.find(p => p.slug === slug);
      if (!prod) {
        document.querySelector(".product-detail-container")
          .innerHTML = "<p>Produkt nicht gefunden</p>";
        return;
      }

      const mainImgSrc = prod.imageLarge || prod.image;
      const thumbs     = prod.thumbs?.length ? prod.thumbs : [prod.image];
      const container  = document.querySelector(".product-detail-container");

      // 1) Рендер товара
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
            <label class="required">Größe wählen<br>
              <select id="sizeSelect" name="size">
                <option value="" disabled selected>Größe wählen</option>
              </select>
            </label>
            <label class="required">Anzahl<br>
              <input type="number" id="qtyInput" name="quantity" min="1" value="1" required>
            </label>
            <button type="button" class="btn-order">Jetzt bestellen</button>
            <button type="button" class="add-cart-btn" title="In den Warenkorb">➕🛒</button>
          </div>
        </section>
      `;

      // 2) Галерея миниатюр
      const mainEl = document.querySelector(".gallery-main");
      document.querySelectorAll(".gallery-thumbs img").forEach(thumb => {
        thumb.style.cursor = "pointer";
        thumb.addEventListener("click", () => {
          mainEl.src = thumb.src;
          mainEl.alt = thumb.alt;
        });
      });

      // 3) Загрузка размеров
      const selectEl = document.getElementById("sizeSelect");
      if (selectEl) {
        fetch(`https://script.google.com/macros/s/AKfycbzXCPYfYM6ElYClBLPov7avnncE4DVYDj1hQPFenXCkpGQlLOndyjG9aSolqoeQXRkq/exec?slug=${slug}`)
          .then(r => r.json())
          .then(data => {
            selectEl.innerHTML =
              `<option value="" disabled selected>Größe wählen</option>` +
              data.sizes.map(s =>
                `<option value="${s.name}" ${s.available ? "" : "disabled"}>${s.name}</option>`
              ).join("");
          })
          .catch(() => {
            selectEl.innerHTML = `<option value="" disabled>Fehler beim Laden</option>`;
          });
      }

      // 4) Обработчики кнопок
      const orderBtn   = container.querySelector(".btn-order");
      const addCartBtn = container.querySelector(".add-cart-btn");

      addCartBtn.addEventListener("click", () => {
        const size = selectEl.value;
        const qty  = Number(document.getElementById("qtyInput").value);
        if (!size) {
          showToast("Bitte wählen Sie eine Größe.");
          return;
        }
        if (!qty || qty < 1) {
          showToast("Bitte geben Sie eine gültige Anzahl ein.");
          document.getElementById("qtyInput").classList.add("invalid");
          return;
        }
        prod.selectedSize = size;
        prod.selectedQty  = qty;
        addToCartItem(prod, mainImgSrc);
      });

      orderBtn.addEventListener("click", () => {
        const size = selectEl.value;
        const qty  = Number(document.getElementById("qtyInput").value);
        if (!size) {
          showToast("Bitte wählen Sie eine Größe.");
          return;
        }
        if (!qty || qty < 1) {
          showToast("Bitte geben Sie eine gültige Anzahl ein.");
          document.getElementById("qtyInput").classList.add("invalid");
          return;
        }
        prod.selectedSize = size;
        prod.selectedQty  = qty;
        addToCartItem(prod, mainImgSrc);
        renderCart();
        document.getElementById("cartPanel").classList.add("visible");
      });
    })
    .catch(err => console.error("Ошибка в product.js:", err));
});
