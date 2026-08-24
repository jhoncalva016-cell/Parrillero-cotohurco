/* ============================================================
   PARRILLERO EL COTHOURCO — Capa de almacenamiento (Store)
   ============================================================
   Envuelve localStorage para guardar toda la información del
   sitio (carta, especiales del día, promociones, servicios,
   reglas de domicilio) directamente en el navegador. Esto
   permite que el Panel Admin actualice precios y disponibilidad
   "a diario" sin necesidad de un servidor.

   Si en el futuro el restaurante quiere que estos datos se
   sincronicen entre varios dispositivos (por ejemplo, que el
   celular del administrador actualice lo que ven los clientes
   en tiempo real), este Store es el único archivo que habría
   que reemplazar por llamadas a una API/backend real.
   ============================================================ */

const STORAGE_KEY = "cothourco_data_v1";

const Store = (function () {

  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error("Error leyendo datos guardados, se usarán los valores por defecto.", e);
      return null;
    }
  }

  function _save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /* Rellena en los datos YA GUARDADOS del navegador cualquier campo nuevo
     que el código haya incorporado después de que ese navegador guardó
     su copia (por ejemplo "link"/"hasDetail"/"gallery" en servicios, o un
     campo nuevo en "restaurant"). Nunca toca ni sobreescribe una clave que
     ya exista (aunque esté vacía) — solo agrega las que faltan por
     completo, así que ninguna personalización hecha desde el Panel Admin
     se pierde. Sin esto, un navegador que ya tenía datos guardados antes
     de una actualización del sitio se queda "atascado" sin ver las
     funciones nuevas hasta borrar el almacenamiento local. */
  function _reconcileWithDefaults(data) {
    let changed = false;

    Object.keys(DEFAULT_DATA.restaurant).forEach(k => {
      if (data.restaurant && !(k in data.restaurant)) {
        data.restaurant[k] = DEFAULT_DATA.restaurant[k];
        changed = true;
      }
    });

    ["services", "menu", "dailySpecials", "promotions", "categories"].forEach(collection => {
      if (!Array.isArray(data[collection])) return;
      const defaults = DEFAULT_DATA[collection] || [];
      data[collection].forEach(item => {
        const def = defaults.find(d => d.id === item.id);
        if (!def) return;
        Object.keys(def).forEach(k => {
          if (!(k in item)) {
            item[k] = Array.isArray(def[k]) ? def[k].slice() : def[k];
            changed = true;
          }
        });
      });
    });

    return changed;
  }

  function init() {
    let data = _load();
    if (!data) {
      data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      _save(data);
    } else if (_reconcileWithDefaults(data)) {
      _save(data);
    }
    return data;
  }

  function getAll() {
    return _load() || init();
  }

  function setAll(data) {
    _save(data);
  }

  function resetToDefaults() {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_DATA));
    _save(fresh);
    return fresh;
  }

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---------- helpers genéricos de colección ---------- */
  function upsertItem(collectionName, item) {
    const data = getAll();
    const list = data[collectionName];
    const idx = list.findIndex(x => x.id === item.id);
    if (idx >= 0) {
      // Fusiona en vez de reemplazar por completo: así un campo que no
      // viene en el formulario (por ejemplo "link" o "hasDetail", que no
      // son editables desde el Panel Admin) no se pierde al guardar.
      list[idx] = Object.assign({}, list[idx], item);
    } else {
      item.id = item.id || uid(collectionName.slice(0, 4));
      list.push(item);
    }
    setAll(data);
    return data;
  }

  function removeItem(collectionName, id) {
    const data = getAll();
    data[collectionName] = data[collectionName].filter(x => x.id !== id);
    setAll(data);
    return data;
  }

  function updateRestaurant(fields) {
    const data = getAll();
    data.restaurant = Object.assign({}, data.restaurant, fields);
    setAll(data);
    return data;
  }

  function updateDelivery(fields) {
    const data = getAll();
    data.delivery = Object.assign({}, data.delivery, fields);
    setAll(data);
    return data;
  }

  function upsertDeliveryTier(tier) {
    const data = getAll();
    const list = data.delivery.tiers;
    const idx = list.findIndex(x => x.id === tier.id);
    if (idx >= 0) list[idx] = tier;
    else { tier.id = tier.id || uid("zona"); list.push(tier); }
    setAll(data);
    return data;
  }

  function removeDeliveryTier(id) {
    const data = getAll();
    data.delivery.tiers = data.delivery.tiers.filter(x => x.id !== id);
    setAll(data);
    return data;
  }

  return {
    init,
    getAll,
    setAll,
    resetToDefaults,
    uid,
    upsertItem,
    removeItem,
    updateRestaurant,
    updateDelivery,
    upsertDeliveryTier,
    removeDeliveryTier
  };
})();
