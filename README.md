# Boider

Simulación de bandadas (*boids*, el modelo de Craig Reynolds de 1986) en el navegador con [p5.js](https://p5js.org/).

Cada boid solo ve a sus vecinos cercanos y sigue tres reglas:

- **Cohesión:** se dirige al centro de los vecinos que tiene dentro de `radiusCohesion`.
- **Alineación:** iguala la dirección media de los vecinos que tiene dentro de `radiusAlignment`.
- **Separación:** se aparta de los vecinos que tiene dentro de `radiusSeparation`, y con más fuerza cuanto más cerca están.

Además esquiva los obstáculos rojos y los bordes del lienzo lo empujan hacia dentro.

## Dónde verlo

- https://taridepaco.github.io/Boider/ (GitHub Pages)
- https://boider.taridepaco.com.es

Cómo se publica cada uno: [DEPLOY.md](DEPLOY.md).

## Panel de control

El panel lateral permite cambiar en vivo:

- el número de boids, la velocidad máxima, la fuerza de giro y el **campo de visión** (los boids ignoran a los vecinos que tienen detrás);
- el peso y el radio de percepción de cada regla de Reynolds;
- el modo del ratón:
  - **Obstáculos:** clic en un hueco para poner uno y clic encima de uno para quitarlo.
  - **Depredador:** los boids huyen del cursor.
  - **Cebo:** los boids se acercan al cursor.

En el móvil el panel aparece debajo del lienzo y se puede plegar.

## Ejecutar en local

No necesita compilación. Basta con servir la carpeta:

```sh
python3 -m http.server 8000
# abre http://localhost:8000
```

## Estructura

| Archivo | Qué hace |
|---|---|
| `params.js` | Parámetros de la simulación (radios, pesos, velocidades). Se leen en cada frame. |
| `grid.js` | Rejilla espacial para buscar vecinos sin comparar todos con todos. |
| `boid.js` | Reglas de Reynolds, integración y forma de cada boid. |
| `obstacle.js` | Obstáculos con posición relativa al lienzo. |
| `render.js` | Bucle de p5: rejilla → fuerzas → movimiento → dibujo. También gestiona el ratón. |
| `ui.js`, `style.css` | Panel de control. |

Las fuerzas de todos los boids se calculan a partir de la misma foto del estado, y después se mueven todos a la vez. Así el resultado no depende del orden de la lista.

## Parámetros

| Parámetro | Valor por defecto | Efecto |
|---|---|---|
| `boidCount` | 200 | Número de boids |
| `radiusCohesion` / `radiusAlignment` / `radiusSeparation` | 70 / 100 / 30 px | Radios de percepción de cada regla |
| `cohesionK` / `alignmentK` / `separationK` | 1 / 1 / 1.5 | Peso de cada regla |
| `obstacleK`, `obstacleRadius` | 3, 80 px | Fuerza y alcance con que se esquivan los obstáculos |
| `vMax` / `vMin` | 4 / 1.5 px/frame | Velocidad máxima y mínima |
| `maxForce` | 0.1 | Giro máximo por frame de cada regla |
| `margin`, `edgeK` | 100 px, 0.3 | Ancho y fuerza de los bordes blandos |
| `fov` | 270° | Campo de visión |
| `mouseMode`, `mouseRadius`, `mouseK` | obstacle, 150 px, 2 | Modo, alcance y fuerza del ratón |

## Licencia

MIT
