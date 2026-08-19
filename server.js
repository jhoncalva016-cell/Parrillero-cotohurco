/* ============================================================
   Parrillero El Cotohurco — Servidor estático mínimo
   ============================================================
   Este archivo existe solo para que Railway (que necesita un
   proceso corriendo, a diferencia de Netlify/Vercel) pueda
   servir el sitio. No usa dependencias externas: sirve los
   archivos estáticos del proyecto (HTML, CSS, JS, imágenes) tal
   cual están.
   ============================================================ */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  let filePath = path.join(ROOT, urlPath);

  // Evita salir de la carpeta del proyecto
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Si no existe el archivo, sirve una página 404 simple (o index.html como fallback)
      const notFoundPath = path.join(ROOT, "index.html");
      fs.readFile(notFoundPath, (e2, data) => {
        if (e2) {
          res.writeHead(404);
          res.end("Not found");
        } else {
          res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
          res.end(data);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });
}).listen(PORT, () => {
  console.log(`Parrillero El Cotohurco corriendo en el puerto ${PORT}`);
});
