const CACHE_NAME = "fittrack-v2";


const FILES_TO_CACHE = [

    "./",

    "./index.html",

    "./manifest.json",

    /* CSS */
    "./css/style.css",
    "./css/responsive.css",
    "./css/animations.css",
    "./css/ejercicios.css",
    "./css/rutinas.css",
    "./css/temporizador.css",
    "./css/progreso.css",

    /* JavaScript */
    "./js/main.js",
    "./js/ejercicios.js",
    "./js/rutinas.js",
    "./js/temporizador.js",
    "./js/progreso.js",

    /* JSON */
    "./data/ejercicios.json",
    "./data/rutinas.json",

    /* Páginas */
    "./pages/ejercicios.html",
    "./pages/rutinas.html",
    "./pages/temporizador.html",
    "./pages/progreso.html",

    /* Iconos */
    "./img/icon-192.jpg",
    "./img/icon-512.jpg"


];


self.addEventListener(
    "install",
    event => {

        console.log(
            "FitTrack SW: instalando..."
        );


        event.waitUntil(

            caches
                .open(CACHE_NAME)

                .then(
                    cache =>
                        cache.addAll(
                            FILES_TO_CACHE
                        )
                )

                .then(
                    () => {

                        console.log(
                            "FitTrack SW: archivos almacenados."
                        );

                        return self.skipWaiting();

                    }
                )

                .catch(
                    error => {

                        console.error(
                            "FitTrack SW: error durante instalación:",
                            error
                        );

                    }
                )

        );

    }
);


self.addEventListener(
    "activate",
    event => {

        console.log(
            "FitTrack SW: activado."
        );


        event.waitUntil(

            caches
                .keys()

                .then(
                    cacheNames =>

                        Promise.all(

                            cacheNames.map(
                                cacheName => {

                                    if (
                                        cacheName !==
                                        CACHE_NAME
                                    ) {

                                        console.log(
                                            "FitTrack SW: eliminando caché:",
                                            cacheName
                                        );


                                        return caches.delete(
                                            cacheName
                                        );

                                    }

                                }
                            )

                        )

                )

                .then(
                    () =>
                        self.clients.claim()
                )

        );

    }
);


self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }


        event.respondWith(

            caches
                .match(event.request)

                .then(
                    cachedResponse => {

                        if (
                            cachedResponse
                        ) {

                            return cachedResponse;

                        }


                        return fetch(
                            event.request
                        )

                            .then(
                                networkResponse => {

                                    if (
                                        !networkResponse ||
                                        networkResponse.status !== 200
                                    ) {

                                        return networkResponse;

                                    }


                                    const responseClone =
                                        networkResponse.clone();


                                    caches
                                        .open(
                                            CACHE_NAME
                                        )

                                        .then(
                                            cache => {

                                                cache.put(
                                                    event.request,
                                                    responseClone
                                                );

                                            }
                                        );


                                    return networkResponse;

                                }
                            )

                            .catch(
                                () => {

                                    if (
                                        event.request.mode ===
                                        "navigate"
                                    ) {

                                        return caches.match(
                                            "./index.html"
                                        );

                                    }

                                }
                            );

                    }
                )

        );

    }
);