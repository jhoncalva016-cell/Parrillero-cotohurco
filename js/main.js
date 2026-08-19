/* ============================================================
   PARRILLERO EL COTHOURCO — Lógica del sitio público
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  Store.init();
  const data = Store.getAll();

  setupNav();
  renderRestaurantInfo(data);
  renderFooterInfo(data);

  const page = document.body.dataset.page;

  if (page === "home") {
    renderServices(data, "#home-services");
    renderFeaturedDishes(data, "#home-featured");
    renderPromotions(data, "#home-promos", true);
    renderDailySpecialsPreview(data, "#home-daily-preview");
  }

  if (page === "carta") {
    renderCartaPage(data);
  }

  if (page === "desayunos") {
    renderDailySpecialsFull(data, "#daily-grid");
  }

  if (page === "promociones") {
    renderPromotions(data, "#promo-grid", false);
  }

  if (page === "servicios") {
    renderServices(data, "#services-grid-full");
  }

  if (page === "domicilios") {
    renderDeliveryInfo(data);
    setupDeliveryCalculator(data);
  }
});

/* ---------------- utilidades ---------------- */
function money(n) {
  const num = Number(n) || 0;
  return "$" + num.toFixed(2);
}

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function setupNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
  }
}

function renderRestaurantInfo(data) {
  document.querySelectorAll("[data-restaurant-name]").forEach(n => n.textContent = data.restaurant.name);
  document.querySelectorAll("[data-restaurant-tagline]").forEach(n => n.textContent = data.restaurant.tagline);
}

function renderFooterInfo(data) {
  const r = data.restaurant;
  const map = {
    "[data-footer-address]": r.address,
    "[data-footer-phone]": r.phone,
    "[data-footer-hours]": r.hoursWeekday,
    "[data-footer-hours-note]": r.hoursNote
  };
  Object.keys(map).forEach(sel => {
    const node = document.querySelector(sel);
    if (node) node.textContent = map[sel];
  });
  document.querySelectorAll(".addr-row").forEach(row => {
    row.style.display = r.address ? "" : "none";
  });
  document.querySelectorAll("[data-map-link]").forEach(a => {
    a.href = r.address
      ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(r.address)
      : "#";
  });
}

/* ---------------- SERVICIOS ---------------- */
function renderServices(data, targetSel) {
  const target = document.querySelector(targetSel);
  if (!target) return;
  target.innerHTML = "";
  data.services.forEach(s => {
    target.appendChild(el(`
      <div class="service-card">
        <span class="icon">${s.icon}</span>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
      </div>
    `));
  });
}

/* ---------------- CARTA / PLATOS ---------------- */
function dishCardHTML(item, opts) {
  opts = opts || {};
  const local = item.priceLocal;
  const llevar = (Number(local) + Number(0.25)).toFixed(2);
  return `
    <div class="dish-card" data-category="${item.category}">
      ${item.featured ? '<span class="dish-tag">Especialidad</span>' : ""}
      <div class="dish-media">🍢</div>
      <div class="dish-body">
        <h3>${item.name}</h3>
        <p>${item.description || ""}</p>
        <div class="price-row">
          <div class="price-pill">Local <strong>${money(local)}</strong></div>
          <div class="price-pill">Para llevar <strong>${money(llevar)}</strong></div>
        </div>
      </div>
    </div>
  `;
}

function renderFeaturedDishes(data, targetSel) {
  const target = document.querySelector(targetSel);
  if (!target) return;
  const items = data.menu.filter(m => m.active && m.featured);
  target.innerHTML = items.map(i => dishCardHTML(i)).join("") ||
    '<p class="empty-state">Agrega platos destacados desde el Panel Admin.</p>';
}

function renderCartaPage(data) {
  const filterBar = document.querySelector("#filter-bar");
  const grid = document.querySelector("#dish-grid");
  if (!grid) return;

  const cats = [{ id: "all", name: "Todos" }, ...data.categories];
  filterBar.innerHTML = cats.map((c, i) =>
    `<button class="filter-btn ${i === 0 ? "active" : ""}" data-cat="${c.id}">${c.name}</button>`
  ).join("");

  function draw(catId) {
    const items = data.menu.filter(m => m.active && (catId === "all" || m.category === catId));
    grid.innerHTML = items.map(i => dishCardHTML(i)).join("") ||
      '<p class="empty-state">No hay platos en esta categoría todavía.</p>';
  }

  filterBar.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      filterBar.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      draw(btn.dataset.cat);
    });
  });

  draw("all");
}

/* ---------------- ESPECIALES DEL DÍA ---------------- */
function stockBadgeHTML(item) {
  if (!item.active || item.stock <= 0) {
    return `<span class="stock-badge stock-out">Agotado</span>`;
  }
  if (item.stock <= 5) {
    return `<span class="stock-badge stock-low">¡Últimas ${item.stock} unidades!</span>`;
  }
  return `<span class="stock-badge stock-ok">${item.stock} unidades disponibles</span>`;
}

function dailyCardHTML(item) {
  const priced = item.price > 0;
  return `
    <div class="dish-card">
      <div class="dish-media">🌽</div>
      <div class="dish-body">
        ${stockBadgeHTML(item)}
        <h3>${item.name}</h3>
        <p>${item.description || ""}</p>
        <div class="price-row">
          <div class="price-pill">Precio <strong>${priced ? money(item.price) : "Por confirmar"}</strong></div>
        </div>
        ${item.updatedAt ? `<p style="font-size:.75rem;color:#9c8f7e;margin:0;">Actualizado: ${item.updatedAt}</p>` : ""}
      </div>
    </div>
  `;
}

function renderDailySpecialsPreview(data, targetSel) {
  const target = document.querySelector(targetSel);
  if (!target) return;
  const items = data.dailySpecials.filter(d => d.active).slice(0, 4);
  target.innerHTML = items.map(dailyCardHTML).join("") ||
    '<p class="empty-state">Hoy no hay aperitivos especiales publicados. ¡Vuelve pronto!</p>';
}

function renderDailySpecialsFull(data, targetSel) {
  const target = document.querySelector(targetSel);
  if (!target) return;
  const items = data.dailySpecials;
  target.innerHTML = items.map(dailyCardHTML).join("") ||
    '<p class="empty-state">Aún no se han agregado aperitivos especiales.</p>';
}

/* ---------------- PROMOCIONES ---------------- */
function promoCardHTML(p) {
  return `
    <div class="promo-card">
      <span class="badge">${p.badge || "Promoción"}</span>
      <h3>${p.title}</h3>
      <p>${p.description || ""}</p>
      ${p.price ? `<p style="font-family:var(--font-head);font-size:1.3rem;">${p.price}</p>` : ""}
      ${(p.startDate || p.endDate) ? `<p style="font-size:.78rem;opacity:.85;">Vigencia: ${p.startDate || "—"} a ${p.endDate || "—"}</p>` : ""}
    </div>
  `;
}

function renderPromotions(data, targetSel, previewOnly) {
  const target = document.querySelector(targetSel);
  if (!target) return;
  let items = data.promotions.filter(p => p.active);
  if (previewOnly) items = items.slice(0, 3);
  target.innerHTML = items.map(promoCardHTML).join("") ||
    '<p class="empty-state">No hay promociones activas por el momento. ¡Síguenos para no perderte las próximas!</p>';
}

/* ---------------- DOMICILIOS ---------------- */
function renderDeliveryInfo(data) {
  const list = document.querySelector("#tier-list");
  const note = document.querySelector("#delivery-note");
  if (!list) return;
  const d = data.delivery;
  list.innerHTML = d.tiers.map(t => `
    <div class="tier-row">
      <span>${t.label} <br><small>${t.distanceNote}</small></span>
      <strong>${t.fee > 0 ? money(t.fee) : (t.feeLabel || "Consultar")}</strong>
    </div>
  `).join("");
  if (note) {
    note.textContent =
      `Empaque para llevar: +${money(d.packagingFee)}. ${d.maxOrderDishesNote} Tarifa mínima de domicilio: ${money(d.minFee)}. ${d.tiersNote}`;
  }
}

function setupDeliveryCalculator(data) {
  const form = document.querySelector("#calc-form");
  if (!form) return;
  const zoneSel = form.querySelector("#calc-zone");
  const qtyInput = form.querySelector("#calc-qty");
  const modeSel = form.querySelector("#calc-mode");
  const result = document.querySelector("#calc-result");

  const d = data.delivery;
  zoneSel.innerHTML = d.tiers.map(t => `<option value="${t.id}">${t.label} (${t.distanceNote})</option>`).join("");

  function calc() {
    const mode = modeSel.value;
    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);

    if (mode === "local") {
      result.innerHTML = `Consumo en el local: sin cargos adicionales de empaque ni domicilio.`;
      return;
    }
    if (mode === "llevar") {
      const total = (d.packagingFee * qty).toFixed(2);
      result.innerHTML = `Cargo de empaque para <strong>${qty}</strong> plato(s): <strong>${money(total)}</strong> (${money(d.packagingFee)} c/u).`;
      return;
    }
    // domicilio
    const tier = d.tiers.find(t => t.id === zoneSel.value) || d.tiers[0];
    const packaging = (d.packagingFee * qty);
    const deliveryFee = tier.fee > 0 ? tier.fee : null;
    if (deliveryFee === null) {
      result.innerHTML = `Para <strong>${tier.label}</strong> el costo de domicilio debe confirmarse directamente con el restaurante. Empaque estimado: ${money(packaging)}.`;
      return;
    }
    const total = (packaging + deliveryFee).toFixed(2);
    result.innerHTML = `
      Empaque (${qty} plato/s): ${money(packaging)}<br>
      Envío a ${tier.label}: ${money(deliveryFee)}<br>
      <strong>Cargo adicional estimado: ${money(total)}</strong><br>
      <small>(No incluye el valor de los platos. Pedido mínimo de 1 a 3 platos.)</small>
    `;
  }

  form.addEventListener("input", calc);
  modeSel.addEventListener("change", () => {
    zoneSel.closest(".form-field-zone")?.classList.toggle("hidden", modeSel.value !== "domicilio");
    calc();
  });
  calc();
}
