# ANTboriginals — Landing page

Sitio estático (HTML + CSS + JS) para GitHub Pages.

## Estructura

```
antboriginals/
├── index.html
├── brand-manual.html
├── privacy-policy.html
├── terms-of-use.html
├── robots.txt
├── sitemap.xml
├── css/
│   ├── style.css          # estilos compartidos por todas las páginas
│   └── brand-manual.css   # estilos propios del manual de marca
├── js/
│   ├── main.js            # punto de entrada: inicializa cada módulo
│   ├── config.js          # correo de contacto y endpoint del formulario
│   ├── lib/motion.js      # utilidades de animación y "reducir movimiento"
│   ├── modules/           # un archivo por componente (nav, sticker, slider, formulario...)
│   └── brand-manual.js    # interacciones del manual de marca
├── assets/
└── .nojekyll
```

Fuera de `antboriginals/` están el `Dockerfile`, `deploy/nginx.conf` y `fly.toml` para publicar en Fly.io, y el workflow de GitHub Pages en `.github/workflows/`.

## Correr en local

Los scripts son módulos ES, así que el sitio necesita un servidor (abrir el HTML con doble clic no carga el JS):

```
cd antboriginals
python -m http.server 8000
```

Luego abrir http://localhost:8000.

## Publicar en Fly.io

Desde la raíz del repo: `fly deploy`. La imagen sirve `antboriginals/` con nginx sin privilegios, cabeceras de seguridad y caché: HTML, CSS y JS se revalidan en cada visita; imágenes y videos se guardan 7 días. Al cambiar CSS o JS, subir el `?v=` de los enlaces en las páginas.

## Publicar en GitHub Pages
Todas las rutas son relativas, así que funciona igual en un dominio propio o en una subruta de GitHub Pages.

## Qué debes editar antes de publicar

- **Correo y formulario** → `js/config.js`:
  - `CONTACT_EMAIL`: correo que se muestra si el envío falla.
  - `FORM_ENDPOINT`: formulario de Formspree; vacío abre el cliente de correo del visitante.
- **Redes sociales** → `index.html`, sección del footer (`class="social"`).
- **Textos** → todo el contenido está directamente en `index.html`.
- **Colores** → variables al inicio de `css/style.css` (`:root`).
- **Dominio** → `https://antboriginals.com/` ya está definido en las etiquetas `canonical`, Open Graph, Twitter Card y JSON-LD de las cuatro páginas, y en `robots.txt` y `sitemap.xml`.
- **Imagen de Open Graph** → `assets/og-image.jpg` (1200×630, creada a partir de la pieza "Built beyond the expected" del manual) se usa en `og:image` y `twitter:image` de todas las páginas.

## Video de fondo del hero

`assets/hero-background.mp4` se reproduce en loop, silenciado, detrás del título del hero (`index.html`), con `assets/hero-poster.jpg` como imagen de respaldo mientras carga o si el navegador no puede reproducir video. Ya viene sin audio y recomprimido a ~7.5 MB (el original pesaba 36 MB) — por debajo del límite de 100 MB por archivo de GitHub, pero sigue siendo el archivo más pesado del sitio. Para usuarios con "reducir movimiento" activado en el sistema, el sitio muestra el poster estático en vez del video (`css/style.css` + `js/modules/hero-video.js`).

## Sticker, loader y tarjetas de servicios

- **Sticker interactivo** (`assets/sticker-holo.webp`): en el hero se puede arrastrar con el mouse/dedo; al agarrarlo se despega la esquina y al soltarlo se vuelve a pegar. Al hacer scroll se despega, viaja al bloque "From idea to asset" y se transforma (gira de canto, se desenfoca y aparecen los cubos uno tras otro) en el loader de cubos. Lógica en `js/modules/sticker.js`, estilos en `css/style.css` (reglas `.sticker` y `.v3-cube`). Colores del loader: variables `--cube-a` / `--cube-b` en `:root`.
- **Videos** en Art & Design, Publishing & Editorial, Fashion y Media & Content (ahora en el escenario de servicios, ver abajo): `assets/service-*.mp4` (+ poster). Cargan y reproducen solo cuando la tarjeta es visible.
- **Animaciones CSS** en las otras cuatro tarjetas (IP, Business, Marketing, Brand), sin archivos extra.
- Con "reducir movimiento" activado nada se anima: se ven los posters y el sticker queda quieto.

## Estructura de la página (según el video de instrucciones)

1. **Hero** — video de fondo + slogan; el botón ahora es "Scroll down" (el efecto rojo que pasa al logo ANTB al scrollear se mantiene).
2. **FROM IDEA TO ASSET** — texto centrado; el sticker se convierte en el loader de cubos a la izquierda y se duplica (espejo) a la derecha.
3. **Services** — escenario fijo (pin) donde cada servicio con video sube pequeño con el degradado del loader, se aclara y deja paso al siguiente; debajo, un slider para los cuatro servicios sin video (flechas, puntos, arrastre, teclado, autoplay). En móvil, en pantallas bajas (o con mucho zoom) y con "reducir movimiento" los videos quedan apilados. Lógica en `js/modules/services-stage.js` y `js/modules/slider.js`.
4. **Software** — servicios tech en tarjetas y el proceso de trabajo en cuatro pasos.
5. **Ownership is part of the work** y **Contacto** — estáticos; el campo de mensaje crece solo al escribir.

## Manual de marca (`brand-manual.html`)

Página propia con la versión de exhibición del manual (PDF incluido en `assets/brand/`, con botón de descarga). Usa `css/brand-manual.css` y `js/brand-manual.js`, y las imágenes recortadas del PDF en `assets/brand/`. Tipografía: **Helvetica Neue** (Bold, Regular, Ultra Light) — viene con macOS/iOS; en Windows/Android cae a Helvetica/Arial porque no se puede incrustar sin licencia. Animaciones: progreso de lectura, luz que sigue el cursor, titulares palabra por palabra, ticker de disciplinas, triángulo de la voz, muestras de color (clic para copiar HEX), probador tipográfico y grilla "u". Con "reducir movimiento" todo queda estático. Enlazada desde el menú ("Brand") de todas las páginas y desde `sitemap.xml`.

## Páginas legales

`privacy-policy.html` y `terms-of-use.html` son plantillas de Política de Privacidad y Términos de Uso enlazadas desde el footer de cada página. La política de privacidad incluye un apartado dedicado al marco costarricense (Ley N.° 8968 y PRODHAB): consentimiento informado, proporcionalidad, seguridad, confidencialidad y los derechos de acceso, rectificación y supresión. Ambas páginas son contenido.
