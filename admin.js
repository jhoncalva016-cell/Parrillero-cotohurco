/* ============================================================
   PARRILLERO EL COTOHURCO — Lógica del Panel Admin
   ============================================================
   Acceso protegido por una contraseña simple guardada en
   localStorage (no es un sistema de seguridad real: cualquier
   persona con acceso al navegador y algo de conocimiento técnico
   podría revisar el código fuente). Es suficiente para evitar
   ediciones accidentales del personal, pero si el restaurante
   necesita seguridad real (varios usuarios, roles, etc.) se
   debería construir un backend con autenticación de verdad.
   ============================================================ */

const PASS_KEY = "cothourco_admin_pass";
const SESSION_KEY = "cothourco_admin_session";
const DEFAULT_PASS = "cothourco2026";

let editing = { servicio: null, menu: null, daily: null, promo: null, zone: null };

document.addEventListener("DOMContentLoaded", function () {
  Store.init();

  wireLogin();
  if (isLoggedIn()) showApp();

  wireTabs();
  wireImageFields();
  wireGalleryFields();
  wireGeneralForm();
  wireServiceForm();
  wireMenuForm();
  wireCategoryForm();
  wireDailyForm();
  wirePromoForm();
  wireDeliveryForms();
  wireAccountForms();

  renderAll();
});

/* ---------------- CAMPOS DE IMAGEN (URL o archivo subido) ----------------
   Cada campo de imagen tiene: un input de texto ".img-url-input" (guarda la
   URL o el data-URI final), un input de archivo ".img-file-input" opcional
   y una vista previa "img.img-preview". Al elegir un archivo, se redimensiona
   y comprime en el navegador (canvas) antes de guardarlo como data-URI, para
   no llenar el almacenamiento local del navegador con fotos pesadas.
------------------------------------------------------------------------- */
function wireImageFields() {
  document.addEventListener("change", e => {
    if (!e.target.classList || !e.target.classList.contains("img-file-input")) return;
    const fileInput = e.target;
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const field = fileInput.closest(".form-field");
    if (!field) return;
    const urlInput = field.querySelector(".img-url-input");
    const preview = field.querySelector(".img-preview");
    const maxDim = Number(fileInput.dataset.maxDim) || 900;
    const format = fileInput.dataset.format === "png" ? "image/png" : "image/jpeg";
    const quality = Number(fileInput.dataset.quality) || 0.75;

    toast("Procesando imagen…");
    resizeImageFile(file, maxDim, format, quality)
      .then(dataUrl => {
        if (urlInput) urlInput.value = dataUrl;
        if (preview) { preview.src = dataUrl; preview.style.display = "block"; }
        toast("Imagen lista. No olvides guardar el formulario.");
      })
      .catch(() => toast("No se pudo procesar esa imagen. Intenta con otro archivo."));
  });

  document.addEventListener("input", e => {
    if (!e.target.classList || !e.target.classList.contains("img-url-input")) return;
    const field = e.target.closest(".form-field");
    if (!field) return;
    const preview = field.querySelector(".img-preview");
    if (!preview) return;
    if (e.target.value) {
      preview.src = e.target.value;
      preview.style.display = "block";
    } else {
      preview.style.display = "none";
      preview.src = "";
    }
  });
}

function resizeImageFile(file, maxDim, format, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("No se pudo leer la imagen."));
      img.onload = () => {
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round(height * (maxDim / width));
            width = maxDim;
          } else {
            width = Math.round(width * (maxDim / height));
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL(format, quality));
        } catch (err) {
          reject(err);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* Sincroniza las vistas previas de imagen de un formulario con el valor
   actual de sus inputs ".img-url-input" (útil tras precargar un formulario
   para editar, o tras resetearlo). */
function refreshImagePreviews(form) {
  if (!form) return;
  form.querySelectorAll(".form-field").forEach(field => {
    const urlInput = field.querySelector(".img-url-input");
    const preview = field.querySelector(".img-preview");
    if (!urlInput || !preview) return;
    if (urlInput.value) {
      preview.src = urlInput.value;
      preview.style.display = "block";
    } else {
      preview.style.display = "none";
      preview.src = "";
    }
  });
}

/* ---------------- GALERÍA DE FOTOS (varias imágenes por servicio) ----------------
   Cada campo de galería tiene: un input oculto con name="gallery" que guarda un
   array (como JSON) de data-URIs/URLs, una fila de miniaturas ".gallery-thumbs"
   con botón de quitar por foto, y un input de archivo múltiple ".gallery-add-input"
   que redimensiona/comprime cada foto elegida antes de agregarla al array.
------------------------------------------------------------------------- */
function wireGalleryFields() {
  document.addEventListener("change", e => {
    if (!e.target.classList || !e.target.classList.contains("gallery-add-input")) return;
    const fileInput = e.target;
    const files = Array.from(fileInput.files || []);
    if (!files.length) return;
    const manager = fileInput.closest(".gallery-manager");
    if (!manager) return;
    const hidden = manager.querySelector('input[type="hidden"]');
    const maxDim = Number(fileInput.dataset.maxDim) || 1200;
    const format = fileInput.dataset.format === "png" ? "image/png" : "image/jpeg";
    const quality = Number(fileInput.dataset.quality) || 0.72;

    toast("Procesando " + files.length + " imagen(es)…");
    Promise.all(files.map(f => resizeImageFile(f, maxDim, format, quality)))
      .then(dataUrls => {
        const current = getGalleryArray(hidden);
        setGalleryArray(hidden, current.concat(dataUrls));
        renderGalleryThumbs(manager);
        fileInput.value = "";
        toast("Fotos agregadas. No olvides guardar el formulario.");
      })
      .catch(() => toast("No se pudieron procesar algunas imágenes."));
  });

  document.addEventListener("click", e => {
    if (!e.target.classList || !e.target.classList.contains("gallery-remove")) return;
    const manager = e.target.closest(".gallery-manager");
    if (!manager) return;
    const hidden = manager.querySelector('input[type="hidden"]');
    const idx = Number(e.target.dataset.idx);
    const current = getGalleryArray(hidden);
    current.splice(idx, 1);
    setGalleryArray(hidden, current);
    renderGalleryThumbs(manager);
  });
}

function getGalleryArray(hiddenInput) {
  if (!hiddenInput || !hiddenInput.value) return [];
  try {
    const parsed = JSON.parse(hiddenInput.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}
function setGalleryArray(hiddenInput, arr) {
  if (hiddenInput) hiddenInput.value = JSON.stringify(arr);
}
function renderGalleryThumbs(manager) {
  const hidden = manager.querySelector('input[type="hidden"]');
  const thumbs = manager.querySelector(".gallery-thumbs");
  if (!thumbs) return;
  const arr = getGalleryArray(hidden);
  thumbs.innerHTML = arr.map((src, i) => `
    <span class="gallery-thumb">
      <img src="${src}">
      <button type="button" class="gallery-remove" data-idx="${i}" title="Quitar foto">×</button>
    </span>
  `).join("") || `<span class="gallery-empty-hint">Sin fotos todavía.</span>`;
}
/* Sincroniza todas las galerías de un formulario con el valor actual de su
   input oculto (tras precargar el formulario para editar, o tras resetearlo). */
function refreshGalleryManagers(form) {
  if (!form) return;
  form.querySelectorAll(".gallery-manager").forEach(manager => renderGalleryThumbs(manager));
}

/* ---------------- AUTENTICACIÓN ---------------- */
function getPass() { return localStorage.getItem(PASS_KEY) || DEFAULT_PASS; }
function setPass(p) { localStorage.setItem(PASS_KEY, p); }
function isLoggedIn() { return sessionStorage.getItem(SESSION_KEY) === "1"; }

function showApp() {
  document.getElementById("admin-login").style.display = "none";
  document.getElementById("admin-app").style.display = "block";
}

function wireLogin() {
  const form = document.getElementById("login-form");
  const error = document.getElementById("login-error");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const pw = document.getElementById("login-password").value;
    if (pw === getPass()) {
      sessionStorage.setItem(SESSION_KEY, "1");
      error.style.display = "none";
      showApp();
      renderAll();
    } else {
      error.style.display = "block";
    }
  });

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem(SESSION_KEY);
      location.reload();
    });
  }
}

/* ---------------- TABS ---------------- */
function wireTabs() {
  document.querySelectorAll(".admin-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("panel-" + tab.dataset.tab).classList.add("active");
    });
  });
}

/* ---------------- TOAST ---------------- */
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ---------------- helpers de formulario ---------------- */
function formToObject(form) {
  const fd = new FormData(form);
  const obj = {};
  fd.forEach((v, k) => obj[k] = v);
  return obj;
}
function toBool(v) { return v === "true" || v === true; }
function toNum(v) { return Number(v) || 0; }
function todayStr() {
  const d = new Date();
  return d.toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/* ---------------- RENDER GENERAL ---------------- */
function renderAll() {
  const data = Store.getAll();
  fillGeneralForm(data);
  renderServiceTable(data);
  fillCategorySelect(data);
  renderCategoryList(data);
  renderMenuTable(data);
  renderDailyTable(data);
  renderPromoTable(data);
  fillDeliveryRulesForm(data);
  renderZoneTable(data);
}

/* ================= GENERAL ================= */
function wireGeneralForm() {
  const form = document.getElementById("form-general");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const obj = formToObject(form);
    Store.updateRestaurant(obj);
    toast("Información del restaurante actualizada.");
  });
}
function fillGeneralForm(data) {
  const form = document.getElementById("form-general");
  Object.keys(data.restaurant).forEach(k => {
    if (form.elements[k]) form.elements[k].value = data.restaurant[k];
  });
  refreshImagePreviews(form);
}

/* ================= SERVICIOS ================= */
function wireServiceForm() {
  const form = document.getElementById("form-servicio");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const obj = formToObject(form);
    if (!obj.id) delete obj.id;
    obj.gallery = getGalleryArray({ value: obj.gallery });
    Store.upsertItem("services", obj);
    form.reset();
    refreshImagePreviews(form);
    refreshGalleryManagers(form);
    editing.servicio = null;
    document.getElementById("svc-form-title").textContent = "Agregar servicio";
    renderServiceTable(Store.getAll());
    toast("Servicio guardado.");
  });
  document.getElementById("svc-cancel").addEventListener("click", () => {
    form.reset();
    refreshImagePreviews(form);
    refreshGalleryManagers(form);
    editing.servicio = null;
    document.getElementById("svc-form-title").textContent = "Agregar servicio";
  });
}
function renderServiceTable(data) {
  const body = document.getElementById("svc-table-body");
  body.innerHTML = data.services.map(s => `
    <tr>
      <td style="font-size:1.3rem;">${s.iconImage ? `<img src="${s.iconImage}" class="table-thumb-icon">` : s.icon}</td>
      <td>${s.title}</td>
      <td>${s.desc || ""}</td>
      <td class="row-actions">
        <button class="btn btn-outline btn-sm" data-edit-svc="${s.id}">Editar</button>
        <button class="btn btn-danger btn-sm" data-del-svc="${s.id}">Eliminar</button>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="4">Sin servicios registrados.</td></tr>`;

  body.querySelectorAll("[data-edit-svc]").forEach(btn => btn.addEventListener("click", () => {
    const item = Store.getAll().services.find(s => s.id === btn.dataset.editSvc);
    const form = document.getElementById("form-servicio");
    form.elements.id.value = item.id;
    form.elements.icon.value = item.icon;
    form.elements.title.value = item.title;
    form.elements.desc.value = item.desc;
    form.elements.iconImage.value = item.iconImage || "";
    form.elements.detailImage.value = item.detailImage || "";
    form.elements.gallery.value = JSON.stringify(item.gallery || []);
    refreshImagePreviews(form);
    refreshGalleryManagers(form);
    document.getElementById("svc-form-title").textContent = "Editar servicio";
    document.querySelector('[data-tab="servicios"]').click();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }));
  body.querySelectorAll("[data-del-svc]").forEach(btn => btn.addEventListener("click", () => {
    if (!confirm("¿Eliminar este servicio?")) return;
    Store.removeItem("services", btn.dataset.delSvc);
    renderServiceTable(Store.getAll());
    toast("Servicio eliminado.");
  }));
}

/* ================= CATEGORÍAS ================= */
function wireCategoryForm() {
  const form = document.getElementById("form-category");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = form.elements.catName.value.trim();
    if (!name) return;
    const data = Store.getAll();
    const id = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || Store.uid("cat");
    if (data.categories.find(c => c.id === id)) {
      toast("Esa categoría ya existe.");
      return;
    }
    data.categories.push({ id, name });
    Store.setAll(data);
    form.reset();
    fillCategorySelect(data);
    renderCategoryList(data);
    toast("Categoría agregada.");
  });
}
function fillCategorySelect(data) {
  const sel = document.getElementById("menu-category-select");
  const current = sel.value;
  sel.innerHTML = data.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  if (current) sel.value = current;
}
function renderCategoryList(data) {
  const box = document.getElementById("cat-list");
  box.innerHTML = data.categories.map(c => `
    <span style="display:inline-flex;align-items:center;gap:6px;background:var(--color-cream);padding:5px 10px;border-radius:999px;margin:3px 4px 0 0;">
      ${c.name}
      <button data-del-cat="${c.id}" style="border:none;background:none;color:var(--color-ember);cursor:pointer;font-weight:700;" title="Eliminar categoría">✕</button>
    </span>
  `).join("");
  box.querySelectorAll("[data-del-cat]").forEach(btn => btn.addEventListener("click", () => {
    const data2 = Store.getAll();
    const inUse = data2.menu.some(m => m.category === btn.dataset.delCat);
    if (inUse && !confirm("Hay platos usando esta categoría. ¿Eliminarla de todos modos?")) return;
    data2.categories = data2.categories.filter(c => c.id !== btn.dataset.delCat);
    Store.setAll(data2);
    fillCategorySelect(data2);
    renderCategoryList(data2);
    toast("Categoría eliminada.");
  }));
}

/* ================= CARTA (MENÚ) ================= */
function wireMenuForm() {
  const form = document.getElementById("form-menu");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const obj = formToObject(form);
    obj.priceLocal = toNum(obj.priceLocal);
    obj.featured = toBool(obj.featured);
    obj.active = toBool(obj.active);
    if (!obj.id) delete obj.id;
    Store.upsertItem("menu", obj);
    form.reset();
    refreshImagePreviews(form);
    editing.menu = null;
    document.getElementById("menu-form-title").textContent = "Agregar plato a la carta";
    renderMenuTable(Store.getAll());
    toast("Plato guardado en la carta.");
  });
  document.getElementById("menu-cancel").addEventListener("click", () => {
    form.reset();
    refreshImagePreviews(form);
    editing.menu = null;
    document.getElementById("menu-form-title").textContent = "Agregar plato a la carta";
  });
}
function renderMenuTable(data) {
  const body = document.getElementById("menu-table-body");
  const catName = id => (data.categories.find(c => c.id === id) || {}).name || id;
  body.innerHTML = data.menu.map(m => `
    <tr>
      <td>${m.image ? `<img src="${m.image}" class="table-thumb">` : ""}${m.name}${m.featured ? " ⭐" : ""}</td>
      <td>${catName(m.category)}</td>
      <td>${money(m.priceLocal)}</td>
      <td>${money(Number(m.priceLocal) + 0.25)}</td>
      <td>${m.active ? '<span class="badge-active">Activo</span>' : '<span class="badge-inactive">Oculto</span>'}</td>
      <td class="row-actions">
        <button class="btn btn-outline btn-sm" data-edit-menu="${m.id}">Editar</button>
        <button class="btn btn-danger btn-sm" data-del-menu="${m.id}">Eliminar</button>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="6">No hay platos todavía.</td></tr>`;

  body.querySelectorAll("[data-edit-menu]").forEach(btn => btn.addEventListener("click", () => {
    const item = Store.getAll().menu.find(m => m.id === btn.dataset.editMenu);
    const form = document.getElementById("form-menu");
    form.elements.id.value = item.id;
    form.elements.name.value = item.name;
    form.elements.category.value = item.category;
    form.elements.description.value = item.description || "";
    form.elements.priceLocal.value = item.priceLocal;
    form.elements.featured.value = String(!!item.featured);
    form.elements.active.value = String(!!item.active);
    form.elements.image.value = item.image || "";
    refreshImagePreviews(form);
    document.getElementById("menu-form-title").textContent = "Editar plato";
    document.querySelector('[data-tab="carta"]').click();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }));
  body.querySelectorAll("[data-del-menu]").forEach(btn => btn.addEventListener("click", () => {
    if (!confirm("¿Eliminar este plato de la carta?")) return;
    Store.removeItem("menu", btn.dataset.delMenu);
    renderMenuTable(Store.getAll());
    toast("Plato eliminado.");
  }));
}

/* ================= ESPECIALES DEL DÍA ================= */
function wireDailyForm() {
  const form = document.getElementById("form-daily");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const obj = formToObject(form);
    obj.price = toNum(obj.price);
    obj.stock = toNum(obj.stock);
    obj.active = toBool(obj.active);
    obj.updatedAt = todayStr();
    if (!obj.id) delete obj.id;
    Store.upsertItem("dailySpecials", obj);
    form.reset();
    refreshImagePreviews(form);
    editing.daily = null;
    document.getElementById("daily-form-title").textContent = "Agregar / actualizar producto del día";
    renderDailyTable(Store.getAll());
    toast("Disponibilidad del día actualizada.");
  });
  document.getElementById("daily-cancel").addEventListener("click", () => {
    form.reset();
    refreshImagePreviews(form);
    editing.daily = null;
    document.getElementById("daily-form-title").textContent = "Agregar / actualizar producto del día";
  });
}
function renderDailyTable(data) {
  const body = document.getElementById("daily-table-body");
  body.innerHTML = data.dailySpecials.map(d => `
    <tr>
      <td>${d.image ? `<img src="${d.image}" class="table-thumb">` : ""}${d.name}</td>
      <td>${d.subcategory}</td>
      <td>${d.price > 0 ? money(d.price) : "—"}</td>
      <td>${d.stock} ${d.unit || ""}</td>
      <td>${d.updatedAt || "—"}</td>
      <td>${d.active ? '<span class="badge-active">Publicado</span>' : '<span class="badge-inactive">Oculto</span>'}</td>
      <td class="row-actions">
        <button class="btn btn-outline btn-sm" data-edit-daily="${d.id}">Editar</button>
        <button class="btn btn-danger btn-sm" data-del-daily="${d.id}">Eliminar</button>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="7">No hay productos del día registrados.</td></tr>`;

  body.querySelectorAll("[data-edit-daily]").forEach(btn => btn.addEventListener("click", () => {
    const item = Store.getAll().dailySpecials.find(d => d.id === btn.dataset.editDaily);
    const form = document.getElementById("form-daily");
    form.elements.id.value = item.id;
    form.elements.name.value = item.name;
    form.elements.subcategory.value = item.subcategory;
    form.elements.description.value = item.description || "";
    form.elements.price.value = item.price;
    form.elements.stock.value = item.stock;
    form.elements.unit.value = item.unit || "unidad";
    form.elements.active.value = String(!!item.active);
    form.elements.image.value = item.image || "";
    refreshImagePreviews(form);
    document.getElementById("daily-form-title").textContent = "Editar producto del día";
    document.querySelector('[data-tab="diario"]').click();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }));
  body.querySelectorAll("[data-del-daily]").forEach(btn => btn.addEventListener("click", () => {
    if (!confirm("¿Eliminar este producto?")) return;
    Store.removeItem("dailySpecials", btn.dataset.delDaily);
    renderDailyTable(Store.getAll());
    toast("Producto eliminado.");
  }));
}

/* ================= PROMOCIONES ================= */
function wirePromoForm() {
  const form = document.getElementById("form-promo");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const obj = formToObject(form);
    obj.active = toBool(obj.active);
    if (!obj.id) delete obj.id;
    Store.upsertItem("promotions", obj);
    form.reset();
    refreshImagePreviews(form);
    editing.promo = null;
    document.getElementById("promo-form-title").textContent = "Agregar promoción / lanzamiento de temporada";
    renderPromoTable(Store.getAll());
    toast("Promoción guardada.");
  });
  document.getElementById("promo-cancel").addEventListener("click", () => {
    form.reset();
    refreshImagePreviews(form);
    editing.promo = null;
    document.getElementById("promo-form-title").textContent = "Agregar promoción / lanzamiento de temporada";
  });
}
function renderPromoTable(data) {
  const body = document.getElementById("promo-table-body");
  body.innerHTML = data.promotions.map(p => `
    <tr>
      <td>${p.image ? `<img src="${p.image}" class="table-thumb">` : ""}${p.title}</td>
      <td>${(p.startDate || "—")} a ${(p.endDate || "—")}</td>
      <td>${p.active ? '<span class="badge-active">Activa</span>' : '<span class="badge-inactive">Inactiva</span>'}</td>
      <td class="row-actions">
        <button class="btn btn-outline btn-sm" data-edit-promo="${p.id}">Editar</button>
        <button class="btn btn-danger btn-sm" data-del-promo="${p.id}">Eliminar</button>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="4">No hay promociones registradas.</td></tr>`;

  body.querySelectorAll("[data-edit-promo]").forEach(btn => btn.addEventListener("click", () => {
    const item = Store.getAll().promotions.find(p => p.id === btn.dataset.editPromo);
    const form = document.getElementById("form-promo");
    form.elements.id.value = item.id;
    form.elements.title.value = item.title;
    form.elements.badge.value = item.badge || "";
    form.elements.description.value = item.description || "";
    form.elements.price.value = item.price || "";
    form.elements.startDate.value = item.startDate || "";
    form.elements.endDate.value = item.endDate || "";
    form.elements.active.value = String(!!item.active);
    form.elements.image.value = item.image || "";
    refreshImagePreviews(form);
    document.getElementById("promo-form-title").textContent = "Editar promoción";
    document.querySelector('[data-tab="promos"]').click();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }));
  body.querySelectorAll("[data-del-promo]").forEach(btn => btn.addEventListener("click", () => {
    if (!confirm("¿Eliminar esta promoción?")) return;
    Store.removeItem("promotions", btn.dataset.delPromo);
    renderPromoTable(Store.getAll());
    toast("Promoción eliminada.");
  }));
}

/* ================= DOMICILIO ================= */
function wireDeliveryForms() {
  const rulesForm = document.getElementById("form-delivery-rules");
  rulesForm.addEventListener("submit", e => {
    e.preventDefault();
    const obj = formToObject(rulesForm);
    obj.packagingFee = toNum(obj.packagingFee);
    obj.minFee = toNum(obj.minFee);
    Store.updateDelivery(obj);
    toast("Reglas de domicilio actualizadas.");
  });

  const zoneForm = document.getElementById("form-zone");
  zoneForm.addEventListener("submit", e => {
    e.preventDefault();
    const obj = formToObject(zoneForm);
    obj.fee = toNum(obj.fee);
    if (!obj.id) delete obj.id;
    Store.upsertDeliveryTier(obj);
    zoneForm.reset();
    editing.zone = null;
    document.getElementById("zone-form-title").textContent = "Agregar / editar zona de entrega";
    renderZoneTable(Store.getAll());
    toast("Zona de entrega guardada.");
  });
  document.getElementById("zone-cancel").addEventListener("click", () => {
    zoneForm.reset();
    editing.zone = null;
    document.getElementById("zone-form-title").textContent = "Agregar / editar zona de entrega";
  });
}
function fillDeliveryRulesForm(data) {
  const form = document.getElementById("form-delivery-rules");
  form.elements.packagingFee.value = data.delivery.packagingFee;
  form.elements.minFee.value = data.delivery.minFee;
  form.elements.maxOrderDishesNote.value = data.delivery.maxOrderDishesNote;
  form.elements.tiersNote.value = data.delivery.tiersNote;
}
function renderZoneTable(data) {
  const body = document.getElementById("zone-table-body");
  body.innerHTML = data.delivery.tiers.map(t => `
    <tr>
      <td>${t.label}</td>
      <td>${t.distanceNote || ""}</td>
      <td>${t.fee > 0 ? money(t.fee) : (t.feeLabel || "Consultar")}</td>
      <td class="row-actions">
        <button class="btn btn-outline btn-sm" data-edit-zone="${t.id}">Editar</button>
        <button class="btn btn-danger btn-sm" data-del-zone="${t.id}">Eliminar</button>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="4">No hay zonas configuradas.</td></tr>`;

  body.querySelectorAll("[data-edit-zone]").forEach(btn => btn.addEventListener("click", () => {
    const item = Store.getAll().delivery.tiers.find(t => t.id === btn.dataset.editZone);
    const form = document.getElementById("form-zone");
    form.elements.id.value = item.id;
    form.elements.label.value = item.label;
    form.elements.distanceNote.value = item.distanceNote || "";
    form.elements.fee.value = item.fee || 0;
    document.getElementById("zone-form-title").textContent = "Editar zona de entrega";
    document.querySelector('[data-tab="domicilio"]').click();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }));
  body.querySelectorAll("[data-del-zone]").forEach(btn => btn.addEventListener("click", () => {
    if (!confirm("¿Eliminar esta zona de entrega?")) return;
    Store.removeDeliveryTier(btn.dataset.delZone);
    renderZoneTable(Store.getAll());
    toast("Zona eliminada.");
  }));
}

/* ================= CUENTA ================= */
function wireAccountForms() {
  const pwForm = document.getElementById("form-password");
  pwForm.addEventListener("submit", e => {
    e.preventDefault();
    const obj = formToObject(pwForm);
    if (obj.current !== getPass()) {
      toast("La contraseña actual no es correcta.");
      return;
    }
    setPass(obj.next);
    pwForm.reset();
    toast("Contraseña actualizada.");
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    if (!confirm("Esto borrará todos los cambios guardados en este navegador. ¿Continuar?")) return;
    Store.resetToDefaults();
    renderAll();
    toast("Datos restaurados a los valores de fábrica.");
  });
}

/* ---------------- utilidad de dinero (compartida con main.js) ---------------- */
function money(n) {
  const num = Number(n) || 0;
  return "$" + num.toFixed(2);
}
