# FitTrack con Firebase

El historial se guarda en Cloud Firestore: `users/{uid}/workouts/{id}`.
Progreso y temporizador usan Firebase directamente. Los catálogos de ejercicios
y rutinas siguen siendo archivos JSON locales.

## Configuración necesaria

1. Crea o selecciona un proyecto en https://console.firebase.google.com.
2. En Configuración del proyecto > Tus apps, registra una aplicación web.
3. Copia los valores de `firebaseConfig` en `js/firebase-config.js`.
   Son identificadores públicos. No uses credenciales de cuentas de servicio.
4. En Authentication > Sign-in method, activa Anonymous (Anónimo).
5. En Firestore Database, crea la base de datos `(default)`.
6. En Rules de Firestore, pega `firestore.rules` y pulsa Publicar.
   Cada usuario solo tiene acceso a su historial.

## Ejecutar

Usa Live Server o `python -m http.server 8000` y abre http://localhost:8000.
También puedes alojar los archivos estáticos en HTTPS. No uses file://.
Ya no se requiere el servidor SQLite ni instalar paquetes JavaScript.

La sesión anónima se mantiene en el mismo navegador y origen. Los datos están
en la nube, pero otro dispositivo tendrá otro usuario. Borrar los datos del
navegador puede hacerte perder acceso a esa sesión. Para compartir el historial
entre dispositivos se necesita vincular la cuenta a Google o correo.

## Historial y conexión

El historial de localStorage se importa al consultar Progreso o guardar un
entrenamiento. Se elimina del navegador solo cuando Firebase confirma todos los
lotes. Reintentar conserva los IDs para no duplicar registros. La importación
requiere el mismo navegador y origen donde estaba el historial.
Los datos de SQLite anteriores no se importan automáticamente: conserva el
archivo de base de datos si ya registraste sesiones allí.

Consultar, guardar y borrar requiere Internet. Si falla el guardado, usa el botón
Reintentar mientras sigas en la pantalla. El borrado de historiales grandes se
hace por lotes: ante un fallo puede quedar parcial y se puede reintentar.

## Verificar

`node --test tests/app.test.cjs` comprueba estadísticas, logros, cálculo de
intervalos y los controles del temporizador con una base simulada. No escribe
en tu proyecto Firebase.

Inicio muestra estadísticas del historial; Calculadora planifica intervalos;
Logros muestra objetivos a partir de los entrenamientos guardados. El
temporizador permite elegir una rutina y divide su duración entre ejercicios.

Ejecuta `node --check js/database.js` y `node --check sw.js`.
Después de configurar Firebase, completa una rutina y verifica el documento en
Firestore. Recarga Progreso, comprueba los datos y prueba borrar el historial.
Sin la configuración del proyecto no se puede comprobar la conexión real ni
validar las reglas contra el servicio.

Documentación:
- https://firebase.google.com/docs/web/alt-setup
- https://firebase.google.com/docs/auth/web/anonymous-auth

## Publicar en GitHub e instalar

Repositorio: https://github.com/2311080654-bit/FitTrack

Después de subir los cambios, abre Settings > Pages del repositorio.
En Source selecciona Deploy from a branch, rama main, carpeta /(root) y Save.
Espera a que termine la publicación. La dirección prevista es:
https://2311080654-bit.github.io/FitTrack/

En Firebase > Authentication > Settings > Authorized domains añade
2311080654-bit.github.io (sin https ni rutas).

Para instalar, abre la dirección publicada en Chrome o Edge y pulsa Instalar
en FitTrack o en el menú del navegador. En iPhone/iPad usa Safari > Compartir >
Añadir a pantalla de inicio. Es una PWA, no un APK. Firebase necesita Internet.
La sesión anónima publicada será distinta de Live Server y no transfiere su historial.

Para descargar el código usa Code > Download ZIP en GitHub.
Guía oficial: https://docs.github.com/en/pages/quickstart

## Cuentas con correo y contraseña

Abre Mi cuenta en el menú para registrarte, iniciar sesión, recuperar contraseña
o cerrar sesión. En Firebase Console > Authentication > Sign-in method activa
Correo electrónico/contraseña. Mantén Anónimo activado para los invitados.

Crear una cuenta desde una sesión anónima vincula el correo al mismo UID y
conserva sus entrenamientos. Iniciar sesión en una cuenta existente muestra el
historial de esa cuenta; no combina el historial del invitado. No cierres una
sesión de invitado si quieres conservarla: primero usa Crear cuenta.
Las contraseñas las gestiona Firebase Authentication y no se guardan en Firestore.
Las reglas actuales ya aíslan el historial por UID y sirven para ambos tipos de cuenta.

Documentación: https://firebase.google.com/docs/auth/web/password-auth
