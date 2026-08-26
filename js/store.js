/* ============================================================
   PARRILLERO EL COTHOURCO — Capa de almacenamiento (Store)
   ============================================================
   Fuente de datos: Firebase Firestore (base de datos real en la
   nube), en el documento site/main. Así, cuando algo se guarda
   desde el Panel Admin, cualquier celular o computadora que
   visite el sitio después ve el mismo contenido — no depende del
   navegador que hizo el cambio.

   Si Firebase todavía no está configurado (js/firebase-config.js
   sigue con los valores de ejemplo) o no hay conexión a internet,
   el sitio sigue funcionando: usa la última copia guardada en
   este navegador (localStorage) y, si no hay ninguna, los valores
   por defecto de este proyecto (js/data.js).
   ============================================================ */

const STORAGE_KEY = "cothourco_data_v1";

const Store = (function () {

  let _cache = null;

  /* Se puede asignar desde afuera (admin.js) para mostrar un aviso
     cuando un guardado no llegó a la nube, ej.:
       Store.onSyncError = (err) => toast("No se pudo guardar en la nube...");
     Y opcionalmente para avisar cuando SÍ se conecta bien:
       Store.onSyncOk = () => ... */
  let onSyncError = null;
  let onSyncOk = null;

  function _docRef() {
    return (typeof db !== "undefined" && db) ? db.collection("site").doc("main") : null;
  }

  function _loadLocalCache() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error("Error leyendo la copia local de los datos.", e);
      return null;
    }
  }

  function _saveLocalCache(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error guardando la copia local de los datos.", e);
    }
  }

  /* Rellena en los datos YA GUARDADOS cualquier campo nuevo que el
     código haya incorporado después de que se guardó esa copia (por
     ejemplo un campo nuevo en "restaurant"). Nunca toca ni sobreescribe
     una clave que ya exista (aunque esté vacía) — solo agrega las que
     faltan por completo, así ninguna personalización se pierde. */
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

  /* Carga inicial: intenta traer los datos reales desde Firestore.
     Devuelve una Promise — quien la llame debe usar await/.then(). */
  async function init() {
    const ref = _docRef();

    if (ref) {
      try {
        const snap = await ref.get();
        if (snap.exists) {
          _cache = snap.data();
          if (_reconcileWithDefaults(_cache)) {
            ref.set(_cache).catch(() => {});
          }
        } else {
          _cache = JSON.parse(JSON.stringify(DEFAULT_DATA));
          await ref.set(_cache);
        }
        _saveLocalCache(_cache);
        if (onSyncOk) onSyncOk();
        return _cache;
      } catch (e) {
        console.error("No se pudo conectar con la base de datos en la nube. Usando la última copia guardada en este navegador.", e);
        if (onSyncError) onSyncError(e);
        /* sigue abajo con el respaldo local */
      }
    }

    _cache = _loadLocalCache();
    if (!_cache) {
      _cache = JSON.parse(JSON.stringify(DEFAULT_DATA));
    } else {
      _reconcileWithDefaults(_cache);
    }
    return _cache;
  }

  /* Acceso síncrono a la última copia ya cargada en memoria (después de
     await Store.init()). El resto del código del sitio sigue usando
     Store.getAll() tal como antes. */
  function getAll() {
    return _cache || JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  /* Guarda: actualiza la copia en memoria y la copia local al instante
     (para que la pantalla no tenga que esperar), y en paralelo intenta
     guardar en la nube. Si la nube falla (sin internet, etc.) se avisa
     por onSyncError pero el cambio queda guardado localmente igual. */
  function _persist() {
    _saveLocalCache(_cache);
    const ref = _docRef();
    if (!ref) return;
    ref.set(_cache)
      .then(() => { if (onSyncOk) onSyncOk(); })
      .catch(err => {
        console.error("Error guardando en la nube:", err);
        if (onSyncError) onSyncError(err);
      });
  }

  function setAll(data) {
    _cache = data;
    _persist();
  }

  function resetToDefaults() {
    _cache = JSON.parse(JSON.stringify(DEFAULT_DATA));
    _persist();
    return _cache;
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
      list[idx] = Object.assign({}, list[idx], item);
    } else {
      item.id = item.id || uid(collectionName.slice(0, 4));
      list.push(item);
    }
    _persist();
    return data;
  }

  function removeItem(collectionName, id) {
    const data = getAll();
    data[collectionName] = data[collectionName].filter(x => x.id !== id);
    _persist();
    return data;
  }

  function updateRestaurant(fields) {
    const data = getAll();
    data.restaurant = Object.assign({}, data.restaurant, fields);
    _persist();
    return data;
  }

  function updateDelivery(fields) {
    const data = getAll();
    data.delivery = Object.assign({}, data.delivery, fields);
    _persist();
    return data;
  }

  function upsertDeliveryTier(tier) {
    const data = getAll();
    const list = data.delivery.tiers;
    const idx = list.findIndex(x => x.id === tier.id);
    if (idx >= 0) list[idx] = tier;
    else { tier.id = tier.id || uid("zona"); list.push(tier); }
    _persist();
    return data;
  }

  function removeDeliveryTier(id) {
    const data = getAll();
    data.delivery.tiers = data.delivery.tiers.filter(x => x.id !== id);
    _persist();
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
    removeDeliveryTier,
    get onSyncError() { return onSyncError; },
    set onSyncError(fn) { onSyncError = fn; },
    get onSyncOk() { return onSyncOk; },
    set onSyncOk(fn) { onSyncOk = fn; }
  };
})();
