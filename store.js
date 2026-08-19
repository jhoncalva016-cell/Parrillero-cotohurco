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

  function init() {
    let data = _load();
    if (!data) {
      data = JSON.parse(JSON.stringify(DEFAULT_DATA));
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
      list[idx] = item;
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
