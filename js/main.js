document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "FitTrack: aplicación iniciada correctamente."
        );


        // ========================================
        // MENÚ
        // ========================================

        const menuToggle =
            document.querySelector(
                "#menuToggle"
            );

        const mainNavigation =
            document.querySelector(
                "#mainNavigation"
            );


        if (
            menuToggle &&
            mainNavigation
        ) {

            menuToggle.addEventListener(
                "click",
                () => {

                    const isOpen =
                        mainNavigation.classList.toggle(
                            "open"
                        );

                    menuToggle.setAttribute(
                        "aria-expanded",
                        isOpen
                    );

                }
            );


            const navigationLinks =
                mainNavigation.querySelectorAll(
                    ".nav-link"
                );


            navigationLinks.forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        mainNavigation.classList.remove(
                            "open"
                        );

                        menuToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            });

        }


        // ========================================
        // SERVICE WORKER
        // ========================================

        registerServiceWorker();


        // ========================================
        // INSTALACIÓN PWA
        // ========================================

        setupInstallButton();

    }
);


// ============================================
// SERVICE WORKER
// ============================================

async function registerServiceWorker() {

    if (!("serviceWorker" in navigator)) {

        console.warn(
            "FitTrack: Service Workers no disponibles."
        );

        return;
    }


    try {

        const isPagesDirectory =
            window.location.pathname.includes(
                "/pages/"
            );


        const serviceWorkerPath =
            isPagesDirectory
                ? "../sw.js"
                : "./sw.js";


        const registration =
            await navigator.serviceWorker.register(
                serviceWorkerPath
            );


        console.log(
            "FitTrack PWA: Service Worker registrado:",
            registration.scope
        );


        registration.addEventListener(
            "updatefound",
            () => {

                console.log(
                    "FitTrack PWA: actualización encontrada."
                );

            }
        );


    } catch (error) {

        console.error(
            "FitTrack PWA: error al registrar Service Worker:",
            error
        );

    }

}


// ============================================
// INSTALACIÓN
// ============================================

function setupInstallButton() {

    const installButton =
        document.querySelector(
            "#installAppBtn"
        );

    const installMessage =
        document.querySelector(
            "#installMessage"
        );


    let deferredPrompt = null;


    const isStandalone =
        window.matchMedia(
            "(display-mode: standalone)"
        ).matches ||
        window.navigator.standalone === true;


    if (isStandalone) {

        if (installButton) {

            installButton.hidden = true;

        }

        if (installMessage) {

            installMessage.textContent =
                "FitTrack ya está instalada en este dispositivo. 💪";

        }

    }


    window.addEventListener(
        "beforeinstallprompt",
        event => {

            console.log(
                "FitTrack: instalación disponible."
            );


            event.preventDefault();

            deferredPrompt = event;


            if (installButton) {

                installButton.hidden = false;

            }


            if (installMessage) {

                installMessage.textContent =
                    "FitTrack está lista para instalar.";

            }

        }
    );


    if (installButton) {

        installButton.addEventListener(
            "click",
            async () => {

                if (!deferredPrompt) {

                    if (installMessage) {

                        installMessage.textContent =
                            "La instalación todavía no está disponible.";

                    }

                    return;

                }


                deferredPrompt.prompt();


                const result =
                    await deferredPrompt.userChoice;


                console.log(
                    "FitTrack instalación:",
                    result.outcome
                );


                if (
                    result.outcome ===
                    "accepted"
                ) {

                    if (installMessage) {

                        installMessage.textContent =
                            "¡FitTrack se está instalando! 💪";

                    }

                } else {

                    if (installMessage) {

                        installMessage.textContent =
                            "La instalación fue cancelada.";

                    }

                }


                deferredPrompt = null;

                installButton.hidden = true;

            }
        );

    }


    window.addEventListener(
        "appinstalled",
        () => {

            console.log(
                "FitTrack: aplicación instalada."
            );


            deferredPrompt = null;


            if (installButton) {

                installButton.hidden = true;

            }


            if (installMessage) {

                installMessage.textContent =
                    "¡FitTrack ya está instalada! 🎉";

            }

        }
    );

}