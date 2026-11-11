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

Arriba del panel están los botones: reiniciar la bandada, quitar los obstáculos y volver a los valores por defecto.

En el móvil la pantalla va primero. Debajo hay una barra con esos tres botones (*Reiniciar*, *Despejar*, *Restaurar*) y, abajo del todo, la tira *Controles*, que abre el resto del panel como una hoja sobre la parte baja del lienzo sin cambiar su tamaño.

Bajo el lienzo, una línea de estado muestra los boids, los fotogramas por segundo, los obstáculos y el tamaño del mundo (en el móvil, solo los dos primeros).

## Aspecto

La página usa el sistema de diseño común de [taridepaco.github.io](https://taridepaco.github.io/): `web/system.css` (tokens y piezas) y `web/theme.js` (tema claro, oscuro o el del sistema) son copias sin modificar de [ese repositorio](https://github.com/taridepaco/taridepaco.github.io) y no se editan aquí. Lo propio de Boider (cabecera, panel, deslizadores, selector de modo, marco del lienzo, barra de mandos del móvil) está en `web/style.css`, hecho con los mismos tokens. La página de simulador es la misma que la de [GameOfLifer](https://github.com/taridepaco/GameOfLifer).

El mundo es el propio lienzo, en px CSS, y ocupa todo el sitio que deja el panel. El lienzo se dibuja a los píxeles reales de la pantalla (tamaño CSS × `devicePixelRatio`), así que los boids se ven nítidos en el móvil. Los obstáculos guardan su posición relativa al lienzo y siguen en su sitio cuando cambia el tamaño.

Está en español e inglés. El idioma y el tema elegidos se comparten con el resto de páginas de taridepaco.github.io.

## Ejecutar en local

No necesita compilación. Basta con servir la carpeta `web/`:

```sh
python3 -m http.server 8000 --directory web
# abre http://localhost:8000
```

Lo que se publica es `dist/`, que genera `deploy/build.sh` (ver [DEPLOY.md](DEPLOY.md)).

## Estructura

| Archivo | Qué hace |
|---|---|
| `web/params.js` | Parámetros de la simulación (radios, pesos, velocidades). Se leen en cada frame. |
| `web/grid.js` | Rejilla espacial para buscar vecinos sin comparar todos con todos. |
| `web/boid.js` | Reglas de Reynolds, integración y forma de cada boid. |
| `web/obstacle.js` | Obstáculos con posición relativa al lienzo. |
| `web/render.js` | Bucle de p5: rejilla → fuerzas → movimiento → dibujo. También gestiona el ratón y el tamaño del lienzo. |
| `web/ui.js`, `web/style.css` | Panel de control, barra de mandos del móvil, línea de estado, tema e idioma. |
| `deploy/` | Construcción de `dist/` e instalación en el servidor propio ([DEPLOY.md](DEPLOY.md)). |
| `.github/workflows/pages.yml` | Publica `dist/` en GitHub Pages con cada push a `main`. |

Las fuerzas de todos los boids se calculan a partir de la misma foto del estado, y después se mueven todos a la vez. Así el resultado no depende del orden de la lista.

## Parámetros

| Parámetro | Valor por defecto | Efecto |
|---|---|---|
| `boidCount` | 500 | Número de boids |
| `radiusCohesion` / `radiusAlignment` / `radiusSeparation` | 80 / 35 / 25 px | Radios de percepción de cada regla |
| `cohesionK` / `alignmentK` / `separationK` | 1 / 1.5 / 2 | Peso de cada regla |
| `obstacleK`, `obstacleRadius` | 3, 80 px (40 px en pantallas de menos de 720 px) | Fuerza y alcance con que se esquivan los obstáculos |
| `vMax` / `vMin` | 4 / 1.5 px/frame | Velocidad máxima y mínima |
| `maxForce` | 0.1 | Giro máximo por frame de cada regla |
| `margin`, `edgeK` | 100 px, 0.3 | Ancho y fuerza de los bordes blandos |
| `fov` | 360° | Campo de visión |
| `mouseMode`, `mouseRadius`, `mouseK` | obstacle, 150 px, 2 | Modo, alcance y fuerza del ratón |

## Licencia

MIT
