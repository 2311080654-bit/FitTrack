document.addEventListener("DOMContentLoaded", async () => {
    const get = id => document.getElementById(id);
    const status = get("authStatus");
    const form = get("authForm");
    const email = get("email");
    const password = get("password");
    const confirmation = get("confirmPassword");
    const buttons = document.querySelectorAll(".account-page button");
    let registering = false;
    let busy = false;
    let client;
    const messages = {
        "auth/email-already-in-use": "Ese correo ya tiene una cuenta. Usa Iniciar sesión.",
        "auth/credential-already-in-use": "Ese correo ya tiene una cuenta. Usa Iniciar sesión.",
        "auth/invalid-credential": "Correo o contraseña incorrectos.",
        "auth/wrong-password": "Correo o contraseña incorrectos.",
        "auth/user-not-found": "Correo o contraseña incorrectos.",
        "auth/invalid-email": "Introduce un correo válido.",
        "auth/weak-password": "Usa una contraseña de al menos 6 caracteres que cumpla la política del proyecto.",
        "auth/password-does-not-meet-requirements": "La contraseña no cumple la política de seguridad del proyecto.",
        "auth/operation-not-allowed": "Activa Correo electrónico/contraseña en Firebase > Authentication > Método de acceso.",
        "auth/too-many-requests": "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.",
        "auth/network-request-failed": "Comprueba tu conexión a Internet.",
        "auth/user-disabled": "Esta cuenta está deshabilitada."
    };
    async function perform(action) {
        if (busy || !client) return;
        busy = true;
        buttons.forEach(button => { button.disabled = true; });
        status.textContent = "Procesando…";
        try { await action(); }
        catch (error) {
            console.error("FitTrack cuenta:", error);
            status.textContent = messages[error.code] || "No se pudo completar la operación. Comprueba Internet y la configuración de Firebase.";
        } finally {
            busy = false;
            buttons.forEach(button => { button.disabled = false; });
        }
    }
    function mode(register) {
        registering = register;
        get("accountTitle").textContent = register ? "Crear cuenta" : "Iniciar sesión";
        get("confirmLabel").hidden = !register;
        confirmation.disabled = !register;
        confirmation.required = register;
        confirmation.value = "";
        password.autocomplete = register ? "new-password" : "current-password";
        get("authSubmit").textContent = register ? "Crear cuenta y conservar progreso" : "Entrar";
        get("loginMode").setAttribute("aria-pressed", String(!register));
        get("registerMode").setAttribute("aria-pressed", String(register));
        status.textContent = register ? "Usa un correo propio y una contraseña de al menos 6 caracteres." : "Introduce tus datos para entrar.";
    }
    get("loginMode").onclick = () => mode(false);
    get("registerMode").onclick = () => mode(true);
    form.addEventListener("submit", event => {
        event.preventDefault();
        if (!client || !form.reportValidity()) return;
        if (registering && password.value !== confirmation.value) {
            status.textContent = "Las contraseñas no coinciden.";
            return;
        }
        perform(async () => {
            const { auth, authSDK } = client;
            if (registering && auth.currentUser?.isAnonymous) {
                await authSDK.linkWithCredential(auth.currentUser, authSDK.EmailAuthProvider.credential(email.value.trim(), password.value));
            } else if (registering) {
                await authSDK.createUserWithEmailAndPassword(auth, email.value.trim(), password.value);
            } else {
                await authSDK.signInWithEmailAndPassword(auth, email.value.trim(), password.value);
            }
            form.reset();
            location.href = "./progreso.html";
        });
    });
    get("resetPassword").onclick = () => {
        if (!email.reportValidity()) return;
        perform(async () => {
            await client.authSDK.sendPasswordResetEmail(client.auth, email.value.trim());
            status.textContent = "Si existe una cuenta con ese correo, recibirás instrucciones para restablecer la contraseña. Revisa también spam.";
        });
    };
    get("logoutButton").onclick = () => perform(async () => {
        await client.authSDK.signOut(client.auth);
        form.reset();
        mode(false);
        status.textContent = "Has cerrado sesión. Puedes entrar con otra cuenta o seguir como invitado.";
    });
    try {
        const module = await import("./auth-client.js");
        client = await module.getFirebase();
        client.authSDK.onAuthStateChanged(client.auth, user => {
            const signedIn = Boolean(user && !user.isAnonymous);
            get("accountDetails").hidden = !signedIn;
            get("authPanel").hidden = signedIn;
            get("accountEmail").textContent = signedIn ? user.email : "";
            get("accountTitle").textContent = signedIn ? "Mi cuenta" : "Iniciar sesión";
            status.textContent = signedIn ? "Sesión iniciada." : "Inicia sesión o crea una cuenta para conservar el acceso a tu historial.";
        });
    } catch (error) {
        console.error("FitTrack cuenta:", error);
        status.textContent = "No se pudo cargar Firebase. Comprueba Internet y recarga la página.";
    }
});
