// Control panel: every slider is bound to one key of `params`.
// Labels are i18n keys (see TEXT); the page is in Spanish and English.
const SLIDER_GROUPS = [
    ['flock', [
        { key: 'boidCount', label: 's.boidCount', min: 10, max: 3000, step: 10, onChange: setBoidCount },
        { key: 'vMax', label: 's.vMax', min: 1, max: 10, step: 0.1 },
        { key: 'maxForce', label: 's.maxForce', min: 0.01, max: 0.5, step: 0.01 },
        { key: 'fov', label: 's.fov', min: 30, max: 360, step: 5, unit: '°' },
    ]],
    ['rules', [
        { key: 'cohesionK', label: 's.cohesion', min: 0, max: 5, step: 0.1 },
        { key: 'alignmentK', label: 's.alignment', min: 0, max: 5, step: 0.1 },
        { key: 'separationK', label: 's.separation', min: 0, max: 5, step: 0.1 },
    ]],
    ['radii', [
        { key: 'radiusCohesion', label: 's.cohesion', min: 10, max: 200, step: 5, unit: ' px' },
        { key: 'radiusAlignment', label: 's.alignment', min: 10, max: 200, step: 5, unit: ' px' },
        { key: 'radiusSeparation', label: 's.separation', min: 5, max: 100, step: 1, unit: ' px' },
    ]],
    ['mouse', [
        { key: 'mouseRadius', label: 's.reach', min: 30, max: 400, step: 10, unit: ' px' },
        { key: 'mouseK', label: 's.strength', min: 0, max: 5, step: 0.1 },
        { key: 'obstacleRadius', label: 's.obstacleRadius', min: 20, max: 200, step: 5, unit: ' px' },
    ]],
];

const MOUSE_MODES = ['obstacle', 'predator', 'bait'];

// The buttons say what they do with data-act. They are at the top of the panel and, on phones,
// in the deck under the canvas instead (index.html): one handler per action for both copies.
const ACTIONS = { reset: () => resetBoids(), clear: () => clearObstacles(), defaults: () => resetDefaults() };
// All three take the whole width: in two columns "Valores por defecto" breaks into three lines.
const BUTTONS = [
    ['reset', 'b.reset', 'btn wide'],
    ['clear', 'b.clear', 'btn ghost wide'],
    ['defaults', 'b.defaults', 'btn ghost wide'],
];

const TEXT = {
    es: {
        'desc': 'Simulación interactiva de bandadas (boids de Craig Reynolds).',
        'kind': 'Simulador',
        'panel': 'Controles',
        'pitch': 'Una bandada de boids: tres reglas locales y aparece el vuelo en grupo.',
        'deck': 'Mandos principales',
        'board': 'Bandada de boids',
        'g.run': 'Simulación',
        'g.look': 'Aspecto',
        'g.flock': 'Bandada',
        'g.rules': 'Reglas de Reynolds',
        'g.radii': 'Radios de percepción',
        'g.mouse': 'Ratón',
        's.boidCount': 'Número de boids',
        's.vMax': 'Velocidad máxima',
        's.maxForce': 'Fuerza de giro',
        's.fov': 'Campo de visión',
        's.cohesion': 'Cohesión',
        's.alignment': 'Alineación',
        's.separation': 'Separación',
        's.reach': 'Alcance',
        's.strength': 'Fuerza',
        's.obstacleRadius': 'Alcance de obstáculos',
        'm.label': 'Modo del ratón',
        'm.obstacle': 'Obstáculos',
        'm.predator': 'Depredador',
        'm.bait': 'Cebo',
        'h.obstacle': 'Clic para poner o quitar un obstáculo',
        'h.predator': 'Los boids huyen del cursor',
        'h.bait': 'Los boids se acercan al cursor',
        'b.reset': 'Reiniciar boids',
        'b.clear': 'Quitar obstáculos',
        'b.defaults': 'Valores por defecto',
        'deck.reset': 'Reiniciar',
        'deck.clear': 'Despejar',
        'deck.defaults': 'Restaurar',
        'theme.auto': 'Tema: auto',
        'theme.light': 'Tema: claro',
        'theme.dark': 'Tema: oscuro',
        'st.obstacle': 'obstáculo',
        'st.obstacles': 'obstáculos',
        'st.world': 'mundo',
    },
    en: {
        'desc': 'Interactive flocking simulation (Craig Reynolds\' boids).',
        'kind': 'Simulator',
        'panel': 'Controls',
        'pitch': 'A flock of boids: three local rules and group flight appears.',
        'deck': 'Main controls',
        'board': 'Flock of boids',
        'g.run': 'Simulation',
        'g.look': 'Appearance',
        'g.flock': 'Flock',
        'g.rules': 'Reynolds\' rules',
        'g.radii': 'Perception radii',
        'g.mouse': 'Mouse',
        's.boidCount': 'Number of boids',
        's.vMax': 'Top speed',
        's.maxForce': 'Turning force',
        's.fov': 'Field of view',
        's.cohesion': 'Cohesion',
        's.alignment': 'Alignment',
        's.separation': 'Separation',
        's.reach': 'Reach',
        's.strength': 'Strength',
        's.obstacleRadius': 'Obstacle reach',
        'm.label': 'Mouse mode',
        'm.obstacle': 'Obstacles',
        'm.predator': 'Predator',
        'm.bait': 'Bait',
        'h.obstacle': 'Click to add or remove an obstacle',
        'h.predator': 'Boids flee from the cursor',
        'h.bait': 'Boids come to the cursor',
        'b.reset': 'Reset boids',
        'b.clear': 'Clear obstacles',
        'b.defaults': 'Default values',
        'deck.reset': 'Reset',
        'deck.clear': 'Clear',
        'deck.defaults': 'Defaults',
        'theme.auto': 'Theme: auto',
        'theme.light': 'Theme: light',
        'theme.dark': 'Theme: dark',
        'st.obstacle': 'obstacle',
        'st.obstacles': 'obstacles',
        'st.world': 'world',
    },
};

const LANG_KEY = 'taridepaco-lang'; // shared with the rest of taridepaco.github.io
let lang = document.documentElement.lang === 'en' ? 'en' : 'es';
const sliderInputs = [];

function t(key) {
    return TEXT[lang][key];
}

function decimals(step) {
    const s = String(step);
    return s.includes('.') ? s.split('.')[1].length : 0;
}

function buildPanel() {
    const root = document.getElementById('controls');

    const pitch = document.createElement('p');
    pitch.className = 'pitch';
    pitch.dataset.i18n = 'pitch';
    root.append(pitch);

    // the buttons first; on phones they are in the deck, so this group only shows on desktop
    const run = document.createElement('fieldset');
    run.className = 'desk';
    run.innerHTML = '<legend data-i18n="g.run"></legend><div class="buttons"></div>';
    for (const [act, label, className] of BUTTONS) {
        run.lastChild.insertAdjacentHTML('beforeend',
            `<button class="${className}" type="button" data-act="${act}" data-i18n="${label}"></button>`);
    }
    root.append(run);

    for (const [group, sliders] of SLIDER_GROUPS) {
        const fieldset = document.createElement('fieldset');
        fieldset.innerHTML = `<legend data-i18n="g.${group}"></legend>`;

        if (group === 'mouse') fieldset.append(...buildModeSelector());

        for (const s of sliders) {
            const id = `p-${s.key}`;
            const row = document.createElement('div');
            row.className = 'slider';
            row.innerHTML = `
                <label for="${id}" data-i18n="${s.label}"></label>
                <output for="${id}"></output>
                <input type="range" id="${id}" min="${s.min}" max="${s.max}" step="${s.step}">`;
            const input = row.querySelector('input');
            const output = row.querySelector('output');
            const show = () => {
                const v = Number(input.value);
                output.textContent = v.toFixed(decimals(s.step)) + (s.unit || '');
                // filled part of the track, see style.css
                input.style.setProperty('--p', (v - s.min) / (s.max - s.min));
            };
            input.addEventListener('input', () => {
                const v = Number(input.value);
                params[s.key] = v;
                if (s.onChange) s.onChange(v);
                show();
            });
            sliderInputs.push({ input, key: s.key, show });
            fieldset.append(row);
        }
        root.append(fieldset);
    }

    // phones only: the theme button leaves the top bar and comes here
    const look = document.createElement('fieldset');
    look.className = 'm-only';
    look.innerHTML = '<legend data-i18n="g.look"></legend>'
        + '<div class="row"><button class="chip theme-btn" type="button"></button></div>';
    root.append(look);

    for (const b of document.querySelectorAll('[data-act]')) b.addEventListener('click', ACTIONS[b.dataset.act]);

    setupTopbar();
    syncPanel();
    paintText();
}

function buildModeSelector() {
    const group = document.createElement('div');
    group.className = 'modes';
    group.id = 'modes';
    group.setAttribute('role', 'radiogroup');
    for (const value of MOUSE_MODES) {
        const id = `mode-${value}`;
        group.insertAdjacentHTML('beforeend', `
            <input type="radio" name="mouseMode" id="${id}" value="${value}">
            <label for="${id}" data-i18n="m.${value}" data-i18n-title="h.${value}"></label>`);
    }
    group.addEventListener('change', (e) => { params.mouseMode = e.target.value; updateHint(); });
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.id = 'modeHint';
    return [group, hint];
}

function updateHint() {
    document.getElementById('modeHint').textContent = t(`h.${params.mouseMode}`);
}

// Theme button (auto -> light -> dark) and language switch. There are two theme buttons, in the
// top bar and, on phones, in the panel: they change together.
function setupTopbar() {
    const themeBtns = document.querySelectorAll('.theme-btn');
    if (window.Theme) {
        for (const b of themeBtns) b.addEventListener('click', () => Theme.cycle());
        Theme.onChange(syncTheme);
    } else {
        for (const b of themeBtns) b.hidden = true;
    }
    for (const b of document.querySelectorAll('.lang-switch button')) {
        b.addEventListener('click', () => {
            lang = b.dataset.lang;
            try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* no storage */ }
            paintText();
        });
    }
    syncTheme();
}

function paintThemeButtons() {
    if (!window.Theme) return;
    for (const b of document.querySelectorAll('.theme-btn')) b.textContent = t(`theme.${Theme.mode()}`);
}

function syncTheme() {
    paintThemeButtons();
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    readPalette(); // the canvas does not inherit the CSS tokens
}

// Writes every text of the page in the current language.
function paintText() {
    document.documentElement.lang = lang;
    for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
    for (const el of document.querySelectorAll('[data-i18n-title]')) el.title = t(el.dataset.i18nTitle);
    for (const el of document.querySelectorAll('[data-i18n-label]')) el.setAttribute('aria-label', t(el.dataset.i18nLabel));
    for (const b of document.querySelectorAll('.lang-switch button')) {
        b.setAttribute('aria-pressed', b.dataset.lang === lang);
    }
    document.getElementById('modes').setAttribute('aria-label', t('m.label'));
    document.querySelector('meta[name="description"]').content = t('desc');
    paintThemeButtons();
    updateHint();
    paintStats();
}

// Status line under the canvas, every half second (render.js) and when the language changes.
// The world is the canvas itself, in CSS px. Phones get one short line: boids and fps only.
const narrow = window.matchMedia('(max-width: 720px)');
function paintStats() {
    if (!worldReady || !fps) return; // nothing measured yet
    const n = (v) => v.toLocaleString(lang);
    const parts = [`${n(flock.length)} boids`, `${n(Math.round(fps))} fps`];
    if (!narrow.matches) {
        parts.push(`${n(obstacles.length)} ${t(obstacles.length === 1 ? 'st.obstacle' : 'st.obstacles')}`);
        parts.push(`${t('st.world')} ${width}×${height}`);
    }
    document.getElementById('stats').textContent = parts.join(' · ');
}

// Writes the current params into every control.
function syncPanel() {
    for (const { input, key, show } of sliderInputs) {
        input.value = params[key];
        show();
    }
    document.getElementById(`mode-${params.mouseMode}`).checked = true;
}

// Same as reloading the page: default params, the initial obstacles and a new flock.
function resetDefaults() {
    Object.assign(params, DEFAULT_PARAMS);
    resetObstacles();
    resetBoids();
    syncPanel();
    updateHint();
}

document.addEventListener('DOMContentLoaded', buildPanel);
