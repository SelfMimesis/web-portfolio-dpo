# Git y reinicio del capítulo 02

El commit `2c3751b` dejó el capítulo 02 de ART (GRAPHIC PROPS) vacío, con su cabecera y su lugar en la navegación. Los materiales originales de `assets/graphic-props/` permanecen disponibles para reutilizarlos. Después se ha implementado la [introducción Muybridge](MUYBRIDGE-INTRO.md) en esta misma rama.

La nueva introducción se monta dentro de la portada ART desde `js/main.js` y se desarrolla en `js/muybridge-intro.js` y `css/muybridge-intro.css`. La versión anterior, como capítulo separado, se conserva en `8f3c11c`.

Verificación del reinicio realizada por HTTP en Chrome: escritorio 1440 × 900, móvil 390 × 844 y escritorio con movimiento reducido. Su prueba de capítulo vacío se conserva en el commit `2c3751b`; la prueba vigente es `scripts/checks/.preview-muybridge.js`.

## Puntos de recuperación

- Rama de trabajo: `capitulo-02-reinicio`.
- Versión completa anterior: etiqueta `archivo/capitulo-02-original-2026-09-23` (commit `4c82229`).
- `main` conserva ese estado anterior y parte del historial real de `origin/main`.
- Remoto: `https://github.com/SelfMimesis/web-portfolio-dpo.git`.
- Copia íntegra anterior a los cambios: `D:\diego\web\PORTFOLIO-BACKUPS\portfolio-antes-reinicio-capitulo-02-2026-09-23-202353.zip`.
- ZIP verificado: 246 archivos, comparados por tamaño y SHA-256.
- SHA-256 del ZIP: `0177FE42399250BCB808D8BDD6D30178D9BD19DF957BB314E79F0EC303F80D6D`.

El ZIP incluye también herramientas y configuración local privada. Es una copia de recuperación local; no debe subirse al repositorio público. Git excluye esas carpetas mediante `.gitignore`.

## Guardar cambios

Abre una terminal nueva para que reconozca Git. Si VS Code estaba abierto durante la instalación, reinícialo.

```powershell
git status
git diff
git add --all
git commit -m "Describe el cambio del capítulo 02"
```

Los commits se guardan localmente. No se ha hecho push ni cambiado la web publicada.

## Consultar la versión anterior sin cambiar el trabajo nuevo

```powershell
git worktree add ../PORTFOLIO-capitulo-02-original archivo/capitulo-02-original-2026-09-23
```

Esto crea otra carpeta con la versión anterior completa. Para recuperar un archivo concreto en la rama nueva:

```powershell
git restore --source archivo/capitulo-02-original-2026-09-23 -- js/graphic-story.js
```

`restore` sustituye ese archivo: guarda antes los cambios que quieras conservar. La animación antigua requiere también sus estilos, módulos auxiliares y conexiones de arranque/scroll; usa la copia completa para verla funcionar tal como estaba.

## Copia transportable de Git

Al finalizar el reinicio se guarda `D:\diego\web\PORTFOLIO-BACKUPS\portfolio-capitulo-02-2026-09-23.bundle`, con todas las ramas y etiquetas locales. Se puede recuperar en una carpeta nueva:

```powershell
git clone -b capitulo-02-reinicio D:/diego/web/PORTFOLIO-BACKUPS/portfolio-capitulo-02-2026-09-23.bundle PORTFOLIO-recuperado
```

Para renovar esa copia tras futuros commits:

```powershell
git bundle create D:/diego/web/PORTFOLIO-BACKUPS/portfolio-capitulo-02-2026-09-23.bundle --all
git bundle verify D:/diego/web/PORTFOLIO-BACKUPS/portfolio-capitulo-02-2026-09-23.bundle
```
