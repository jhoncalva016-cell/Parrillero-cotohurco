/* ============================================================
   PARRILLERO EL COTHOURCO — Lógica del sitio público
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  Store.init();
  const data = Store.getAll();

  setupNav();
  renderRestaurantInfo(data);
  renderFooterInfo(data);
  renderPageHeroExtras(data);

  const page = document.body.dataset.page;

  if (page === "home") {
    renderServices(data, "#home-services");
    renderFeaturedDishes(data, "#home-featured");
    renderPromotions(data, "#home-promos", true);
    renderDailySpecialsPreview(data, "#home-daily-preview");
    renderHeroExtras(data);
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
    renderServiceDetails(data);
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
    "[data-footer-address]": r.address ? ("Quito, Ecuador (UIO) – " + r.address) : "",
    "[data-footer-phone]": r.phone,
    "[data-footer-phone2]": r.phoneLandline,
    "[data-footer-email]": r.email,
    "[data-footer-hours]": r.hoursWeekday,
    "[data-footer-hours-note]": r.hoursNote
  };
  Object.keys(map).forEach(sel => {
    document.querySelectorAll(sel).forEach(node => {
      node.textContent = map[sel];
    });
  });
  document.querySelectorAll(".addr-row").forEach(row => {
    row.style.display = r.address ? "" : "none";
  });
  function toTelHref(rawPhone) {
    const digits = (rawPhone || "").replace(/\D/g, "");
    let tel = digits;
    if (digits.startsWith("0")) tel = "593" + digits.slice(1);
    return digits ? ("tel:+" + tel) : "#";
  }
  // El número de celular (📞) queda sincronizado directo con WhatsApp;
  // si no hay número de WhatsApp configurado, cae de respaldo a la llamada normal.
  document.querySelectorAll("[data-phone-link]").forEach(a => {
    a.href = toWhatsAppLink(r.whatsapp, "Hola, quisiera más información.") || toTelHref(r.phone);
  });
  document.querySelectorAll("[data-phone2-link]").forEach(a => {
    a.href = toTelHref(r.phoneLandline);
    a.style.display = r.phoneLandline ? "" : "none";
  });
  document.querySelectorAll("[data-email-link]").forEach(a => {
    a.href = r.email ? ("mailto:" + r.email) : "#";
    const wrap = a.closest("p");
    if (wrap) wrap.style.display = r.email ? "" : "none";
  });
  document.querySelectorAll("[data-map-link]").forEach(a => {
    a.href = r.mapsUrl
      ? r.mapsUrl
      : (r.address
          ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(r.address)
          : "#");
  });

  applySocialLinks(data);
}

/* Aplica los enlaces de redes sociales y sugerencias/elogios a CUALQUIER
   bloque presente en la página (footer, empty-state de promociones, etc.)
   que use los atributos [data-social], [data-social-icons] y [data-feedback-link].
   Se puede volver a llamar después de inyectar nuevo HTML dinámicamente. */
function applySocialLinks(data) {
  const r = data.restaurant;
  const socialLinks = {
    whatsapp: toWhatsAppLink(r.whatsapp, "Hola, quisiera más información."),
    facebook: r.facebook || "",
    instagram: r.instagram || "",
    tiktok: r.tiktok || ""
  };
  document.querySelectorAll("[data-social]").forEach(a => {
    const url = socialLinks[a.dataset.social];
    if (url) {
      a.href = url;
      a.style.display = "";
    } else {
      a.style.display = "none";
    }
  });
  // El icono de WhatsApp ya no se muestra en la fila de redes (ver [data-phone-link]
  // más arriba, que ahora abre WhatsApp directo); la fila solo depende de fb/ig/tiktok.
  const anySocial = ["facebook", "instagram", "tiktok"].some(k => socialLinks[k]);
  document.querySelectorAll("[data-social-icons]").forEach(wrap => {
    wrap.style.display = anySocial ? "" : "none";
  });

  // El buzón de "Sugerencias y elogios" queda sincronizado con Facebook;
  // si aún no hay Facebook configurado, usa feedbackUrl y luego WhatsApp de respaldo.
  document.querySelectorAll("[data-feedback-link]").forEach(a => {
    const url = r.feedbackUrl || r.facebook || toWhatsAppLink(r.whatsapp, "Hola, quiero dejar una sugerencia o un elogio para el restaurante.");
    const wrap = a.closest("p");
    if (url) {
      a.href = url;
      if (wrap) wrap.style.display = "";
    } else if (wrap) {
      wrap.style.display = "none";
    }
  });
}

function toWhatsAppLink(rawPhone, presetText) {
  const digits = (rawPhone || "").replace(/\D/g, "");
  if (!digits) return "";
  const intl = digits.startsWith("0") ? "593" + digits.slice(1) : digits;
  let url = "https://wa.me/" + intl;
  if (presetText) url += "?text=" + encodeURIComponent(presetText);
  return url;
}

/* ---------------- SERVICIOS ---------------- */
function renderServices(data, targetSel) {
  const target = document.querySelector(targetSel);
  if (!target) return;
  target.innerHTML = "";
  data.services.forEach(s => {
    const iconHTML = s.iconImage
      ? `<img class="icon-img" src="${s.iconImage}" alt="${s.title}">`
      : `<span class="icon">${s.icon}</span>`;
    const tag = s.link ? "a" : "div";
    const openAttrs = s.link ? ` href="${s.link}"` : "";
    const moreHint = s.link ? `<span class="service-card-more">Ver más →</span>` : "";
    const directLinkHTML = s.directLinkUrl ? `
          <a class="service-direct-link" href="${s.directLinkUrl}">${s.directLinkLabel || "Intentar conectar directo"}</a>
          ${s.directLinkNote ? `<span class="service-direct-note">${s.directLinkNote}</span>` : ""}` : "";
    const qrHTML = s.qrImage ? `
        <div class="service-qr-box">
          <img class="service-qr-img" src="${s.qrImage}" alt="Código QR para conectarte a ${s.title}">
          <span class="service-qr-caption">${s.qrCaption || "Escanéalo con la cámara de tu celular para conectarte."}</span>
          ${directLinkHTML}
        </div>` : "";
    target.appendChild(el(`
      <${tag}${openAttrs} class="service-card${s.link ? " is-link" : ""}${s.qrImage ? " has-qr" : ""}">
        ${iconHTML}
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
        ${qrHTML}
        ${moreHint}
      </${tag}>
    `));
  });
}

/* Secciones ampliadas para servicios con más contenido (fotos, croquis) —
   solo se renderizan en servicios.html, dentro de #service-details. */
function renderServiceDetails(data) {
  const target = document.querySelector("#service-details");
  if (!target) return;
  const items = data.services.filter(s => s.hasDetail);
  target.innerHTML = items.map(serviceDetailHTML).join("");
}

function serviceDetailHTML(s) {
  const anchorId = "svc-detail-" + s.id;
  let body;
  if (s.gallery && s.gallery.length) {
    body = `<div class="service-detail-gallery">` +
      s.gallery.map(src => `<div class="service-detail-photo" style="background-image:url('${src}')"></div>`).join("") +
      `</div>`;
  } else if (s.detailImage) {
    body = `<div class="service-detail-image" style="background-image:url('${s.detailImage}')"></div>`;
  } else {
    body = `<p class="empty-state">Aún no se han agregado fotos de "${s.title}". Se pueden subir desde el Panel Admin.</p>`;
  }
  return `
    <div class="service-detail-section" id="${anchorId}">
      <h3>${s.title}</h3>
      ${body}
    </div>
  `;
}

/* Lightbox simple: click en una foto de la galería de servicios, o en un
   código QR de servicio, la muestra ampliada; click de nuevo (en cualquier
   parte del overlay) la cierra. */
document.addEventListener("click", e => {
  const qrImg = e.target.closest(".service-qr-img");
  if (qrImg) {
    e.preventDefault();
    e.stopPropagation();
    const overlay = el(`<div class="lightbox-overlay"><img class="lightbox-img lightbox-qr" src="${qrImg.src}" alt=""></div>`);
    document.body.appendChild(overlay);
    overlay.addEventListener("click", () => overlay.remove());
    return;
  }
  const photo = e.target.closest(".service-detail-photo");
  if (!photo) return;
  const match = /url\((['"]?)(.*?)\1\)/.exec(photo.style.backgroundImage || "");
  const src = match ? match[2] : "";
  if (!src) return;
  const overlay = el(`<div class="lightbox-overlay"><img class="lightbox-img" src="${src}" alt=""></div>`);
  document.body.appendChild(overlay);
  overlay.addEventListener("click", () => overlay.remove());
});

/* ---------------- HERO (portada) ---------------- */
/* Fondo animado (imagen, video o degradado, "live wallpaper") para TODA
   la página en las páginas interiores (las que tienen .page-hero: La
   Carta, Desayunos, Noticias, Servicios y Domicilios). Se fija detrás de
   todo el contenido (position:fixed) para que las tarjetas (calculadora,
   platos, servicios, etc.) queden "flotando" encima. Cada página tiene su
   PROPIO fondo, independiente de las demás — editable por separado desde
   el Panel Admin → General. Si una página no tiene imagen ni video propio,
   se usa el degradado ámbar animado por defecto. */
function renderPageHeroExtras(data) {
  const r = data.restaurant;
  const hero = document.querySelector(".page-hero");
  if (!hero) return; // solo páginas interiores

  const page = document.body.dataset.page; // carta | desayunos | domicilios | promociones | servicios
  const pageVideo = r["pageHeroVideo_" + page] || "";
  const pageImage = r["pageHeroImage_" + page] || "";

  const overlay = el(`<div class="page-bg-overlay"></div>`);
  let media;
  if (pageVideo) {
    media = document.createElement("video");
    media.className = "page-bg-media";
    media.autoplay = true;
    media.muted = true;
    media.loop = true;
    media.playsInline = true;
    const source = document.createElement("source");
    source.src = pageVideo;
    source.type = "video/mp4";
    media.appendChild(source);
  } else if (pageImage) {
    media = el(`<div class="page-bg-media"></div>`);
    media.style.backgroundImage = "url('" + pageImage + "')";
  } else {
    media = el(`<div class="page-bg-media page-bg-gradient"></div>`);
  }
  document.body.insertBefore(overlay, document.body.firstChild);
  document.body.insertBefore(media, document.body.firstChild);
}

function renderHeroExtras(data) {
  const r = data.restaurant;
  const hero = document.querySelector(".hero");
  if (hero && (r.heroVideo || r.heroImage)) {
    const overlay = el(`<div class="hero-bg-overlay"></div>`);
    let media;
    if (r.heroVideo) {
      media = document.createElement("video");
      media.className = "hero-bg-media";
      media.autoplay = true;
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      const source = document.createElement("source");
      source.src = r.heroVideo;
      source.type = "video/mp4";
      media.appendChild(source);
    } else {
      media = el(`<div class="hero-bg-media"></div>`);
      media.style.backgroundImage = "url('" + r.heroImage + "')";
      media.style.backgroundSize = "cover";
      media.style.backgroundPosition = "center";
    }
    hero.insertBefore(overlay, hero.firstChild);
    hero.insertBefore(media, hero.firstChild);
  }

  const actions = document.querySelector(".hero-actions");
  if (actions) {
    if (r.reservationUrl) {
      actions.appendChild(el(`<a href="${r.reservationUrl}" target="_blank" rel="noopener" class="btn btn-outline-light">Reservar</a>`));
    }
    if (r.orderUrl) {
      actions.appendChild(el(`<a href="${r.orderUrl}" target="_blank" rel="noopener" class="btn btn-gold">Pedir a domicilio</a>`));
    }
  }
}

/* ---------------- CARTA / PLATOS ---------------- */
function dishCardHTML(item, opts) {
  opts = opts || {};
  const local = item.priceLocal;
  const llevar = (Number(local) + Number(0.25)).toFixed(2);
  const media = item.image
    ? `<div class="dish-media" style="background-image:url('${item.image}');background-size:cover;background-position:center;"></div>`
    : `<div class="dish-media">🍢</div>`;
  return `
    <div class="dish-card" data-category="${item.category}">
      <div class="dish-corner">
        <img src="images/logo.png" alt="" class="dish-brand-mark">
        ${item.featured ? '<span class="dish-tag">Especialidad</span>' : ""}
      </div>
      ${media}
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
  const media = item.image
    ? `<div class="dish-media" style="background-image:url('${item.image}');background-size:cover;background-position:center;"></div>`
    : `<div class="dish-media">🌽</div>`;
  return `
    <div class="dish-card">
      ${media}
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
  const media = p.image
    ? `<div class="promo-media" style="background-image:url('${p.image}')"></div>`
    : "";
  return `
    <div class="promo-card">
      ${media}
      <span class="badge">${p.badge || "Promoción"}</span>
      <h3>${p.title}</h3>
      <p>${p.description || ""}</p>
      ${p.price ? `<p style="font-family:var(--font-head);font-size:1.3rem;">${p.price}</p>` : ""}
      ${(p.startDate || p.endDate) ? `<p style="font-size:.78rem;opacity:.85;">Vigencia: ${p.startDate || "—"} a ${p.endDate || "—"}</p>` : ""}
    </div>
  `;
}

function promoEmptyStateHTML() {
  return `
    <div class="empty-state empty-state-social">
      <p>No hay promociones activas por el momento. ¡Síguenos para no perderte las próximas!</p>
      <div class="social-icons social-icons--light" data-social-icons>
        <a href="#" data-social="facebook" target="_blank" rel="noopener" title="Facebook"><img src="images/social-facebook.png" alt="Facebook"></a>
        <a href="#" data-social="instagram" target="_blank" rel="noopener" title="Instagram"><img src="images/social-instagram.png" alt="Instagram"></a>
        <a href="#" data-social="tiktok" target="_blank" rel="noopener" title="TikTok"><img src="images/social-tiktok.png" alt="TikTok"></a>
      </div>
      <p><a href="#" data-feedback-link target="_blank" rel="noopener" class="empty-state-feedback"><img src="images/icon-feedback.png" alt="" class="feedback-icon"> Sugerencias y elogios</a></p>
    </div>
  `;
}

function renderPromotions(data, targetSel, previewOnly) {
  const target = document.querySelector(targetSel);
  if (!target) return;
  let items = data.promotions.filter(p => p.active);
  if (previewOnly) items = items.slice(0, 3);
  if (items.length) {
    target.innerHTML = items.map(promoCardHTML).join("");
  } else {
    target.innerHTML = promoEmptyStateHTML();
    applySocialLinks(data);
  }
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
