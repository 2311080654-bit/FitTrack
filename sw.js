const CACHE_NAME = "fittrack-v11";
const FILES_TO_CACHE = [
    "./js/media.js",
    "./css/media.css",
    "./img/exercises/1-0.jpg",
    "./img/exercises/1-1.jpg",
    "./img/exercises/2-0.jpg",
    "./img/exercises/2-1.jpg",
    "./img/exercises/3-0.jpg",
    "./img/exercises/3-1.jpg",
    "./img/exercises/4-0.jpg",
    "./img/exercises/4-1.jpg",
    "./img/exercises/5-0.jpg",
    "./img/exercises/5-1.jpg",
    "./img/exercises/6-0.jpg",
    "./img/exercises/6-1.jpg",
    "./img/exercises/7-0.jpg",
    "./img/exercises/7-1.jpg",
    "./img/exercises/8-0.jpg",
    "./img/exercises/8-1.jpg",
    "./img/exercises/9-0.jpg",
    "./img/exercises/9-1.jpg",
    "./img/exercises/10-0.jpg",
    "./img/exercises/10-1.jpg",

    "./pages/login.html",
    "./js/login.js",
    "./js/auth-client.js",
    "./img/pwa-192.png",
    "./img/pwa-512.png",
    "./pages/calculadora.html",
    "./pages/logros.html",
    "./js/calculadora.js",
    "./js/logros.js",
    "./js/home.js",
    "./js/stats.js",
    "./css/tools.css",
    "./js/database.js",
    "./js/firebase-config.js",

    "./", // Directorio raíz de la aplicación

    "./index.html", // Página principal (Home)

    "./manifest.json", // Archivo de configuración PWA (iconos, tema, nombre)

    /* CSS */
    "./css/style.css", // Estilos globales de la aplicación
    "./css/responsive.css", // Reglas de adaptación para distintas pantallas (Media Queries)
    "./css/animations.css", // Definición de animaciones y transiciones CSS
    "./css/ejercicios.css", // Estilos específicos para el catálogo de ejercicios
    "./css/rutinas.css", // Estilos para la gestión y vista de rutinas
    "./css/temporizador.css", // Estilos específicos para la interfaz del temporizador
    "./css/progreso.css", // Estilos para gráficos y métricas de seguimiento de progreso

    /* JavaScript */
    "./js/main.js", // Lógica principal y registro de controladores
    "./js/ejercicios.js", // Módulo de lógica para gestionar ejercicios
    "./js/rutinas.js", // Módulo para crear, editar y listar rutinas
    "./js/temporizador.js", // Módulo con la lógica del contador/cronómetro
    "./js/progreso.js", // Módulo para calcular y desplegar el progreso del usuario

    /* JSON */
    "./data/ejercicios.json", // Base de datos local en JSON con la lista de ejercicios
    "./data/rutinas.json", // Base de datos local con las rutinas predefinidas

    /* Páginas */
    "./pages/ejercicios.html", // Vista secundaria para explorar ejercicios
    "./pages/rutinas.html", // Vista secundaria para administrar rutinas
    "./pages/temporizador.html", // Vista secundaria para la pantalla del temporizador
    "./pages/progreso.html", // Vista secundaria para la pantalla de avances y estadísticas

    /* Iconos */
    "./img/icon-192.jpg", // Icono de la PWA resolución 192x192px
    "./img/icon-512.jpg" // Icono de la PWA resolución 512x512px

];

self.addEventListener("install", event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(FILES_TO_CACHE);
        await self.skipWaiting();
    })());
});

self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(names.filter(name => name.startsWith("fittrack-") && name !== CACHE_NAME).map(name => caches.delete(name)));
        await self.clients.claim();
    })());
});

self.addEventListener("fetch", event => {
    const url = new URL(event.request.url);
    if (event.request.method !== "GET" || url.origin !== self.location.origin ||
        ["localhost", "127.0.0.1"].includes(self.location.hostname)) return;
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
            const response = await fetch(event.request, { cache: "no-cache" });
            if (response.ok) await cache.put(event.request, response.clone());
            return response;
        } catch (error) {
            const cached = await cache.match(event.request);
            if (cached) return cached;
            if (event.request.mode === "navigate") {
                return new Response("Sin conexi\u00f3n. Abre una p\u00e1gina que ya hayas visitado o vuelve a intentarlo con Internet.", {
                    status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" }
                });
            }
            return Response.error();
        }
    })());
});
