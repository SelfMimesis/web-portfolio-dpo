# Auditoría de fluidez — 23 de septiembre de 2026

Revisión y pruebas sobre `http://127.0.0.1:5500/index.html`, la misma dirección local indicada por el usuario. Sitio vanilla HTML/CSS/ES Modules; se conservan las imágenes originales, la composición y los recorridos.

## Ilustración que reaparecía

No era únicamente un problema de caché: `main.js`, `scrollytelling.js`, `ambient-motion.js`, `index.html`, el módulo/estilos `letterhead` y la imagen WebP habían vuelto a incorporar el capítulo después de su retirada anterior. La respuesta HTTP de `5500/js/main.js` todavía lo montaba.

Se han eliminado nuevamente el módulo, la hoja de estilo, el WebP y sus referencias activas. ART vuelve a tener siete paneles, con Graphic Props inmediatamente después de la portada. DIGITAL PROPS mantiene ocho. Se han restituido el avance entre capítulos y las pausas de lectura. Los textos naranjas conservan la alineación izquierda y el aumento de tamaño solicitado.

## Trabajo innecesario detectado y corregido

| Zona | Causa | Cambio |
| --- | --- | --- |
| Scroll horizontal | Lecturas repetidas de `offsetLeft` y `clientWidth` después de escribir estilos; cálculo de posiciones en cada fotograma. | Anchura y posiciones medidas al refrescar la geometría. El scroll trabaja con los valores guardados; el redimensionado vuelve a medir. |
| Graphic Props | Un tween de GSAP por carácter, con trabajo considerable al crear y destruir el capítulo. | Un reloj por grupo de texto y actualizaciones limitadas a los caracteres que aparecen/desaparecen. Se conserva el dibujo manuscrito y el scroll reversible. Limpieza explícita al pasar a móvil o movimiento reducido. |
| Teléfono 3D | Se medía el DOM y se dibujaba el mismo modelo cada vez que cambiaba el contenido de la pantalla. | Dimensiones recibidas de ResizeObserver y render solo cuando cambia la pose, el tamaño o la aparición de la pantalla. Compilación asíncrona de shaders cuando el driver la permite. |
| Apps del teléfono | `innerHTML`, textos, consultas y estados repetidos aunque el contenido no cambiara. | Referencias y valores guardados; los textos se actualizan solo al cambiar de estado. |
| Interfaces y telemetría | Posición y tamaño de la foto consultados durante la animación. | Medición en resize/refresh, con desconexión de observadores al salir. Coordenadas de la retícula del globo reutilizadas entre fotogramas. |
| Radar | Lectura de anchura al sincronizar visibilidad y otra copia de Three.js desde CDN. | ResizeObserver entrega la anchura; radar y teléfono comparten la biblioteca local existente. |
| Inicio y multimedia | Arranque de navegación dependiente de `window.load`; vídeo preparado antes de necesitarlo y juego susceptible de cargarse aunque su panel fuera invisible. | Inicio en DOMContentLoaded y refresco de geometría tras load; vídeo con `preload="none"`, foto de skills con carga diferida y decodificación asíncrona; juego creado cuando está activo. |

## Evidencia

Herramientas: Chrome/CDP, muestreo de CPU, Performance metrics, Long Animation Frames, traza de renderizado, capturas y comprobaciones de interacción. Scripts locales: `.preview-performance.ps1`, `.preview-performance.js`, `.preview-performance-regression.js` y `.preview-performance-media.js`.

La primera muestra del recorrido de Digital Props registró cuatro fotogramas de más de 50 ms y un máximo de 151,5 ms durante cuatro segundos de scroll. La última muestra registrada en `.preview-performance-controlled-final.json` tuvo cero intervalos entre callbacks de requestAnimationFrame de más de 50 ms: máximo de 48,5 ms en Digital Props y 6,4 ms en ART. Durante el conjunto de esa prueba quedaron dos tareas largas de 106 y 115 ms al preparar las secciones.

En la última medición se bloqueó la recarga automática de Live Server exclusivamente en la pestaña de auditoría, para que guardar capturas e informes no interrumpiera la prueba. La página y el navegador habitual del usuario mantienen su comportamiento normal.

Estos números describen este navegador y recorrido; no son una promesa de FPS para otros equipos. Las ejecuciones de primera carga y con cachés de navegador/GPU calientes varían. Algunas ejecuciones previas mostraron picos mayores durante la preparación de WebGL. Por ello, la mejora también se verifica con invariantes independientes del tiempo:

- Cero llamadas WebGL mientras la pose del teléfono permanece estable y se sigue desplazando su contenido.
- Cero reconstrucciones del título del reel cuando su texto no cambia.
- Tras varias alternancias ART/DIGITAL PROPS: 20 triggers de escritorio, cero/un escenario de teléfono y cero/un marco de registro según el mundo; los recuentos no crecen.
- Siete paneles de ART y ocho de DIGITAL PROPS, con contadores y navegación correctos.
- Cuatro textos de Graphic Props legibles, alineación de la frase naranja con el párrafo: diferencia de 0 px. Verificado avance y retroceso.
- About permanece por debajo del viewport hasta finalizar el recorrido horizontal.
- Sin errores JavaScript, estilos `NaN` ni desbordamiento horizontal en las comprobaciones de escritorio, 390 px, 320 px y movimiento reducido.
- Cambio de escritorio a móvil: ningún carácter queda oculto por estilos de la animación anterior.
- Multimedia: juego ausente al entrar en Digital Props, cargado y utilizable al llegar a su capítulo y detenido al salir; vídeo reproduce y pausa según visibilidad; fotografía original de skills cargada y efecto ASCII operativo.

## Límites observados

Los originales de algunas imágenes siguen siendo grandes: la carta de portada ronda 7 MB y varios retratos de interfaces ocupan varios MB. Se conservan sus archivos y apariencia. La conexión, la decodificación inicial y la primera preparación de WebGL pueden seguir influyendo en la primera visita; el vídeo/juego y los cálculos fuera de su momento de uso ya no deben competir innecesariamente con el scroll.

Los cambios están en la copia local. Este trabajo no publica una versión distinta en GitHub Pages.
