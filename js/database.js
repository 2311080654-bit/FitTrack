window.FitTrackDB = (() => {
    const authModuleURL = new URL("auth-client.js", document.currentScript.src).href;
    let connection;
    let migration;
    function connect() {
        if (!connection) connection = (async () => {
            const config = window.FITTRACK_FIREBASE_CONFIG;
            if (!config?.apiKey || !config?.projectId || !config?.appId)
                throw new Error("Completa js/firebase-config.js con los datos de tu proyecto Firebase. Consulta README.md.");
            const [authModule, sdk] = await Promise.all([
                import(authModuleURL),
                import("https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js")
            ]);
            const { app, auth, authSDK } = await authModule.getFirebase();
            if (!auth.currentUser) await authSDK.signInAnonymously(auth);
            const db = sdk.getFirestore(app);
            return { db, sdk, workouts: sdk.collection(db, "users", auth.currentUser.uid, "workouts") };
        })().catch(error => { connection = undefined; throw error; });
        return connection;
    }
    function validate(item) {
        const fields = ["id", "routineId", "routineName", "duration", "calories", "level", "date"];
        if (!item || fields.some(key => item[key] === undefined) ||
            !["string", "number"].includes(typeof item.id) ||
            !/^[a-zA-Z0-9_-]{1,100}$/.test(String(item.id)) ||
            !Number.isInteger(item.routineId) || !Number.isFinite(item.calories) || item.calories < 0 ||
            ["routineName", "duration", "level", "date"].some(key =>
                typeof item[key] !== "string" || !item[key].length || item[key].length > 200 || /[<>]/.test(item[key])) ||
            Number.isNaN(Date.parse(item.date))) throw new Error("Entrenamiento inválido. El historial anterior se conserva.");
        return Object.fromEntries(fields.map(key => [key, item[key]]));
    }
    function migrate(client) {
        if (!migration) migration = (async () => {
            const old = localStorage.getItem("fittrack_workouts");
            if (old === null) return;
            const items = JSON.parse(old);
            if (!Array.isArray(items)) throw new Error("El historial anterior no es válido; se ha conservado.");
            const validated = items.map(validate);
            for (let i = 0; i < validated.length; i += 400) {
                const batch = client.sdk.writeBatch(client.db);
                validated.slice(i, i + 400).forEach(item => batch.set(client.sdk.doc(client.workouts, String(item.id)), item));
                await batch.commit();
            }
            localStorage.removeItem("fittrack_workouts");
        })().catch(error => { migration = undefined; throw error; });
        return migration;
    }
    async function run(action) {
        try {
            if (!navigator.onLine) throw new Error("Necesitas Internet para acceder a Firebase.");
            const client = await connect();
            await migrate(client);
            return await action(client);
        } catch (error) {
            console.error("FitTrack Firebase:", error);
            if (error.code?.startsWith("auth/api-key-not-valid") || error.code === "auth/invalid-api-key") {
                throw new Error("La clave API de Firebase no es válida. Copia apiKey desde la configuración de tu app web en Firebase y actualiza js/firebase-config.js.");
            }
            if (error.code === "auth/operation-not-allowed" || error.code === "auth/admin-restricted-operation") {
                throw new Error("Activa el proveedor Anónimo en Firebase > Authentication > Método de acceso.");
            }
            if (error.code === "permission-denied") throw new Error("Publica las reglas de firestore.rules en tu proyecto Firebase.");
            if (error.code?.startsWith("auth/")) throw new Error("Revisa firebase-config.js y activa Authentication > Anonymous en Firebase.");
            throw new Error(error.code ? "No se pudo conectar con Firestore. Revisa Internet y la configuración de Firebase." : error.message);
        }
    }
    return {
        list: () => run(async ({ workouts, sdk }) => {
            const result = await sdk.getDocsFromServer(workouts);
            return result.docs.map(doc => validate(doc.data())).sort((a, b) => new Date(a.date) - new Date(b.date));
        }),
        save: workout => run(async ({ workouts, sdk }) => {
            const item = validate(workout);
            await sdk.setDoc(sdk.doc(workouts, String(item.id)), item);
        }),
        clear: () => run(async ({ db, workouts, sdk }) => {
            const result = await sdk.getDocsFromServer(workouts);
            for (let i = 0; i < result.docs.length; i += 400) {
                const batch = sdk.writeBatch(db);
                result.docs.slice(i, i + 400).forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            }
        })
    };
})();
