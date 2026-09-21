# DPO — Portfolio de Diego Pérez Obrero

Guía de mantenimiento y funcionamiento para trabajar con la web sin dominar programación. Incluye los cambios anteriores, la evolución actual y las partes que todavía requieren atención.

- **Web:** https://selfmimesis.github.io/web-portfolio-dpo/
- **Repositorio:** https://github.com/SelfMimesis/web-portfolio-dpo
- **Arquitectura:** HTML, CSS, JavaScript con módulos ES, GSAP 3.13 + ScrollTrigger y Three.js opcional.
- **Sin React, Next.js, Vue, npm, bundler ni compilación.** React aparece en la biografía como conocimiento profesional, no como tecnología de esta web.
- **Revisión de esta guía:** 21 de septiembre de 2026.

> Guardar un archivo en VS Code solo modifica la copia local. Para verlo en el móvil a través de la dirección pública hay que subir los cambios a GitHub y esperar a que termine GitHub Pages.

## Índice

1. [Abrir y trabajar en local](#1-abrir-y-trabajar-en-local)
2. [Experiencia del visitante](#2-experiencia-del-visitante)
3. [Mapa de archivos](#3-mapa-de-archivos)
4. [Arranque y estado](#4-arranque-y-estado)
5. [Scroll horizontal y timelines](#5-scroll-horizontal-y-timelines)
6. [ORBIT y LCD](#6-orbit-y-lcd)
7. [Portada, navegación y cursor](#7-portada-navegación-y-cursor)
8. [About y filmografía](#8-about-y-filmografía)
9. [Móvil y accesibilidad](#9-móvil-y-accesibilidad)
10. [Cómo editar contenido](#10-cómo-editar-contenido)
11. [Publicación](#11-publicación)
12. [Pruebas y solución de problemas](#12-pruebas-y-solución-de-problemas)
13. [Historial de mejoras](#13-historial-de-mejoras)
14. [Pendientes y límites](#14-pendientes-y-límites)
15. [Glosario](#15-glosario)

## 1. Abrir y trabajar en local

### Método recomendado

1. Abre la carpeta completa `PORTFOLIO` en VS Code.
2. Inicia un servidor HTTP local. Si utilizas Live Server, abre `index.html` con «Open with Live Server» o «Go Live».
3. Abre la dirección que indique, por ejemplo `http://127.0.0.1:5500/`.
4. Guarda los cambios y recarga. Si ves una versión antigua, usa `Ctrl + Shift + R`.

No abras el HTML mediante doble clic: una dirección `file:///...` puede bloquear los módulos JavaScript. No necesitas ejecutar `npm install` ni generar una carpeta `dist`.

Si tienes Python instalado, otra alternativa desde la carpeta del proyecto es:

```powershell
python -m http.server 8000
```

Abre después `http://localhost:8000/`. `Ctrl + C` detiene ese servidor. Python es solo una alternativa de desarrollo, no una dependencia de producción.

### Cómo hacer cambios sin perderte

Crea un commit o una copia de seguridad antes de un cambio grande. Modifica una cosa, guarda y comprueba ambos universos. Un error de comillas en `main.js` puede impedir construir todas las escenas, aunque parezca un simple cambio de texto.

La animación completa necesita conexión para cargar GSAP y Three.js desde CDN. Si falla GSAP/ScrollTrigger, los proyectos tienen una alternativa vertical. Si falla Three.js, se omite solo su adorno.

## 2. Experiencia del visitante

| Universo visible | Clave interna | Lenguaje | Contenido |
| --- | --- | --- | --- |
| ART / Graphic Design | `art` | Papel, naranja, impresión y objetos | Gráfica y props físicos para cine |
| DIGITAL PROPS | `dev` | Verde, instrumentos y LCD | Interfaces que existen dentro de la ficción |

`dev` es una clave técnica; no obliga a llamar «Development» a la sección.

Al entrar, la mitad seleccionada se expande. La portada original pasa a ser la primera escena: no desaparece para ser reemplazada por otro diseño. El cursor se convierte en `SCROLL ↓` y se desvanece al empezar a desplazarse.

En escritorio, bajar con la rueda avanza por una fila horizontal: **el panel actual sale por la izquierda y el siguiente entra desde la derecha**. Al terminar hay una pausa breve para leer el botón lateral. Después comienza el descenso a About. El botón cambia a `About Me ↓` y vuelve a su destino original al retroceder.

| Orden | ART | DIGITAL PROPS |
| --- | --- | --- |
| 1 | Cover | Cover |
| 2 | Intro | Intro |
| 3 | Selected Work | Selected Work |
| 4 | Project Detail | Interaction |
| 5 | Process | Playback |
| 6 | Archive | Archive |
| 7 | Next World | Next World |

En móvil hay lectura vertical y una puesta en escena propia, no una réplica reducida del scroll horizontal.

## 3. Mapa de archivos

```text
index.html                 Portada, navegación, About, créditos y contacto
README.md                  Esta guía
.nojekyll                  Publicación estática en Pages
.gitignore                 Exclusiones de herramientas y pruebas locales
css/                       Apariencia, responsive y estados visuales
js/                        Comportamiento y animaciones
assets/
  fonts/                   JAK y su licencia
  posters/                 Carteles de filmografía
  portfolio-card.png       Carta/retrato de las composiciones
  logo-web.gif             Logo animado
docs/
  SCROLL-AUDIT.md           Auditoría y alcance de la evolución narrativa
```

### JavaScript

| Archivo | Responsabilidad | Editar cuando… |
| --- | --- | --- |
| `main.js` | Construye capítulos e inicializa la aplicación | Cambias textos/proyectos de los recorridos |
| `state.js` | Universo, progreso, panel y preferencias | Cambias reglas globales |
| `navigation.js` | Entrar, volver a inicio, foco e historial | Cambias acciones de navegación |
| `animations.js` | Entrada y expansión de portada | Ajustas la transición inicial |
| `scrollytelling.js` | Track horizontal, pin, progreso y pausa final | Ajustas el recorrido global |
| `scene-timelines.js` | Animación interna del primer tramo DEV | Ajustas su ritmo sin tocar el pin |
| `mobile-story.js` | Animaciones reversibles de capítulos móviles | Ajustas la narrativa vertical existente |
| `world-links.js` | Botones finales y descenso a About | Cambias el acceso entre universos |
| `lcd-display.js` | Matriz, segmentos, ENTER y boot | Cambias estados electrónicos del LCD |
| `ambient-motion.js` | Pausa loops CSS fuera de pantalla | Controlas movimiento ambiental |
| `cursor.js` | Cursor compartido y aviso de scroll | Ajustas respuesta, forma y color |
| `three-scene.js` | Pequeña capa WebGL opcional | Ajustas exclusivamente ese adorno |
| `about.js` | Cinco capítulos y sus ilustraciones | Ajustas la presentación biográfica |
| `filmography.js` | Listado/poster desktop y expansión | Ajustas la composición de créditos |
| `film-posters.js` | Carrusel, ficha, botones y versión alternativa | Ajustas los carteles |
| `mobile-filmography.js` | Galería móvil y tabla desplegable | Ajustas créditos en móvil |

### CSS

| Archivo | Qué controla |
| --- | --- |
| `reset.css` | Normalización y reglas base |
| `variables.css` | Paleta, tipografías y altura de cabecera |
| `styles.css` | Estructura general, portada y composiciones |
| `responsive.css` | Adaptaciones generales por tamaño y movimiento reducido |
| `digital-props.css` | Terminal ORBIT y sus instrumentos |
| `world-links.css` | Paneles finales y estado de descenso |
| `about.css` | Biografía y estructura de créditos |
| `film-posters.css` | Posters, controles y variantes de galería |
| `cursor.css` | Apariencia del cursor |
| `mobile-story.css` | Escenas móviles y progreso de lectura |
| `lcd.css` | Cristal LCD y estados de los segmentos |
| `journey-cover.css` | Portada dentro del recorrido y barra inferior |
| `scene-timelines.css` | Marco continuo, intro instrumental y pausa de loops |

El orden de los `<link>` importa: una regla posterior puede sobrescribir otra. Por ejemplo, el acabado final del progreso está en `journey-cover.css`, aunque su base exista en `styles.css`.

Los archivos `.preview-*`, capturas, perfiles de Chrome y `.publish-tools/` son herramientas locales. No forman parte de la web. Las pruebas con depuración remota no son necesarias para abrir el proyecto normalmente.

## 4. Arranque y estado

El navegador carga `index.html`, estilos y librerías, y ejecuta `main.js` como módulo. `initApp()` espera a que termine la carga inicial y:

1. Registra ScrollTrigger si está disponible.
2. Detecta móvil y movimiento reducido.
3. Ejecuta `buildScenes()` y añade Next World.
4. Inicializa LCD y visibilidad de loops.
5. Conecta navegación, portada, cursor y Three.js.
6. Prepara About y filmografía.
7. Lee `#art` o `#dev` de la URL para entrar directamente si corresponde.

### `buildScenes()`

Las pistas de ART y DEV están vacías en el HTML inicial. Esta función las rellena desde el objeto `scenes` de `main.js`: un hueco para la portada más cinco capítulos. `world-links.js` añade el séptimo.

Las composiciones de papel y terminal se reutilizan a partir del HTML original. Cambiar la terminal de `index.html` también actualiza su aparición en Selected Work.

La portada completa se **mueve**, no se duplica, al primer panel cuando se entra. Al pulsar el logo vuelve a su posición original. Esto evita dos portadas independientes y desincronizadas.

### Estado compartido

`state.js` guarda datos pequeños que consultan los otros módulos:

```js
activeWorld           // null, 'art' o 'dev'
hoveredWorld          // Mitad sobre la que está el ratón
scrollProgress        // De 0 a 1
currentPanel          // Índice desde 0: Cover es 0
transitionInProgress  // Evita cambios de universo superpuestos
isMobile              // Ancho <= 700px
reducedMotion         // Preferencia del sistema
```

No hace falta sustituirlo por un framework o gestor externo.

## 5. Scroll horizontal y timelines

### Estructura

```text
.scrolly                  Sección completa
  .scrolly-sticky          Ventana que se mantiene fija
    .horizontal-track     Fila que se desplaza
      .panel              Capítulo
```

La rueda sigue haciendo scroll vertical normal. ScrollTrigger traduce su progreso a una transformación horizontal de la fila. No se usa Lenis ni otra librería de scroll.

```js
horizontalDistance = track.scrollWidth - section.clientWidth;
// La pista avanza de x = 0 a x = -horizontalDistance.
```

El signo negativo permite entrar al siguiente panel situado a la derecha.

### Partes delicadas que conviene conservar

- **Pin:** mantiene la ventana fija mientras se consume distancia vertical.
- **Scrub `.75`:** suaviza la relación entre scroll y desplazamiento.
- **Pausa final:** añade 600–1100 px de scroll (95 % de la altura, dentro de esos límites) con el último panel quieto. La barra del botón lateral pasa de 0 a 100 % durante ese tramo. Al llenarse empieza el descenso vertical; al subir se vacía de nuevo. Es distancia de scroll, no un temporizador.
- **Pin spacing:** reserva espacio para que About no aparezca antes de tiempo.
- **`refreshPriority: 100`:** calcula primero el recorrido situado encima de About.
- **`invalidateOnRefresh`:** permite recalcular al cambiar el tamaño de ventana.

No elimines espacio de pinning ni cambies prioridades para arreglar un detalle visual sin revisar las secciones posteriores.

### Indicador inferior

Muestra universo, capítulo y progreso. El botón permite avanzar sin rueda. En escritorio, los paneles fuera del capítulo activo reciben `inert`, para no enfocar controles invisibles. En vertical no se aplica esa restricción.

El indicador utiliza referencias guardadas al inicializar. Los textos y `inert` solo cambian cuando cambia el capítulo, evitando escrituras repetidas en cada frame. La línea sí cambia de escala al avanzar.

**ART:** fondo liso editorial y barra naranja continua. **DIGITAL PROPS:** textura LCD verde y segmentos. La línea horizontal de referencia pasa por el centro de ambos indicadores.

### Nueva capa de escenas locales

`scene-timelines.js` afecta inicialmente a **DEV: Cover → Intro → Selected Work**. El pin y la distancia siguen perteneciendo a `scrollytelling.js`.

```text
Scroll → progreso global → progreso de panel → timeline local
                                          → estado LCD discreto
```

En escritorio se utiliza el mismo progreso del desplazamiento. No hay otro `requestAnimationFrame` ni un ScrollTrigger nuevo por cada panel del tramo.

| Progreso local | Intención |
| --- | --- |
| 0–0.32 | Entrada del título y asentamiento visual |
| 0.32–0.68 | Pausa de lectura |
| 0.68–1 | El título cede protagonismo y la composición se aleja |

Un marco técnico permanece mientras pasan los tres capítulos; cambia su escala y etiqueta, y desaparece antes de continuar el recorrido habitual. La intro añade un instrumento LCD. La portada sigue conteniendo ORBIT.

En móvil se usan activadores verticales para estas tres escenas, evitando superponerles las animaciones móviles anteriores. El marco no aparece. Con movimiento reducido no se crean estas timelines y el contenido queda visible.

Al salir del universo, `destroy()` revierte estilos, retira el marco y restaura estados antes de devolver la portada a su lugar. Los capítulos posteriores mantienen su coreografía anterior: no se ha rediseñado toda la web de golpe.

## 6. ORBIT y LCD

### Terminal original restaurada

Por petición posterior, ORBIT vuelve a la versión publicada al principio de esta sesión, antes del rediseño: misma posición, dimensiones, perspectiva, sombras, textura de pantalla y distribución de datos. Se han recuperado el HTML y `digital-props.css` del commit `f666c64` sin revertir las mejoras de scroll, navegación, filmografía o progreso.

La [referencia ZRK](https://www.zrk.technology/) se estudió durante la evolución narrativa. El rediseño de terminal inspirado en ella se ha retirado. ORBIT conserva su identidad anterior como interfaz ficticia de navegación espacial.

Se recuperan el barrido del radar, el movimiento del horizonte y las pulsaciones originales. Estos loops siguen pausándose fuera de pantalla y con movimiento reducido. Las poses discretas añadidas al rediseño ya no se aplican a ORBIT; el lenguaje LCD se conserva en los instrumentos LCD y el botón final.

### Sistema LCD reutilizado

`lcdDisplayMarkup()` crea una matriz fija de **12 × 16**, números de siete segmentos, barras y ENTER dibujado con píxeles. Los segmentos existen incluso apagados.

| `data-lcd-state` | Opacidad | Interpretación |
| --- | --- | --- |
| `on` | .94 | Encendido |
| `dim` | .35 | Atenuado |
| `ghost` | .12 | Huella de pose anterior |
| `off` | .065 | Apagado, ligeramente visible |

En código los valores van en minúsculas. No añadas transiciones suaves de opacidad a estos segmentos. Las matrices usan `shape-rendering: crispEdges`.

Dos controles comparten este lenguaje:

1. **Botón final:** secuencia automática cada 120 ms, o 100 ms al interactuar. Hover/foco activa ENTER; el clic reproduce un boot breve antes de cambiar de universo.
2. **Intro (`data-lcd-mode="scene"`):** `driveLCD()` selecciona un frame según el scroll. No tiene reloj automático y retrocede al subir.

El reloj del botón se detiene fuera de pantalla, con pestaña oculta o con movimiento reducido. `data-lcd-running` permite inspeccionar si está activo; el LCD dirigido por scroll debe mostrar `false`.

ORBIT vuelve a usar su SVG original y sus animaciones CSS. Sus datos son ficción, no telemetría real.

Los marcos y captions son la capa impresa. Los indicadores son la capa electrónica. ART conserva su lenguaje material y su barra de progreso lisa.

## 7. Portada, navegación y cursor

`selectWorld()` bloquea transiciones superpuestas, limpia el recorrido anterior, restaura temporalmente la portada, expande la mitad elegida, la mueve al primer panel, inicia el recorrido y actualiza hash/foco.

`resetToHome()` restaura la portada dividida. About y Contact llevan a sus secciones. El historial permite volver a rutas de universo.

Existe un único cursor:

- ART: naranja, circular y amortiguado.
- DEV: verde técnico; pulsación discreta sin glow ni rebote genérico.
- LCD final: desplazamiento por pasos de retícula.
- Logo: sin cursor personalizado ni animación hover especial.

La física se detiene en reposo. El cursor VIEW solo se utiliza fuera de los universos activos: no reaparece al mover el ratón dentro de ART o DIGITAL PROPS. El aviso SCROLL inicial se conserva y desaparece al comenzar el desplazamiento. Al entrar se ocultan también EXPLORE y las indicaciones SCROLL / CONTENT de la portada expandida; vuelven al regresar al inicio.

La entrada de títulos dura menos de un segundo aproximadamente y no bloquea controles. Si se entra inmediatamente en un universo, se revierte para no competir con la expansión.

Three.js solo dibuja una geometría decorativa pequeña. Su DPR está limitado a 1.5; se inicia en pantallas grandes y se pausa fuera de portada o con pestaña oculta. No controla proyectos ni navegación. Su fallo no debe bloquear el sitio.

## 8. About y filmografía

About está en `index.html`: perspectiva, diseño, trabajo manual, pantallas/código y producción. `about.js` relaciona sus cinco capítulos con ilustraciones. En escritorio grande se fija la zona visual; en móvil se insertan ilustraciones en la lectura.

La filmografía parte de `.credits-table`, también en `index.html`. Actualmente contiene **13 producciones**. El JavaScript lee las filas para construir posters y fichas; no se mantienen dos listas independientes.

El cartel inicial de **Murderbot** se precarga desde el `<head>` con prioridad alta. Al construir la galería se decodifica anticipadamente la imagen exacta que se mostrará. Así la descarga no espera a llegar a filmografía. Los posters vecinos también se preparan al cambiar de crédito; no se da prioridad alta a toda la colección.

En escritorio se combinan listado y cartel. En móvil el poster es protagonista, con información debajo y tabla completa desplegable. Hay botones, flechas de teclado, gestos laterales y cartel alternativo para Operación Barrio Inglés.

Al salir el título «Selected credits», una superficie interior se expande con respuesta amortiguada. Se transforma el interior, no el elemento cuya geometría controla el pin, para mantener estable la distancia de scroll.

La composición desktop llega al 94 % de ancho, con máximo de 1440 px, y se adapta a la altura disponible. En móvil, el pin de créditos exige al menos 650 px de alto y movimiento permitido. En pantalla baja o reduced motion se navega directamente entre carteles.

## 9. Móvil y accesibilidad

Para anchos **<= 700px**: lectura vertical, movimientos laterales reversibles donde corresponden, imágenes grandes, sin WebGL ni hover obligatorio. La pausa final móvil solo se fija si cabe el panel y se permite movimiento.

La barra de espera final solo se muestra cuando existe esa pausa fijada. Se omite con movimiento reducido, sin GSAP o cuando el panel móvil no cabe completo; no se exige llenar una barra en la lectura vertical de respaldo.

Con `prefers-reduced-motion: reduce`, se evita el recorrido horizontal fijado, las nuevas timelines de scrub y los loops; el contenido se muestra directamente. La navegación sigue disponible. El GIF del logo necesita una alternativa estática para detener también su animación interna: CSS no pausa los fotogramas de un GIF.

`Tab` recorre controles, `Enter` activa, y la galería responde a flechas cuando tiene foco. Hay skip link al contenido y foco visible en controles. Los títulos enfocados tras navegar no dibujan el contorno que antes atravesaba la portada. Las decoraciones LCD/SVG no se anuncian como cientos de elementos al lector de pantalla.

| Si falta… | Resultado |
| --- | --- |
| GSAP o ScrollTrigger | Recorridos verticales y navegación funcional |
| Three.js | Solo desaparece el adorno WebGL |
| Todo JavaScript | Portada, About, tabla y contacto permanecen en HTML; no se construyen los recorridos de proyectos |

El fallback sin GSAP sigue necesitando JavaScript. No equivale a un sitio completamente funcional sin JS.

## 10. Cómo editar contenido

### Textos de portada y About

Busca la frase en `index.html` con `Ctrl + F`. Sustituye el texto manteniendo etiquetas: `<br>` es salto de línea y `<i>` activa cursiva editorial.

### Proyectos de los recorridos

Busca `scenes` en `main.js`. Cada entrada combina nombre y HTML:

```js
['INTRO', '<h2>Un título.<br><i>Otra línea.</i></h2><p>Descripción.</p>']
```

Conserva comas, corchetes y comillas. Un apóstrofo dentro de una cadena delimitada por comillas simples debe escaparse (`\'`) o escribirse usando una cadena delimitada por backticks. No cambies clases sin revisar sus selectores CSS/JS.

### Añadir capítulos

Es más delicado que cambiar texto. Además de `main.js`, revisa los nombres/totales en `scrollytelling.js`, el total del indicador en HTML, Next World, los índices de `scene-timelines.js`, el botón de avance y la pausa final. Para mantenimiento inicial es más seguro conservar siete capítulos y sustituir su contenido.

### Colores y fuentes

En `css/variables.css`:

```css
--bg: #e9e7df;      /* Fondo editorial */
--fg: #24251f;      /* Tinta */
--dark: #20241f;    /* Fondo DEV */
--accent: #d94b2b;  /* Naranja ART */
--green: #c1d99b;   /* Verde técnico */
```

LCD tiene `--lcd-paper`, `--lcd-ink` y `--lcd-shell` en `lcd.css`. La barra tiene `--meter-*` en `journey-cover.css`. Algunas ilustraciones conservan colores directos, por lo que una variable no recolorea absolutamente todo.

Se combinan JAK local, sans del sistema, monospace/Courier y Georgia. Conserva la licencia de JAK. Prueba cambios tipográficos en portada dividida, expandida y móvil.

### Terminal

Edita `.flight-deck` en HTML y `digital-props.css`. Conserva las clases `.nav-target`, `.nav-horizon` y `.thrust-bars` para sus animaciones CSS originales. Para los instrumentos LCD independientes edita `lcd-display.js`; no añadas interpolación CSS suave a sus píxeles.

### Añadir o sustituir un crédito

1. Copia el cartel a `assets/posters/`, con nombre sencillo en minúsculas y sin espacios.
2. Busca una fila `<tr data-poster="...">` de `.credits-table`.
3. Duplica la fila completa o edita una existente.
4. Cambia `data-poster` y el `src` de su imagen: ambos deben apuntar al archivo correcto.
5. Actualiza fecha, título, productora, director y texto alternativo `alt`.
6. Para otra versión usa `data-poster-alt="assets/posters/otra-version.jpg"`.
7. Si cambia el total, actualiza «13 productions» y contadores iniciales en HTML, y «VIEW ALL 13 CREDITS» en `mobile-filmography.js`.

El carrusel cuenta filas, pero algunos textos de resumen siguen escritos a mano. Conserva `loading="lazy"` y `decoding="async"`. La implementación no verifica la exactitud profesional de las fechas y créditos aportados.

### Contacto

About ya contiene `mailto:diegoperezobrero@gmail.com`. El botón de Contact todavía abre una nota de prototipo. Si lo conviertes en enlace de correo, adapta también el listener de `navigation.js` que espera un botón y esa nota, para no provocar un error de JavaScript.

### Rutas e imágenes

Usa `assets/posters/kaos.webp`, no `/assets/posters/kaos.webp`: la barra inicial buscaría en la raíz del dominio y puede fallar bajo `/web-portfolio-dpo/`. Pages distingue mayúsculas. `Poster.jpg` y `poster.jpg` no son necesariamente la misma ruta aunque Windows lo permita.

No borres un asset solo porque no lo veas en HTML: puede utilizarse desde CSS o JS.

## 11. Publicación

Pages está configurado para `SelfMimesis/web-portfolio-dpo`, rama `main`, carpeta raíz `/`, sin build. Conserva `.nojekyll`.

### Con GitHub Desktop

1. Clona el repositorio si todavía no tienes un clon local.
2. Abre esa carpeta en VS Code. Evita confundir dos copias distintas.
3. Revisa los cambios en GitHub Desktop.
4. Crea un commit descriptivo.
5. Pulsa **Push origin**.
6. Espera al despliegue en Actions y revisa la URL pública.

Si la carpeta actual no contiene `.git`, tener los archivos no la convierte en un clon. Clona en otra carpeta y lleva allí los archivos del proyecto que quieras actualizar.

### Con Git instalado

Desde un clon del repositorio, después de revisar qué ha cambiado:

```bash
git status
git diff
git add index.html README.md css js assets docs .nojekyll .gitignore
git commit -m "Actualiza el portfolio"
git push origin main
```

No uses `push --force` para una actualización normal. Si hay cambios remotos, sincroniza y revisa antes de continuar.

La configuración está en Settings → Pages: origen **Deploy from a branch**, `main`, `/ (root)`. No hace falta `dist`. En el trabajo asistido anterior se utilizó una herramienta local de GitHub; no es una dependencia del sitio ni necesitas distribuirla.

Sube HTML, CSS, JS, assets, `.nojekyll`, `.gitignore`, README y docs. No subas credenciales, `.publish-tools/`, perfiles de Chrome, ZIPs o `.preview-*`.

### Verlo en el móvil

Abre la URL pública. No uses `localhost` del ordenador en el teléfono: «localhost» significa ese dispositivo. Pages evita configurar acceso por IP local. Si los cambios no aparecen, comprueba el despliegue y recarga sin caché.

## 12. Pruebas y solución de problemas

### Comprobación después de cada cambio

1. Servir por HTTP y abrir Console en DevTools (`F12`).
2. Recorrer los siete capítulos de ART hacia abajo y hacia arriba.
3. Repetir en DEV, especialmente Cover → Intro → Selected Work.
4. Comprobar que la portada original sigue al entrar.
5. Comprobar pausa final, botón lateral y cambio a About.
6. Cambiar universo desde mitad de recorrido varias veces.
7. Pulsar logo desde mitad de recorrido y volver a entrar.
8. Verificar que About empieza después de la pista horizontal.
9. Probar todos los carteles, teclado, botones y versión alternativa.
10. Probar 390px de ancho, pantalla baja y cambio de orientación.
11. Activar reduced motion y repetir navegación.
12. Usar Tab/Enter sin ratón.
13. Bloquear GSAP temporalmente y recargar para comprobar el fallback.
14. Comprobar la web pública después de publicar.

### Inspecciones útiles en consola

Estas expresiones solo consultan información:

```js
window.ScrollTrigger?.getAll().length
document.querySelectorAll('.pin-spacer').length
document.querySelectorAll('.scene-registration').length
[...document.querySelectorAll('.lcd-display')].map(el => ({
  mode: el.dataset.lcdMode,
  running: el.dataset.lcdRunning
}))
```

No todo pin-spacer es un fallo: About y filmografía tienen pins legítimos. El problema es que crezcan al repetir la misma navegación o quede un pin del universo oculto al volver al inicio. El marco narrativo solo debe existir cuando corresponde a DEV.

### Evidencia de rendimiento y alcance

En la comprobación desktop 1440 × 900, DEV mantuvo siete paneles y 20 ScrollTriggers; al volver a portada se recuperaron 19. No se añadieron triggers desktop por cada escena del nuevo tramo. Se comprobaron ambos universos, recorrido inverso, pausa final, descenso y cambios repetidos sin crecimiento de triggers.

La muestra comparativa de scroll de 2.4 segundos produjo 145 frames y ninguno por encima de 34 ms, antes y en la primera implementación, en Chrome headless. **No garantiza 60fps en dispositivos físicos.** Las verificaciones adicionales y sus límites se registran en [la auditoría](docs/SCROLL-AUDIT.md).

| Problema | Revisar |
| --- | --- |
| No aparecen capítulos | Servidor HTTP, sintaxis de `main.js`, módulos 404 |
| Desktop se ve vertical | Reduced motion o CDN de GSAP/ScrollTrigger bloqueado |
| About entra pronto | Distancia del pin anterior, refreshPriority y cleanup |
| Queda espacio vacío al cambiar | Pins sin revertir o geometría modificada |
| Imagen falla solo en Pages | Ruta, mayúsculas y archivo subido |
| ART tiene textura LCD | Regla `data-world="art"` de `journey-cover.css` |
| Cursor no aparece en móvil | Es lo previsto |
| Three.js no aparece | Es opcional; móvil, preferencias y viewport lo desactivan |
| Cambios no publicados | Falta push, despliegue pendiente o caché |
| Contact no abre correo | Su botón aún muestra una nota de prototipo |

## 13. Historial de mejoras

Este registro describe el código conservado; no atribuye fechas exactas a cada iteración anterior.

### Realizado anteriormente

- Dos universos sin migración a framework, siete escenas y pin horizontal.
- Orden izquierda → derecha y portada expandida conservada como primer capítulo.
- Prioridad del pin para impedir la activación prematura de About.
- Cursor naranja/verde amortiguado y transformación en aviso de scroll.
- Logo sin hover especial: la propuesta anterior de forma de casa fue sustituida por la petición de quitar ese efecto.
- Títulos sin el contorno no deseado y controles con foco visible.
- Botón de cambio de universo en el extremo derecho a toda altura.
- LCD físico con ENTER, boot, hover/foco y pausa fuera de pantalla.
- Pausa final y conversión reversible del lateral en About Me.
- Línea inferior extendida y centrada con el indicador.
- About de cinco capítulos y escenas móviles con entrada/salida lateral.
- Filmografía de 13 producciones: carteles grandes, ficha móvil, gestos, teclado, listado y variante.
- Expansión reversible de filmografía al salir su título.
- Publicación estática en GitHub Pages sin build.

### Realizado en esta evolución

- Auditoría antes de modificar la arquitectura.
- `scene-timelines.js` para el tramo inicial de DEV.
- Marco continuo, pausa tipográfica y cambios de escala contenidos.
- Intro con matriz LCD existente, dirigida por scroll y sin reloj propio.
- Se ensayaron poses físicas ORBIT y un rediseño de terminal; ambos se retiraron por petición posterior para recuperar la versión original.
- Progreso cacheado y cambios de capítulo sin escrituras repetidas innecesarias.
- Loops CSS pausados fuera de pantalla y gate explícito de viewport en Three.js.
- Cursor oculto durante scroll; pulsación digital sin glow ni rebote genérico.
- Entrada de portada más breve y cancelable al navegar inmediatamente.
- Limpieza del cursor protegida cuando GSAP no está disponible.
- **Barra ART restaurada a fondo liso y naranja continuo; LCD solo en DIGITAL PROPS.**
- README ampliado para explicar uso, edición, arquitectura y mantenimiento.
- Precarga prioritaria y decodificación anticipada del primer cartel, Murderbot.
- Corrección del índice móvil del último capítulo: se conserva la lista de artículos aunque el pin los envuelva en un spacer.
- Pausa final ampliada y barra reversible en el botón lateral, sincronizada con el inicio del descenso vertical.
- VIEW desactivado dentro de los universos; EXPLORE y SCROLL / CONTENT ocultos en la portada expandida.
- Terminal ORBIT restaurada desde `f666c64`, incluida su posición original en escritorio y móvil, sin deshacer las demás mejoras.

No se ha reemplazado el sistema narrativo ni aplicado una nueva coreografía a todos los capítulos. Los helpers de rendimiento sí benefician a ambos universos.

## 14. Pendientes y límites

- `portfolio-card.png` pesa unos 7 MB y el GIF del logo unos 1 MB: conviene preparar versiones optimizadas y comparar calidad.
- El GIF necesita alternativa estática para respetar completamente reduced motion a nivel de asset.
- Contact sigue siendo un botón de prototipo, aunque About tiene correo.
- Los proyectos del recorrido están etiquetados como conceptos; sustituir ejemplos por material definitivo cuando corresponda.
- Las cadenas HTML de `main.js` exigen cuidar comillas y etiquetas.
- Algunos contadores de créditos se actualizan a mano.
- La nueva narrativa se concentra en tres escenas de DEV; extenderla exige revisar cada capítulo.
- El contenido visible está principalmente en inglés, sin selector de idioma.
- No hay backend, CMS, formulario de envío ni base de datos.
- La animación completa depende de CDN; no existe modo offline completo ni service worker.

## 15. Glosario

| Término | Significado sencillo |
| --- | --- |
| DOM | Árbol de elementos que compone la página |
| Módulo ES | JS que importa/exporta funciones de otros archivos |
| GSAP | Librería de animación |
| ScrollTrigger | Relaciona scroll, animación y fijación |
| Timeline | Secuencia organizada de cambios visuales |
| Pin | Zona mantenida fija durante un tramo |
| Scrub | Animación que sigue el avance del scroll |
| Viewport | Área visible de la ventana |
| Breakpoint | Tamaño a partir del cual cambia el diseño |
| Transform | Mover/escalar/rotar sin reorganizar el documento |
| Reflow / layout | Cálculo de tamaños y posiciones |
| Inert | Impide interactuar con una zona temporalmente fuera de uso |
| Cleanup / revert | Retirar efectos y restaurar el estado anterior |
| CDN | Servidor externo que entrega una librería |
| Commit | Versión guardada en Git |
| Push | Enviar cambios al repositorio remoto |
| Deploy | Publicar una versión visible en internet |
| Fallback | Alternativa cuando falta una capacidad |
| Reduced motion | Preferencia de accesibilidad que reduce movimiento |

Para mantenimiento habitual empieza por HTML, `main.js` y el CSS específico de la zona. Cambia cálculos de pinning solo cuando el problema lo requiera.
