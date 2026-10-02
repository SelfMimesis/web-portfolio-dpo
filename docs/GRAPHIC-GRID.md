# Reticula de Graphic

`css/graphic-grid.css` se carga despues de las hojas de cada escena y define su composicion comun. Las animaciones siguen viviendo en los modulos existentes.

- Marco: 6vw a cada lado, centrado y con un ancho maximo de 1880px. En movil, margen minimo de 20px.
- Reticula: 12 columnas flexibles, separadas por `--graphic-gap` (20-48px). Todos los tracks usan `minmax(0, 1fr)` para que una fotografia animada no ensanche la reticula.
- Ritmo: unidad de 8px; separaciones de 16/24px para imagenes, etiquetas y pies.
- Tipografia: `--graphic-title`, `--graphic-body` y `--graphic-detail`, con ajustes para pantallas bajas y flujo vertical.

| Composicion | Columnas |
| --- | --- |
| Intro Muybridge | Imagen 7 / relato 5 |
| Props y sobres | Relato 5 / objeto 7 |
| Portada Virgenes | Titulo y sinopsis 7 / fotografia 5 |
| Color y libertad | Relato 4 (maximo 40ch) / fotografias 8, expandiendose hasta el marco |
| Atrezzo, Pihama y Torremolinos | Imagenes 6 / relato 6 |
| Capturas | 12, con todos los fotogramas dentro del mismo marco |

Las fotografias conservan sus proporciones. El carrusel de investigacion calcula su expansion con la altura real disponible y el espacio de sus puntos, sin offsets de viewport independientes. En movil y con movimiento reducido se mantiene el flujo natural y el mismo margen exterior.

Color y libertad comienza con dos fotos grandes superpuestas y bordes blancos de 8px. Entre el 10% y el 32% de su recorrido se desvanece el texto, desaparecen los bordes y ambas fotos se separan en una galeria de igual altura. Una sola columna de puntos a la derecha controla las dos series por progreso normalizado; responde a clic y a las flechas verticales. La galeria empieza a cambiar las fotografias cuando termina esa apertura. Con movimiento reducido, las fotografias se muestran completas en flujo natural.

El escenario de pelicula publica `--film-space-height` al medir cada layout. El mosaico de atrezzo limita su ancho con esa altura para respetar el pie de pagina incluso en pantallas anchas. Los sobres calculan la escala de sus etiquetas en ambos ejes para que quepan en sus bolsillos al cerrar.

Cambiar los tokens de esta hoja actualiza el conjunto; evitar introducir nuevos margenes en vw o anchos maximos aislados en las escenas. Los titulos especiales (Selected Films y el logotipo original de Virgenes) conservan su jerarquia propia.
