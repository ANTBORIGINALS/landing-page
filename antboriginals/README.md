# ANTboriginals — Landing page

Sitio estático (HTML + CSS + JS, sin dependencias ni build) listo para GitHub Pages.

## Estructura

```
antboriginals/
├── index.html
├── privacy-policy.html
├── terms-of-use.html
├── robots.txt
├── sitemap.xml
├── css/style.css
├── js/main.js
├── assets/
│   ├── hand-mark.png      # logo de la mano (fondo transparente)
│   ├── wordmark-dark.png  # wordmark ANTB ORIGINALS para fondo oscuro
│   └── favicon.png
└── .nojekyll
```

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `antboriginals`).
2. Sube **el contenido de esta carpeta** a la raíz del repositorio (`index.html` debe quedar en la raíz).
3. En el repositorio: **Settings → Pages → Build and deployment**.
4. En *Source* elige **Deploy from a branch**, rama `main`, carpeta `/ (root)` y guarda.
5. En uno o dos minutos el sitio estará en `https://TU-USUARIO.github.io/antboriginals/`.

Todas las rutas son relativas, así que funciona igual en un dominio propio o en una subruta de GitHub Pages.

## Qué debes editar antes de publicar

- **Correo y formulario** → `js/main.js`, al inicio:
  - `CONTACT_EMAIL`: tu correo real.
  - `FORM_ENDPOINT`: opcional. Crea un formulario gratis en formspree.io y pega su URL para recibir los mensajes sin abrir el correo del visitante. Si lo dejas vacío, el formulario abre el correo del visitante con el mensaje ya escrito.
- **Redes sociales** → `index.html`, sección del footer (`class="social"`): reemplaza los enlaces genéricos por tus perfiles.
- **Textos** → todo el contenido está directamente en `index.html`.
- **Colores** → variables al inicio de `css/style.css` (`:root`).
- **Dominio** → `https://antboriginals.com/` ya está definido en las etiquetas `canonical`, Open Graph, Twitter Card y JSON-LD de las cuatro páginas, y en `robots.txt` y `sitemap.xml`. Si algún día cambias de dominio, busca ese texto en esos archivos.
- **Imagen de Open Graph** → `assets/og-image.jpg` (1200×630, creada a partir de la pieza "Built beyond the expected" del manual) se usa en `og:image` y `twitter:image` de todas las páginas.

## Video de fondo del hero

`assets/hero-background.mp4` se reproduce en loop, silenciado, detrás del título del hero (`index.html`), con `assets/hero-poster.jpg` como imagen de respaldo mientras carga o si el navegador no puede reproducir video. Ya viene sin audio (no hace falta en un loop silencioso) y recomprimido a ~7.5 MB (el original pesaba 36 MB) — bien por debajo del límite de 100 MB por archivo de GitHub, pero sigue siendo el archivo más pesado del sitio, así que si más adelante cambias el clip, vale la pena recomprimirlo de forma similar antes de subirlo. Para usuarios con "reducir movimiento" activado en su sistema, el sitio muestra el poster estático en vez del video (`css/style.css` + `js/main.js`).

## Sticker, loader y tarjetas de servicios

- **Sticker interactivo** (`assets/sticker-holo.webp`): en el hero se puede arrastrar con el mouse/dedo; al agarrarlo se despega la esquina y al soltarlo se vuelve a pegar. Al hacer scroll se despega, viaja al bloque "From idea to asset" y se transforma (gira de canto, se desenfoca y aparecen los cubos uno tras otro) en el loader de cubos. Lógica en `js/main.js`, estilos en `css/style.css` (sección *STICKER → CUBE LOADER*). Colores del loader: variables `--cube-a` / `--cube-b`.
- **Videos** en Art & Design, Publishing & Editorial, Fashion y Media & Content (ahora en el escenario de servicios, ver abajo): `assets/service-*.mp4` (+ poster). Cargan y reproducen solo cuando la tarjeta es visible.
- **Animaciones CSS** en las otras cuatro tarjetas (IP, Business, Marketing, Brand), sin archivos extra.
- Con "reducir movimiento" activado nada se anima: se ven los posters y el sticker queda quieto.

## Estructura de la página (según el video de instrucciones)

1. **Hero** — video de fondo + slogan; el botón ahora es "Scroll down" (el efecto rojo que pasa al logo ANTB al scrollear se mantiene).
2. **FROM IDEA TO ASSET** — texto centrado; el sticker se convierte en el loader de cubos a la izquierda y se duplica (espejo) a la derecha.
3. **Services** — escenario fijo (pin) donde cada servicio con video sube pequeño con el degradado del loader, se aclara y deja paso al siguiente; debajo, un slider para los cuatro servicios sin video (flechas, puntos, arrastre, teclado, autoplay). En móvil y con "reducir movimiento" los videos quedan apilados.
4. **Ownership is part of the work** y **Contacto** — estáticos, sin cambios.

## Manual de marca (`brand-manual.html`)

Página propia con la versión de exhibición del manual (PDF incluido en `assets/brand/`, con botón de descarga). Usa `css/brand-manual.css` y `js/brand-manual.js`, y las imágenes recortadas del PDF en `assets/brand/`. Tipografía: **Helvetica Neue** (Bold, Regular, Ultra Light) — viene con macOS/iOS; en Windows/Android cae a Helvetica/Arial porque no se puede incrustar sin licencia. Animaciones: progreso de lectura, luz que sigue el cursor, titulares palabra por palabra, ticker de disciplinas, triángulo de la voz, muestras de color (clic para copiar HEX), probador tipográfico y grilla "u". Con "reducir movimiento" todo queda estático. Enlazada desde el menú ("Brand") de todas las páginas y desde `sitemap.xml`.

## Páginas legales

`privacy-policy.html` y `terms-of-use.html` son plantillas de Política de Privacidad y Términos de Uso enlazadas desde el footer de cada página. La política de privacidad incluye un apartado dedicado al marco costarricense (Ley N.° 8968 y PRODHAB): consentimiento informado, proporcionalidad, seguridad, confidencialidad y los derechos de acceso, rectificación y supresión. Ambas páginas son contenido genérico de referencia, no asesoría legal — antes de publicarlas, haz que un abogado costarricense las revise y las ajuste a tu operación real (por ejemplo, si usas Formspree u otro proveedor para el formulario, o si más adelante agregas cookies o analítica).
