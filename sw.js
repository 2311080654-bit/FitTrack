// Nombre de la versión actual del almacén de caché (útil para actualizar assets)
const CACHE_NAME = "fittrack-v10";

// Lista de URLs y recursos locales que se precargarán para su uso offline
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

// Escucha del evento de instalación del Service Worker en el navegador
self.addEventListener(
    "install", // Nombre del evento de ciclo de vida
    event => { // Función callback que recibe el objeto evento

        console.log( // Muestra en consola que se ha iniciado la fase de instalación
            "FitTrack SW: instalando..." // Mensaje informativo
        ); // Fin del console.log


        event.waitUntil( // Pone el Service Worker en espera hasta que se resuelva la promesa

            caches // Interfaz global CacheStorage para administrar los cachés
                .open(CACHE_NAME) // Abre o crea la caché especificada en CACHE_NAME

                .then( // Callback para ejecutar cuando se abre con éxito la caché
                    cache => // Instancia de la caché abierta
                        cache.addAll( // Agrega todos los archivos listados a la caché de un solo paso
                            FILES_TO_CACHE // Arreglo de rutas a descargar e almacenar
                        ) // Fin de cache.addAll
                ) // Fin del primer .then

                .then( // Callback al finalizar la descarga e inserción en caché
                    () => { // Función flecha sin argumentos

                        console.log( // Registra la confirmación de la descarga
                            "FitTrack SW: archivos almacenados." // Mensaje de éxito
                        ); // Fin del console.log


                        return self.skipWaiting(); // Fuerza al Service Worker recién instalado a tomar el control de inmediato

                    } // Fin de la función del callback
                ) // Fin del segundo .then

                .catch( // Captura cualquier error ocurrido durante el proceso de instalación/caché
                    error => { // Recibe el objeto de error generado

                        console.error( // Muestra el mensaje de error en el inspector de desarrollo
                            "FitTrack SW: error durante instalación:", // Mensaje explicativo
                            error // Objeto detallado del error
                        ); // Fin del console.error

                    } // Fin de la función de captura de error
                ) // Fin del .catch

        ); // Fin de event.waitUntil

    } // Fin de la función manejadora del evento 'install'
); // Fin del listener de instalación


// Escucha del evento de activación del Service Worker (limpieza de versiones previas)
self.addEventListener(
    "activate", // Nombre del evento de activación
    event => { // Callback que se ejecuta cuando el SW pasa a estado activo

        console.log( // Registra en consola el paso al estado activo
            "FitTrack SW: activado." // Mensaje informativo
        ); // Fin del console.log


        event.waitUntil( // Extiende la fase de activación hasta completar las promesas internas

            caches // Referencia al objeto global de cachés
                .keys() // Devuelve una promesa con los nombres de todas las cachés existentes

                .then( // Promesa resuelta con la lista de nombres de caché
                    cacheNames => // Arreglo de cadenas con las claves de caché

                        Promise.all( // Ejecuta un conjunto de promesas de forma paralela

                            cacheNames.map( // Itera sobre cada nombre de caché para filtrado y borrado
                                cacheName => { // Recibe el nombre de la caché actual en el bucle

                                    if ( // Evalúa si la caché iterada no coincide con la versión actual
                                        cacheName !== // Operador de desigualdad estricta
                                        CACHE_NAME // Clave de la versión de caché activa
                                    ) { // Si es una caché antigua:

                                        console.log( // Registra la depuración de una caché desactualizada
                                            "FitTrack SW: eliminando caché:", // Mensaje de aviso
                                            cacheName // Nombre del almacén a eliminar
                                        ); // Fin del console.log


                                        return caches.delete( // Elimina la caché obsoleta y retorna una promesa
                                            cacheName // Clave del almacén a borrar
                                        ); // Fin de caches.delete

                                    } // Fin del condicional if

                                } // Fin de la función de mapeo
                            ) // Fin del array map

                        ) // Fin del Promise.all

                ) // Fin del primer .then de activación

                .then( // Ejecución consecutiva tras borrar las cachés obsoletas
                    () => // Función flecha vacía
                        self.clients.claim() // Fuerza a los clientes (pestañas abiertas) a usar este nuevo SW
                ) // Fin del segundo .then

        ); // Fin de event.waitUntil de activación

    } // Fin de la función manejadora del evento 'activate'
); // Fin del listener de activación


// Escucha de peticiones de red (interceptación de solicitudes Fetch)
self.addEventListener(
    "fetch", // Nombre del evento invocado al solicitar cualquier recurso
    event => { // Callback con la información de la solicitud realizada
        if (new URL(event.request.url).origin !== self.location.origin) return;
        // En desarrollo, Live Server debe mostrar siempre los archivos actuales.
        if (["localhost", "127.0.0.1"].includes(self.location.hostname)) return;


        if ( // Filtra el método HTTP de la petición
            event.request.method !== // Compara si el método no es GET
            "GET" // Tipo de método HTTP para obtener datos
        ) { // Si es POST, PUT, DELETE, etc.:

            return; // Omite el manejo de caché y permite que la petición vaya directo a la red

        } // Fin del condicional if


        event.respondWith( // Intercepta la respuesta predeterminada y entrega una personalizada

            caches // Accede al almacenamiento de caché
                .match(event.request) // Busca si la solicitud coincide con alguna respuesta en caché

                .then( // Promesa con la respuesta encontrada (o undefined)
                    cachedResponse => { // Recibe la respuesta encontrada en la caché

                        if ( // Comprueba si el recurso existía en el almacenamiento
                            cachedResponse // Si no es undefined/null
                        ) { // Si el archivo está cacheado:

                            return cachedResponse; // Devuelve directamente la copia en caché (soporte offline)

                        } // Fin del condicional si hay caché


                        return fetch( // Si no estaba en caché, realiza la petición real a la red
                            event.request // Solicitud original enviada por el navegador
                        ) // Fin del fetch

                            .then( // Manejo de la respuesta obtenida desde la red
                                networkResponse => { // Objeto con la respuesta HTTP del servidor

                                    if ( // Valida la calidad y estado de la respuesta de red
                                        !networkResponse || // Si la respuesta es nula/falsa
                                        networkResponse.status !== 200 // O si el código HTTP no es un 200 OK
                                    ) { // Si la respuesta no es válida o falló:

                                        return networkResponse; // Devuelve la respuesta sin intentar guardarla en caché

                                    } // Fin de la validación de respuesta


                                    const responseClone = // Declara variable para clonar la respuesta
                                        networkResponse.clone(); // Clona la respuesta (los streams de response solo se leen una vez)


                                    caches // Accede a la API de caché
                                        .open( // Abre la caché activa
                                            CACHE_NAME // Nombre de la caché
                                        ) // Fin del open

                                        .then( // Callback para guardar el recurso clonado
                                            cache => { // Recibe la instancia de la caché abierta

                                                cache.put( // Almacena dinámicamente el par solicitud/respuesta
                                                    event.request, // Clave: la petición
                                                    responseClone // Valor: el clon de la respuesta
                                                ); // Fin de cache.put

                                            } // Fin de la función de guardado
                                        ); // Fin del .then interno


                                    return networkResponse; // Retorna la respuesta original recibida de la red al navegador

                                } // Fin del callback networkResponse
                            ) // Fin del .then de fetch

                            .catch( // Captura errores de red (ej. sin conexión a internet)
                                () => { // Callback sin argumentos explícitos

                                    if ( // Evalúa si la petición corresponde a una navegación entre páginas
                                        event.request.mode === // Modo de la solicitud
                                        "navigate" // Solicitud de tipo documento/HTML
                                    ) { // Si el usuario intenta navegar offline:

                                        return caches.match( // Sirve la página principal como respaldo (Fallback)
                                            "./index.html" // Ruta de la vista principal
                                        ); // Fin del caches.match de fallback

                                    } // Fin del condicional de navegación

                                } // Fin del callback de error de red
                            ); // Fin del .catch de fetch

                    } // Fin del callback de la respuesta cacheada
                ) // Fin del .then del match inicial

        ); // Fin de event.respondWith

    } // Fin de la función del evento 'fetch'
); // Fin del listener de 'fetch'
