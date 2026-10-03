// Control panel: every slider is bound to one key of `params`.
const SLIDER_GROUPS = [
    ['Bandada', [
        { key: 'boidCount', label: 'Número de boids', min: 10, max: 3000, step: 10, onChange: setBoidCount },
        { key: 'vMax', label: 'Velocidad máxima', min: 1, max: 10, step: 0.1 },
        { key: 'maxForce', label: 'Fuerza de giro', min: 0.01, max: 0.5, step: 0.01 },
        { key: 'fov', label: 'Campo de visión', min: 30, max: 360, step: 5, unit: '°' },
    ]],
    ['Reglas de Reynolds', [
        { key: 'cohesionK', label: 'Cohesión', min: 0, max: 5, step: 0.1 },
        { key: 'alignmentK', label: 'Alineación', min: 0, max: 5, step: 0.1 },
        { key: 'separationK', label: 'Separación', min: 0, max: 5, step: 0.1 },
    ]],
    ['Radios de percepción', [
        { key: 'radiusCohesion', label: 'Cohesión', min: 10, max: 200, step: 5, unit: ' px' },
        { key: 'radiusAlignment', label: 'Alineación', min: 10, max: 200, step: 5, unit: ' px' },
        { key: 'radiusSeparation', label: 'Separación', min: 5, max: 100, step: 1, unit: ' px' },
    ]],
    ['Ratón', [
        { key: 'mouseRadius', label: 'Alcance', min: 30, max: 400, step: 10, unit: ' px' },
        { key: 'mouseK', label: 'Fuerza', min: 0, max: 5, step: 0.1 },
        { key: 'obstacleRadius', label: 'Alcance de obstáculos', min: 20, max: 200, step: 5, unit: ' px' },
    ]],
];

const MOUSE_MODES = [
    ['obstacle', 'Obstáculos', 'Clic para poner o quitar un obstáculo'],
    ['predator', 'Depredador', 'Los boids huyen del cursor'],
    ['bait', 'Cebo', 'Los boids se acercan al cursor'],
];

const sliderInputs = [];

function decimals(step) {
    const s = String(step);
    return s.includes('.') ? s.split('.')[1].length : 0;
}

function buildPanel() {
    const root = document.getElementById('controls');

    for (const [title, sliders] of SLIDER_GROUPS) {
        const fieldset = document.createElement('fieldset');
        fieldset.innerHTML = `<legend>${title}</legend>`;

        if (title === 'Ratón') fieldset.append(buildModeSelector());

        for (const s of sliders) {
            const id = `p-${s.key}`;
            const row = document.createElement('div');
            row.className = 'slider';
            row.innerHTML = `
                <label for="${id}">${s.label}</label>
                <output for="${id}"></output>
                <input type="range" id="${id}" min="${s.min}" max="${s.max}" step="${s.step}">`;
            const input = row.querySelector('input');
            const output = row.querySelector('output');
            const show = () => { output.textContent = Number(input.value).toFixed(decimals(s.step)) + (s.unit || ''); };
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
    for (const [label, action] of [
        ['Reiniciar boids', resetBoids],
        ['Quitar obstáculos', clearObstacles],
        ['Valores por defecto', resetDefaults],
    ]) {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.addEventListener('click', action);
        buttons.append(b);
    }
    root.append(buttons);

    syncPanel();
}

function buildModeSelector() {
    const group = document.createElement('div');
    group.className = 'modes';
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', 'Modo del ratón');
    for (const [value, label, hint] of MOUSE_MODES) {
        const id = `mode-${value}`;
        group.insertAdjacentHTML('beforeend', `
            <input type="radio" name="mouseMode" id="${id}" value="${value}">
            <label for="${id}" title="${hint}">${label}</label>`);
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
    const mode = MOUSE_MODES.find(([v]) => v === params.mouseMode);
    document.getElementById('modeHint').textContent = mode[2];
}

// Writes the current params into every control.
function syncPanel() {
    for (const { input, key, show } of sliderInputs) {
        input.value = params[key];
        show();
    }
    document.getElementById(`mode-${params.mouseMode}`).checked = true;
    updateHint();
}

function resetDefaults() {
    Object.assign(params, DEFAULT_PARAMS);
    setBoidCount(params.boidCount);
    syncPanel();
}

document.addEventListener('DOMContentLoaded', buildPanel);
