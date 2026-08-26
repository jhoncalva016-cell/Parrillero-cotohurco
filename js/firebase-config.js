/* ============================================================
   PARRILLERO EL COTOHURCO — Conexión a Firebase (base de datos)
   ============================================================
   Este archivo conecta el sitio a una base de datos real en la
   nube (Firebase/Firestore), para que los cambios hechos desde
   el Panel Admin se vean automáticamente en CUALQUIER celular o
   computadora que visite el sitio — no solo en el navegador
   donde se editó.

   INSTRUCCIONES:
   Reemplaza los valores de aquí abajo por los que te da tu propio
   proyecto de Firebase (Configuración del proyecto → tus apps →
   ícono web </> → "Configuración del SDK"). Son datos públicos,
   no son contraseñas — están pensados para ir dentro del código
   de cualquier sitio web.
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyAIncmmMo68fmEUXU9eAzWdt7RZPNzs9q0",
  authDomain: "parrillero-cothourco-web.firebaseapp.com",
  projectId: "parrillero-cothourco-web",
  storageBucket: "parrillero-cothourco-web.firebasestorage.app",
  messagingSenderId: "252511773965",
  appId: "1:252511773965:web:d932ddb2c48a9d49d7fc44"
};

/* Correo "técnico" que identifica al Panel Admin dentro de Firebase
   Authentication — no hace falta que sea un correo real que revises,
   solo tiene que existir como usuario en Firebase (Authentication →
   Users → Add user) con la contraseña que quieras usar para entrar
   al panel. Esto es lo que permite que SOLO quien conozca esa
   contraseña pueda guardar cambios en la base de datos compartida. */
const ADMIN_EMAIL = "admin@cotohurco.local";

let db = null;
let auth = null;
try {
  if (firebaseConfig.apiKey.indexOf("REEMPLAZAR") === -1 && typeof firebase !== "undefined") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    if (firebase.auth) auth = firebase.auth();
  } else {
    console.warn(
      "Firebase todavía no está configurado (js/firebase-config.js). " +
      "El sitio sigue funcionando con datos guardados en este navegador únicamente."
    );
  }
} catch (e) {
  console.error("No se pudo inicializar Firebase:", e);
  db = null;
  auth = null;
}
