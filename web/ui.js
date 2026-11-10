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

const BUTTONS = [
    ['b.reset', resetBoids, 'btn'],
    ['b.clear', clearObstacles, 'btn ghost'],
    ['b.defaults', resetDefaults, 'btn ghost'],
];

const TEXT = {
    es: {
        'desc': 'Simulación interactiva de bandadas (boids de Craig Reynolds).',
        'kind': 'Simulador',
        'panel': 'Controles',
        'pitch': 'Una bandada de boids: tres reglas locales y aparece el vuelo en grupo.',
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
        'theme.auto': 'Tema: auto',
        'theme.light': 'Tema: claro',
        'theme.dark': 'Tema: oscuro',
    },
    en: {
        'desc': 'Interactive flocking simulation (Craig Reynolds\' boids).',
        'kind': 'Simulator',
        'panel': 'Controls',
        'pitch': 'A flock of boids: three local rules and group flight appears.',
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
        'theme.auto': 'Theme: auto',
        'theme.light': 'Theme: light',
        'theme.dark': 'Theme: dark',
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

    for (const [group, sliders] of SLIDER_GROUPS) {
        const fieldset = document.createElement('fieldset');
        fieldset.innerHTML = `<legend data-i18n="g.${group}"></legend>`;

        if (group === 'mouse') fieldset.append(buildModeSelector());

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

    const buttons = document.createElement('div');
    buttons.className = 'buttons';
    for (const [label, action, className] of BUTTONS) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = className;
        b.dataset.i18n = label;
        b.addEventListener('click', action);
        buttons.append(b);
    }
    root.append(buttons);

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
    const wrap = document.createElement('div');
    wrap.append(group, hint);
    return wrap;
}

function updateHint() {
    document.getElementById('modeHint').textContent = t(`h.${params.mouseMode}`);
}

// Theme button (auto -> light -> dark) and language switch.
function setupTopbar() {
    const themeBtn = document.getElementById('theme-btn');
    if (window.Theme) {
        themeBtn.addEventListener('click', () => Theme.cycle());
        Theme.onChange(syncTheme);
    } else {
        themeBtn.hidden = true;
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

function syncTheme() {
    const themeBtn = document.getElementById('theme-btn');
    if (window.Theme) themeBtn.textContent = t(`theme.${Theme.mode()}`);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    readPalette(); // the canvas does not inherit the CSS tokens
}

// Writes every text of the page in the current language.
function paintText() {
    document.documentElement.lang = lang;
    for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
    for (const el of document.querySelectorAll('[data-i18n-title]')) el.title = t(el.dataset.i18nTitle);
    for (const b of document.querySelectorAll('.lang-switch button')) {
        b.setAttribute('aria-pressed', b.dataset.lang === lang);
    }
    document.getElementById('modes').setAttribute('aria-label', t('m.label'));
    document.querySelector('meta[name="description"]').content = t('desc');
    if (window.Theme) document.getElementById('theme-btn').textContent = t(`theme.${Theme.mode()}`);
    updateHint();
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
