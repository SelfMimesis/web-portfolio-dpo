# Fluidez de la portada ART / DIGITAL PROPS

Auditoría y cambios verificados en `http://127.0.0.1:5500/index.html`, Chrome/CDP,
23 de septiembre de 2026. El foco es pasar el puntero entre las dos mitades,
expandir una sección y volver a la portada.

## Causas observadas

- El hover animaba `width` de ambas mitades y `left` del divisor en cada tick.
  Esto recalculaba la composición, las unidades de contenedor del cockpit y
  el tamaño del canvas WebGL. Ocho alternancias generaron 612 callbacks de
  ResizeObserver; el perfil atribuyó unos 275 ms a la ruta de resize del radar.
- La apertura animaba `left`, `top`, `width` y `height`: otros 102 callbacks por
  sección. Al terminar, la misma cadena preparaba todas las escenas y refrescaba
  ScrollTrigger. Se registraron intervalos de 85 y 121 ms alrededor de esa fase.
- El teléfono de un capítulo posterior creaba su WebGL y procesaba el OBJ
  durante la apertura. Una traza intermedia registró unos 54 ms en esa tarea.
- El símbolo central era decorativo pero recibía eventos del puntero; podía
  interrumpir el hover al pasar por encima de una de las mitades.

## Implementación

- `js/animations.js` y `css/journey-cover.css`: dos composiciones de tamaño fijo.
  La división conserva el recorrido 50/50 a 57/43 mediante `transform`; las
  ilustraciones y los extremos de las líneas se desplazan sin estirar texto ni
  redimensionar el cockpit. Un único tween cambia directamente de destino.
  El símbolo central deja pasar el puntero y la línea inferior permanece continua.
- La apertura calcula el diseño final una vez y anima desplazamientos y una
  máscara. Conserva los nodos originales y las dimensiones de las ilustraciones.
  El navegador recibe un fotograma para preparar las capas antes del movimiento.
- `js/navigation.js`: prepara las escenas antes de avanzar la apertura y elimina
  la posición de scroll cacheada de la sección anterior. Todos los cambios de
  mundo, incluso desde el final de otro recorrido, vuelven a scroll cero.
- `js/phone-model.js`: el modelo se prepara al llegar al capítulo anterior al
  teléfono, o al acceder directamente a él. No se procesa durante la portada.

## Resultados y límites

Mismo caso antes/después: `.preview-hero-performance.js`, informes
`.preview-hero-before.json` y `.preview-hero-final.json`.

| Medición | Antes | Después |
| --- | ---: | ---: |
| Callbacks de cambio de tamaño, ocho hovers | 612 | 1 |
| Callbacks de cambio de tamaño, apertura ART | 102 | 2 |
| Callbacks de cambio de tamaño, apertura DIGITAL PROPS | 102 | 2 |
| Layout acumulado, recorrido de prueba completo | 810 ms | 231 ms |
| Intervalo p95 de callbacks de animación, hover | 12,2 ms | 6,2 ms |
| Intervalos >25 ms durante hover | 2 | 0 |

La prueba adicional `.preview-hero-pointer.ps1` envía 68 movimientos reales con
CDP: dos callbacks de tamaño, máximo de 6,7 ms y cero intervalos >25 ms.
Son medidas del navegador de auditoría, no una garantía de FPS en otros equipos.

La preparación inicial de las escenas **sigue teniendo coste**: la última prueba
completa registró intervalos de 103 y 139 ms antes del movimiento. No se presenta
esa fase como eliminada. En la prueba de geometría `.preview-hero-frames.js`, el
intervalo inicial se conserva por separado (aproximadamente 97/103 ms); después
de la pose inicial no hubo intervalos >25 ms. La apertura mantuvo el mismo ancho
de layout, las mismas dimensiones de la composición y la línea inferior en
y=860 durante todo el movimiento, a 1440 x 900.

Verificaciones adicionales:

- Dos ciclos ART/DIGITAL PROPS, regreso al inicio, posiciones intermedias y final
  del recorrido: About aparece después del recorrido horizontal.
- Veinte triggers de escritorio en ambos mundos, sin acumulación al alternar;
  exactamente dos wrappers de portada y cero/un teléfono según el mundo.
- Escritorio, 390 x 844, 320 x 740 y movimiento reducido: sin desbordamientos ni
  transformaciones inválidas; ambas opciones y sus controles siguen accesibles.
- Modelo original del teléfono listo durante el capítulo previo; pantalla
  visible y alineada cuando llega su turno.
- Fenaquistiscopio: pausa, reanudación, cambio de mundo y los cuatro textos
  posteriores comprobados otra vez tras cambiar la preparación de navegación.
- Sin excepciones JavaScript en la última ejecución instrumentada.

Los cambios corresponden a la copia local; no se ha publicado otra versión.
