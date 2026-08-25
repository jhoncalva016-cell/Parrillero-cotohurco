/* ============================================================
   PARRILLERO EL COTHOURCO — Datos por defecto del sitio
   ============================================================
   Este archivo define la información INICIAL del restaurante.
   Una vez que el sitio se abre en el navegador, todo lo que se
   edite desde el Panel Admin (/admin.html) se guarda en
   localStorage y tiene prioridad sobre estos valores por
   defecto. Este archivo solo sirve como "semilla" inicial y
   como respaldo para el botón "Restaurar valores de fábrica".

   NOTA IMPORTANTE:
   - Los platos y precios de la sección `menu` fueron
     proporcionados directamente por el cliente y son OFICIALES.
   - Los ítems de `dailySpecials` (humitas, quimbolitos, tamales,
     empanadas de verde) se incluyen como EJEMPLO de cómo
     funciona la disponibilidad diaria; su precio y stock deben
     confirmarse y actualizarse desde el Panel Admin antes de
     publicar el sitio.
   - `services` y la promoción de ejemplo en `promotions` son
     sugerencias editables, no información confirmada.
   ============================================================ */

const DEFAULT_DATA = {

  restaurant: {
    name: "Parrillero El Cotohurco",
    tagline: "¡Delicioso como en Casa!",
    description:
      "Especialistas en parrilladas, carnes a la brasa y comida típica ecuatoriana. Sabor de casa, con el toque ahumado de la parrilla.",
    address: "Yaruquí, San José, calle Eugenio Espejo y pasaje E2E",
    mapsUrl: "https://www.google.com/maps?q=-0.1633784,-78.3127286&z=17&hl=es",
    phone: "0998645322",
    phoneLandline: "02 2779953",
    whatsapp: "0998645322",
    email: "franciscocalva@hotmail.com",
    hoursWeekday: "Lun–Jue 07:00–19:30 · Vie–Sáb 07:00–22:00 · Dom 07:00–16:00",
    hoursNote: "Horario de atención",
    facebook: "https://www.facebook.com/Elcotohurco/",
    instagram: "",
    tiktok: "",
    feedbackUrl: "",
    reservationUrl: "",
    orderUrl: "",
    heroImage: "images/hero-bg.jpg",
    heroVideo: "",
    pageHeroImage_carta: "",
    pageHeroVideo_carta: "",
    pageHeroImage_desayunos: "",
    pageHeroVideo_desayunos: "",
    pageHeroImage_domicilios: "images/page-bg-promo.jpg",
    pageHeroVideo_domicilios: "",
    pageHeroImage_promociones: "",
    pageHeroVideo_promociones: "",
    pageHeroImage_servicios: "",
    pageHeroVideo_servicios: ""
  },

  /* -------------------- SERVICIOS DEL LOCAL -------------------- */
  services: [
    {
      id: "svc-1",
      icon: "🍽️",
      title: "Servicio en el local",
      desc: "Disfruta tu parrillada recién salida del carbón en nuestro salón, con atención directa de nuestro equipo."
    },
    {
      id: "svc-2",
      icon: "🥡",
      title: "Para llevar",
      desc: "Pide tu plato favorito para llevar. Se añade un cargo mínimo de empaque de $0.25.",
      link: "domicilios.html#empaque"
    },
    {
      id: "svc-3",
      icon: "🛵",
      title: "Servicio a domicilio",
      desc: "Entregamos tu pedido a domicilio. El costo varía según distancia y número de platos (desde $1.00).",
      link: "domicilios.html#calculadora"
    },
    {
      id: "svc-4",
      icon: "🅿️",
      iconImage: "images/icon-parking.png",
      title: "Parqueadero",
      desc: "Espacio disponible para que dejes tu vehículo mientras disfrutas de tu comida.",
      link: "servicios.html#svc-detail-svc-4",
      hasDetail: true,
      detailImage: ""
    },
    {
      id: "svc-5",
      icon: "🎉",
      title: "Reuniones y eventos",
      desc: "Espacio ideal para reuniones familiares, cumpleaños y encuentros con amigos.",
      link: "servicios.html#svc-detail-svc-5",
      hasDetail: true,
      gallery: []
    },
    {
      id: "svc-6",
      icon: "📶",
      iconImage: "images/icon-wifi.png",
      title: "WiFi gratis",
      desc: "Conéctate a la red <strong>CNT_ELCOTURCO-5G</strong> con la clave <strong>PARRILLERO2008</strong> y disfruta conectado.",
      qrImage: "images/wifi-qr.png",
      qrCaption: "Escanéalo con la cámara de tu celular y te conectas al toque, sin escribir nada.",
      directLinkUrl: "WIFI:T:WPA;S:CNT_ELCOTURCO-5G;P:PARRILLERO2008;;",
      directLinkLabel: "📶 Intentar conectar directo",
      directLinkNote: "Funciona en algunos celulares Android. Si no pasa nada al tocarlo, usa el código QR de arriba (ese sí funciona en todos)."
    }
  ],

  /* -------------------- CATEGORÍAS DE LA CARTA -------------------- */
  categories: [
    { id: "parrilladas", name: "Parrilladas" },
    { id: "churrascos", name: "Churrascos" },
    { id: "menestras", name: "Menestras" },
    { id: "asados", name: "Asados" },
    { id: "mariscos", name: "Mariscos" },
    { id: "especialidades", name: "Especialidades de la Casa" }
  ],

  /* -------------------- LA CARTA (platos oficiales) -------------------- */
  menu: [
    {
      id: "menu-1",
      category: "parrilladas",
      name: "Parrillada Mini",
      description:
        "Selección mini de carnes a la parrilla, ideal para una persona. Acompañada de guarniciones de la casa.",
      priceLocal: 6.50,
      image: "",
      active: true,
      featured: true
    },
    {
      id: "menu-2",
      category: "parrilladas",
      name: "Parrillada Completa",
      description:
        "Generosa combinación de carnes a la parrilla para compartir o para el comensal con mucha hambre. Acompañada de guarniciones de la casa.",
      priceLocal: 10.00,
      image: "",
      active: true,
      featured: true
    },
    {
      id: "menu-3",
      category: "parrilladas",
      name: "Parrillada Mar y Tierra",
      description:
        "Nuestra especialidad más completa: combinación de carnes a la parrilla y mariscos en un solo plato. Ideal para compartir.",
      priceLocal: 20.00,
      image: "",
      active: true,
      featured: true
    },
    {
      id: "menu-4",
      category: "churrascos",
      name: "Churrasco",
      description:
        "Jugoso churrasco a la parrilla, servido con guarniciones de la casa.",
      priceLocal: 5.00,
      image: "",
      active: true,
      featured: false
    },
    {
      id: "menu-5",
      category: "menestras",
      name: "Menestra de Res",
      description: "Menestra tradicional acompañada de carne de res.",
      priceLocal: 3.50,
      image: "",
      active: true,
      featured: false
    },
    {
      id: "menu-6",
      category: "menestras",
      name: "Menestra de Pollo",
      description: "Menestra tradicional acompañada de pollo.",
      priceLocal: 3.50,
      image: "",
      active: true,
      featured: false
    },
    {
      id: "menu-7",
      category: "menestras",
      name: "Menestra de Cerdo",
      description: "Menestra tradicional acompañada de carne de cerdo.",
      priceLocal: 3.75,
      image: "",
      active: true,
      featured: false
    },
    {
      id: "menu-8",
      category: "asados",
      name: "Asado de Res",
      description: "Asado de res a la parrilla con guarniciones de la casa.",
      priceLocal: 3.50,
      image: "",
      active: true,
      featured: false
    },
    {
      id: "menu-9",
      category: "asados",
      name: "Asado de Cerdo",
      description: "Asado de cerdo a la parrilla con guarniciones de la casa.",
      priceLocal: 3.75,
      image: "",
      active: true,
      featured: false
    },
    {
      id: "menu-10",
      category: "mariscos",
      name: "Camarones Apanados",
      description: "Camarones apanados, crocantes por fuera y jugosos por dentro.",
      priceLocal: 5.00,
      image: "",
      active: true,
      featured: false
    }
  ],

  /* -------- DESAYUNOS, ALMUERZOS Y APERITIVOS ESPECIALES -------- */
  /* Disponibilidad en unidades — pensado para actualizarse a diario */
  dailySpecials: [
    {
      id: "dia-5",
      subcategory: "desayuno",
      name: "Desayuno Típico",
      description: "Desayuno del día: bolón o tortilla, huevo, café o jugo. Confirma precio y stock del día.",
      price: 0,
      stock: 0,
      unit: "porción",
      image: "",
      active: false,
      updatedAt: ""
    },
    {
      id: "dia-6",
      subcategory: "almuerzo",
      name: "Almuerzo del Día",
      description: "Menú ejecutivo: sopa, segundo a elección y jugo natural. Confirma precio y stock del día.",
      price: 0,
      stock: 0,
      unit: "porción",
      image: "",
      active: false,
      updatedAt: ""
    },
    {
      id: "dia-1",
      subcategory: "aperitivos",
      name: "Humitas",
      description: "Humitas de choco tierno, envueltas y cocidas a la manera tradicional. Confirma precio y stock del día.",
      price: 0,
      stock: 0,
      unit: "unidad",
      image: "",
      active: false,
      updatedAt: ""
    },
    {
      id: "dia-2",
      subcategory: "aperitivos",
      name: "Quimbolitos",
      description: "Quimbolitos dulces envueltos en hoja de achira. Confirma precio y stock del día.",
      price: 0,
      stock: 0,
      unit: "unidad",
      image: "",
      active: false,
      updatedAt: ""
    },
    {
      id: "dia-3",
      subcategory: "aperitivos",
      name: "Tamales",
      description: "Tamales tradicionales envueltos en hoja de achira. Confirma precio y stock del día.",
      price: 0,
      stock: 0,
      unit: "unidad",
      image: "",
      active: false,
      updatedAt: ""
    },
    {
      id: "dia-4",
      subcategory: "aperitivos",
      name: "Empanadas de Verde",
      description: "Empanadas de verde rellenas, fritas al momento. Confirma precio y stock del día.",
      price: 0,
      stock: 0,
      unit: "unidad",
      image: "",
      active: false,
      updatedAt: ""
    }
  ],

  /* -------------------- PROMOCIONES Y TEMPORADA -------------------- */
  promotions: [
    {
      id: "promo-1",
      title: "Ejemplo: 2x1 en Churrascos los martes",
      description: "Esta es una promoción de EJEMPLO. Edítala o desactívala desde el Panel Admin antes de publicar el sitio.",
      badge: "Ejemplo",
      price: "",
      startDate: "",
      endDate: "",
      image: "",
      active: false
    }
  ],

  /* -------------------- REGLAS DE ENTREGA -------------------- */
  delivery: {
    packagingFee: 0.25,
    packagingNote: "Cargo adicional por empaque en pedidos para llevar.",
    minOrderDishes: 1,
    maxOrderDishesNote: "Pedido mínimo de 1 a 3 platos (pueden ser del mismo plato o combinados).",
    minFee: 1.00,
    tiersNote: "La tarifa de domicilio varía según la distancia y el número/volumen de platos pedidos. Valores de referencia, edítalos según tu zona de reparto.",
    tiers: [
      { id: "zona-1", label: "Zona 1 (cercana)", distanceNote: "0 - 2 km aprox.", fee: 1.00 },
      { id: "zona-2", label: "Zona 2", distanceNote: "2 - 4 km aprox.", fee: 1.50 },
      { id: "zona-3", label: "Zona 3", distanceNote: "4 - 6 km aprox.", fee: 2.00 },
      { id: "zona-4", label: "Zona 4 (lejana)", distanceNote: "Más de 6 km", fee: 0, feeLabel: "Consultar" }
    ]
  }
};

/* No modificar debajo de esta línea */
if (typeof module !== "undefined" && module.exports) {
  module.exports = DEFAULT_DATA;
}
