document.addEventListener(
    "DOMContentLoaded",
    () => {
        const navigation = document.querySelector("#mainNavigation");
        if (navigation) {
            const link = document.createElement("a");
            link.href = window.location.pathname.includes("/pages/") ? "./login.html" : "./pages/login.html";
            link.className = "nav-link";
            link.textContent = "Mi cuenta";
            navigation.appendChild(link);
        }

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
    let button = document.querySelector("#installAppBtn");
    let message = document.querySelector("#installMessage");
    if (!button) {
        button = document.createElement("button");
        button.id = "installAppBtn";
        button.type = "button";
        button.className = "btn btn-secondary";
        document.querySelector("#mainNavigation")?.appendChild(button);
    }
    if (!message) {
        message = document.createElement("p");
        message.id = "installMessage";
        message.className = "install-help";
        message.hidden = true;
        document.querySelector("header")?.after(message);
    }
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");
    button.hidden = false;
    button.textContent = "Descargar app";
    let prompt = null;
    const installed = () => {
        prompt = null;
        button.disabled = true;
        button.textContent = "App instalada";
        message.hidden = false;
        message.textContent = "FitTrack ya se abre como una app en este dispositivo.";
    };
    if (window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true) installed();
    window.addEventListener("beforeinstallprompt", event => {
        event.preventDefault();
        prompt = event;
        button.disabled = false;
        button.textContent = "Descargar app";
        message.hidden = false;
        message.textContent = "Pulsa Descargar app para instalar FitTrack en este dispositivo.";
    });
    button.addEventListener("click", async () => {
        message.hidden = false;
        if (!prompt) {
            const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
            if (!window.isSecureContext) {
                message.textContent = "Abre FitTrack desde su enlace HTTPS para instalarla.";
            } else if (ios) {
                message.textContent = "En Safari, pulsa Compartir y luego Agregar a inicio para instalar FitTrack.";
            } else {
                message.textContent = "Abre el men\u00fa de Chrome o Edge y busca Instalar FitTrack o Instalar esta p\u00e1gina como una aplicaci\u00f3n. Si no aparece, vuelve a cargar la p\u00e1gina. No se descarga un APK: se instala como app web.";
            }
            return;
        }
        const availablePrompt = prompt;
        prompt = null;
        button.disabled = true;
        try {
            await availablePrompt.prompt();
            const result = await availablePrompt.userChoice;
            message.textContent = result.outcome === "accepted" ? "Instalaci\u00f3n solicitada. Confirma los pasos del navegador." : "Cancelaste la instalaci\u00f3n. Puedes volver a intentarlo desde el men\u00fa del navegador.";
        } catch (error) {
            message.textContent = "No se pudo abrir la instalaci\u00f3n. Usa el men\u00fa de Chrome o Edge para instalar FitTrack.";
            console.error("FitTrack install:", error);
        } finally {
            if (button.textContent !== "App instalada") button.disabled = false;
        }
    });
    window.addEventListener("appinstalled", installed);
}
