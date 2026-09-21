# Diego — Art & Digital Props

Prototipo estático editorial en HTML, CSS y JavaScript ES Modules. No requiere compilación ni frameworks.

## Abrir

Sirve esta carpeta mediante un servidor HTTP local (por ejemplo, la extensión Live Server de VS Code) y abre `index.html`. ES Modules necesita HTTP; no abrir mediante `file://`.

GSAP 3.13.0, ScrollTrigger y Three.js 0.180.0 se cargan desde jsDelivr. Se necesita conexión para las animaciones. Si GSAP no carga, los recorridos funcionan verticalmente. Three.js es opcional y sus fallos no bloquean la web.

## GitHub Pages

Repositorio: `SelfMimesis/web-portfolio-dpo`. Subir `index.html`, `css/`, `js/`, `assets/` y `.nojekyll` a la raíz de `main`. En Settings → Pages, usar **Deploy from a branch → main → / (root)**. Las rutas son relativas y funcionan bajo `/web-portfolio-dpo/`; no se requiere compilación. No subir perfiles de navegador, capturas ni scripts de prueba locales.

## Recorridos

- ART y DIGITAL PROPS avanzan por una fila ordenada de izquierda a derecha, como el tramo horizontal de https://benjamincreative.me/: al bajar, el contenido actual sale por la izquierda y el siguiente entra por la derecha. Las dos pistas usan el mismo sentido y tienen siete escenas.
- Al entrar, el cursor se transforma en una indicación «SCROLL ↓» y la mitad seleccionada se expande a todo el ancho. La indicación permanece hasta iniciar el scroll y entonces se desvanece suavemente. Se conserva el mismo DOM de la portada como primera escena; al volver al inicio, se restaura la portada dividida. La terminal ORBIT original se mantiene.
- El último panel tiene un acceso vertical a la derecha, desde debajo de la cabecera hasta el borde inferior. El acceso a Digital Props incorpora un LCD original, con segmentos fijos, estados discretos a 8–10 Hz y letras ENTER dibujadas en píxeles que se activan con hover o foco. El LCD solo existe en ese botón, se pausa fuera de pantalla y respeta movimiento reducido.
- El pin horizontal se calcula antes que los eventos de About Me (`refreshPriority: 100`) para incluir su distancia en las posiciones de las secciones posteriores, también al cambiar de universo.
- ScrollTrigger calcula la distancia a partir del ancho real de cada pista. El control de siguiente escena permite recorrerla sin rueda de ratón.
- El logo restablece la portada. La navegación permite cambiar de universo directamente. Los enlaces About y Contact llevan al contenido posterior.
- Móvil (hasta 700 px) y movimiento reducido usan escenas verticales. En móvil, el último panel tiene una pausa breve si cabe completo en pantalla; con movimiento reducido no se fija. El cursor solo aparece con ratón. Three.js es una capa opcional para pantallas grandes y pausa fuera de portada o con la pestaña oculta.
- El cursor cambia entre círculo naranja (ART) y forma verde de esquinas redondeadas (DIGITAL PROPS). GSAP anima la paleta, la forma y la pulsación; un muelle amortiguado sigue el ratón y deforma el contorno según su velocidad sin girar el texto. Su actualización se detiene al quedar en reposo o al ocultarse.
- El archivo de arte responde a hover, foco y clic. Los props digitales muestran detalles desplegables.
- Al terminar el recorrido horizontal hay 260–520 px adicionales de scroll con el último panel inmóvil. Al soltar el pin, el lateral cambia a «About Me ↓» y su enlace apunta a About; al retroceder recupera el destino original. El salto de siguiente escena conserva la distancia real de cada panel.
- El logo de inicio no activa animaciones de hover ni el cursor personalizado. Los títulos reciben foco al entrar sin dibujar un contorno; los controles mantienen su foco de teclado.
- La línea inferior atraviesa todo el recorrido y pasa por el centro del indicador de progreso. Su caja usa textura LCD y segmentos discretos, con papel cálido en ART y verde en DIGITAL PROPS.
- Al salir «Selected credits» por debajo de la cabecera, la filmografía se expande con un resorte amortiguado reversible. En escritorio ocupa hasta el 94 % del ancho (máximo 1440 px) y el 86 % de la altura disponible. La animación se aplica dentro del pin para mantener estables la tabla, los carteles y sus controles; se omite con movimiento reducido.
- En móvil, las escenas y los capítulos de About Me entran por la izquierda, mantienen una pausa de lectura y salen por la derecha. El recorrido se invierte al subir; las ilustraciones tienen una capa de movimiento independiente.
- La filmografía móvil muestra un cartel grande con su ficha debajo. Se recorre mediante scroll, gestos laterales, flechas o teclado; el listado completo se puede desplegar al final. En pantallas de menos de 650 px de alto o con movimiento reducido, la galería no se fija al viewport.
- DIGITAL PROPS presenta interfaces que aparecen dentro de la ficción: la cabina espacial ORBIT, apps de móvil, terminales y monitores. Son estudios visuales conceptuales, no herramientas de gestión de producción.

## Personalización

Diego es un nombre provisional inferido de la carpeta local. Todos los proyectos son conceptos ficticios, expresamente etiquetados. Cambiar los datos en `index.html` y las escenas en `js/main.js`. El botón de contacto muestra una nota de prototipo: sustituirlo por el email real antes de publicar.

Las composiciones son gráficos HTML/CSS locales, sin fotografías externas ni fuentes descargadas. Las carpetas `assets/` están preparadas para material real.

Referencia técnica: https://gsap.com/docs/v3/Plugins/ScrollTrigger/

## Revisión manual

1. Abrir ART, comprobar la transformación del cursor en «SCROLL ↓» y la expansión de la portada; empezar a bajar y comprobar el desvanecimiento. Avanzar las siete escenas y comprobar que la siguiente entra por la derecha. About Me no debe activarse durante el recorrido horizontal.
2. Usar el botón final para entrar en DIGITAL PROPS y comprobar COVER → INTRO → SELECTED WORK → INTERACTION → PLAYBACK → ARCHIVE → NEXT WORLD con el mismo sentido que ART. Comprobar el hover de ENTER y repetir en sentido inverso.
3. Volver al logo desde mitad del recorrido y repetir sin espacios de pinning residuales.
4. Probar historial, About, Contact, los proyectos de archivo y los desplegables.
5. Repetir con teclado, viewport móvil y `prefers-reduced-motion: reduce`.
6. Bloquear los CDN y comprobar el recorrido vertical de respaldo.
7. Desde el cierre de cada recorrido, continuar a About Me y comprobar que aparece su introducción antes de los capítulos; volver hacia arriba y verificar que no quedan paneles fijados sobre el recorrido horizontal.
8. En móvil, bajar y subir por un capítulo para comprobar las entradas laterales reversibles. En filmografía, probar gestos laterales, flechas, cartel alternativo y listado completo; cambiar después a escritorio para verificar que vuelve la composición de tabla y cartel.
