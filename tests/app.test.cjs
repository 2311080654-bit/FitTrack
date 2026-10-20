const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function environment() {
    const elements = new Map();
    function element() {
        return {
            textContent: '', value: '', hidden: false, disabled: false, style: {}, dataset: {}, children: [], listeners: {},
            get innerHTML() { return this.markup || ''; },
            set innerHTML(value) { this.markup = value; this.children = []; },
            classList: { add() {}, remove() {} },
            addEventListener(name, fn) { this.listeners[name] = fn; },
            appendChild(child) { this.children.push(child); },
            append(...children) { this.children.push(...children); },
            replaceChildren(...children) { this.children = children; },
            after() {}, setAttribute() {}, scrollIntoView() {}, remove() {},
            querySelector() { return this.message ||= element(); },
            reportValidity() { return true; }
        };
    }
    const get = selector => {
        if (!elements.has(selector)) elements.set(selector, element());
        return elements.get(selector);
    };
    const context = {
        console: { log() {}, error() {} }, URLSearchParams, Date,
        document: { querySelector: get, querySelectorAll: () => [], getElementById: id => get('#' + id), createElement: element,
            addEventListener: (_, fn) => { context.ready = fn; } },
        location: { search: '', href: '' },
        setInterval: fn => { context.tick = fn; return 1; }, clearInterval() {}, setTimeout() {}, clearTimeout() {},
        fetch: async url => ({ ok: true, json: async () => JSON.parse(fs.readFileSync(path.join(__dirname, '..', url.replace('../', '')), 'utf8')) }),
        FitTrackDB: { save: async item => { context.saved.push(item); } }, saved: []
    };
    context.window = context;
    vm.createContext(context);
    return { context, get, load: file => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf8'), context) };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('estadísticas, racha y logros usan el historial', () => {
    const { context, load } = environment();
    load('stats.js');
    assert.equal(context.FitTrackStats.calculate([]).count, 0);
    const items = [20, 19, 18].map((day, i) => ({ date: new Date(2026, 9, day, 12).toISOString(), duration: '30 min', calories: 250, routineId: i }));
    const stats = context.FitTrackStats.calculate(items, new Date(2026, 9, 20, 18));
    assert.equal(stats.streak, 3);
    assert.equal(stats.minutes, 90);
    assert.equal(stats.calories, 750);
    assert.equal(context.FitTrackStats.achievements(stats).filter(item => item.unlocked).length, 4);
    assert.equal(context.FitTrackStats.calculate(items, new Date(2026, 9, 23)).streak, 0);
});

test('calculadora incluye descansos y permite restablecer', () => {
    const { context, get, load } = environment();
    load('calculadora.js'); context.ready();
    for (const [key, value] of Object.entries({ exerciseCount: '5', roundCount: '3', workSeconds: '30', restSeconds: '15' })) get('#' + key).value = value;
    get('#intervalForm').listeners.submit({ preventDefault() {} });
    assert.match(get('#calculationResult').textContent, /11 min 0 s/);
    get('#intervalForm').listeners.reset();
    assert.equal(get('#calculationResult').hidden, true);
});

test('temporizador abre sin ID, pausa, reinicia y guarda una sola sesión', async () => {
    const { context, get, load } = environment();
    load('temporizador.js'); context.ready(); await flush();
    assert.equal(get('#routineName').textContent, 'Full Body Principiante');
    assert.equal(get('#timerDisplay').textContent, '06:00');
    get('#startTimer').listeners.click();
    assert.equal(get('#startTimer').disabled, true);
    get('#pauseTimer').listeners.click();
    assert.equal(get('#startTimer').disabled, false);
    get('#resetTimer').listeners.click();
    assert.equal(get('#timerDisplay').textContent, '06:00');
    for (let i = 0; i < 8; i++) get('#nextExercise').listeners.click();
    await flush();
    assert.equal(context.saved.length, 1);
    assert.equal(get('#workoutComplete').hidden, false);
    assert.equal(get('#startTimer').disabled, true);
    assert.equal(get('#resetTimer').disabled, true);
});

test('temporizador rechaza una rutina inexistente', async () => {
    const { context, get, load } = environment();
    context.location.search = '?routine=999999';
    load('temporizador.js'); context.ready(); await flush();
    assert.equal(get('#startTimer').disabled, true);
    assert.equal(context.saved.length, 0);
});

test('progreso muestra estado vacío cuando Firebase no tiene entrenamientos', async () => {
    const { context, get, load } = environment();
    context.FitTrackDB.list = async () => [];
    load('progreso.js'); context.ready(); await flush();
    assert.equal(get('#totalWorkouts').textContent, '0');
    assert.equal(get('#emptyProgress').hidden, false);
    assert.equal(get('#weeklyChart').children.length, 7);
    assert.match(get('#lastWorkout').innerHTML, /Sin entrenamientos/);
});

test('progreso muestra el historial guardado', async () => {
    const { context, get, load } = environment();
    context.FitTrackDB.list = async () => [{ id: 1, routineId: 1, routineName: 'Rutina de prueba', duration: '30 min', calories: 250, level: 'Principiante', date: new Date().toISOString() }];
    load('progreso.js'); context.ready(); await flush();
    assert.equal(get('#totalWorkouts').textContent, 1);
    assert.equal(get('#totalMinutes').textContent, 30);
    assert.equal(get('#emptyProgress').hidden, true);
    assert.match(get('#lastWorkout').innerHTML, /Rutina de prueba/);
});

test('progreso distingue fallo de Firebase de un historial vacío', async () => {
    const { context, get, load } = environment();
    context.FitTrackDB.list = async () => { throw new Error('Sin acceso a Firebase'); };
    load('progreso.js'); context.ready(); await flush();
    assert.equal(get('#totalWorkouts').textContent, '—');
    assert.equal(get('#emptyProgress').hidden, true);
    assert.match(get('#lastWorkout').textContent, /No se pudo consultar/);
    assert.equal(get('#clearHistory').disabled, true);
});

function loginEnvironment() {
    const env = environment();
    const { context, get } = env;
    const calls = [];
    const auth = { currentUser: { uid: 'guest-123', isAnonymous: true } };
    const authSDK = {
        onAuthStateChanged: (_, fn) => fn(auth.currentUser),
        EmailAuthProvider: { credential: (email, password) => ({ email, password }) },
        linkWithCredential: async (user, credential) => calls.push(['link', user.uid, credential.email]),
        signInWithEmailAndPassword: async (_, email) => calls.push(['login', email]),
        sendPasswordResetEmail: async (_, email) => calls.push(['reset', email])
    };
    context.fakeAuthModule = { getFirebase: async () => ({ auth, authSDK }) };
    get('#authForm').reset = () => {};
    const source = fs.readFileSync(path.join(__dirname, '..', 'js/login.js'), 'utf8')
        .replace('import("./auth-client.js")', 'Promise.resolve(fakeAuthModule)');
    vm.runInContext(source, context);
    context.ready();
    return { ...env, calls, authSDK };
}

test('registro vincula al invitado para conservar su UID', async () => {
    const { get, calls } = loginEnvironment();
    await flush();
    get('#registerMode').onclick();
    get('#email').value = 'persona@example.com';
    get('#password').value = get('#confirmPassword').value = 'test-password';
    get('#authForm').listeners.submit({ preventDefault() {} });
    await flush();
    assert.deepEqual(calls, [['link', 'guest-123', 'persona@example.com']]);
});

test('login y recuperación usan la cuenta indicada', async () => {
    const { get, calls } = loginEnvironment();
    await flush();
    get('#email').value = 'persona@example.com';
    get('#password').value = 'test-password';
    get('#authForm').listeners.submit({ preventDefault() {} });
    await flush();
    get('#resetPassword').onclick();
    await flush();
    assert.deepEqual(calls, [['login', 'persona@example.com'], ['reset', 'persona@example.com']]);
});

test('registro no envía contraseñas que no coinciden', async () => {
    const { get, calls } = loginEnvironment();
    await flush();
    get('#registerMode').onclick();
    get('#password').value = 'test-password';
    get('#confirmPassword').value = 'different-password';
    get('#authForm').listeners.submit({ preventDefault() {} });
    await flush();
    assert.equal(calls.length, 0);
    assert.match(get('#authStatus').textContent, /no coinciden/);
});

test('el video solo se carga al abrirlo y se elimina al cerrar', () => {
    const { context, load } = environment();
    context.URL = URL;
    context.document.currentScript = { src: 'https://example.com/FitTrack/js/media.js' };
    load('media.js');
    let paused = 0;
    const media = context.FitTrackMedia.create({ id: 11, nombre: 'Burpees', videoId: 'qLBImHhCXSw', imagenes: [] }, () => paused++);
    const button = media.children[1];
    const container = media.children[3];
    assert.equal(container.children.length, 0);
    button.listeners.click();
    assert.equal(paused, 1);
    assert.equal(container.children.length, 1);
    assert.match(container.children[0].src, /youtube-nocookie.com\/embed\/qLBImHhCXSw/);
    button.listeners.click();
    assert.equal(container.hidden, true);
    assert.equal(container.children.length, 0);
});
