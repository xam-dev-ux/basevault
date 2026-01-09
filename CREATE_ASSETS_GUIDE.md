# Guía para Crear Assets de BaseVault

Esta guía te ayudará a crear los assets visuales necesarios para que tu app aparezca en Base App.

## 📦 Assets Requeridos

### 1. App Icon - `icon-1024.png`
**Ubicación**: `/frontend/public/icon-1024.png`

**Especificaciones**:
- Dimensiones: **1024×1024 px**
- Formato: **PNG sin transparencia**
- Fondo: Sólido (sin transparencia)
- Contenido: Logo o icono representativo de BaseVault

**Sugerencias de diseño**:
- Icono de una bóveda (🏦) o caja fuerte
- Colores de Base (azul #0052FF)
- Diseño simple y reconocible
- Legible incluso a 48px

**Herramientas recomendadas**:
- Figma (gratis): https://figma.com
- Canva (gratis): https://canva.com
- Photoshop/Illustrator
- Online: https://www.figma.com/community/file/icon-templates

---

### 2. Cover Photo - `cover-1200x630.png`
**Ubicación**: `/frontend/public/cover-1200x630.png`

**Especificaciones**:
- Dimensiones: **1200×630 px** (ratio 1.91:1)
- Formato: **PNG o JPG**
- Calidad: Alta resolución

**Contenido sugerido**:
```
[Imagen de fondo con gradiente azul de Base]

🏦 BaseVault
Collaborative Savings on Base

[Mockup de la interfaz de la app]

Save Together • Vote Together • Reach Goals Together
```

**NO incluir**:
- ❌ Logo de Base
- ❌ Fotos del equipo
- ❌ Texto difícil de leer

**Plantilla sugerida**:
- Usa los colores de tu app (azul Base #0052FF)
- Muestra un ejemplo de vault o interfaz
- Incluye el tagline: "Save together, decide together"

---

### 3. Splash Image - `splash.png` (Opcional)
**Ubicación**: `/frontend/public/splash.png`

**Especificaciones**:
- Dimensiones: Flexible (recomendado 1080×1920 px portrait)
- Formato: PNG o JPG
- Fondo: Debe coincidir con `splashBackgroundColor: #0A0B0D`

**Contenido**:
- Logo de BaseVault centrado
- Fondo oscuro (#0A0B0D)
- Opcionalmente: "Loading..." o animación

---

### 4. Screenshots - `screenshots/screenshot-{1,2,3}.png`
**Ubicación**: `/frontend/public/screenshots/`

**Especificaciones**:
- Dimensiones: **1284×2778 px** (portrait, iPhone 14 Pro Max)
- Formato: PNG o JPG
- Orientación: Portrait (vertical)

**Contenido sugerido**:

**Screenshot 1: Vault List**
- Muestra la lista de vaults disponibles
- Destaca el botón "Create Vault"
- Incluye filtros (All, Active, My Vaults)

**Screenshot 2: Vault Details**
- Muestra un vault con progreso
- Botón de "Contribute" visible
- Stats de contributors y tiempo restante

**Screenshot 3: Proposals & Voting**
- Muestra propuestas activas
- Botones de votación (Vote For/Against)
- Progreso de votación visual

---

## 🛠️ Cómo Crear Screenshots

### Método 1: Captura de Pantalla con DevTools (Recomendado)

1. Abre tu app en Chrome: https://basevault-woad.vercel.app
2. Abre DevTools (F12)
3. Click en el ícono de dispositivo móvil (Toggle device toolbar)
4. Selecciona "iPhone 14 Pro Max" o configura custom: 1284×2778
5. Navega a la pantalla deseada
6. Click derecho en la página > "Capture screenshot"
7. Guarda como `screenshot-1.png`

### Método 2: Usar Herramientas Online

**MockUPhone** (https://mockuphone.com)
- Sube screenshots de tu app
- Genera mockups en dispositivos reales
- Exporta en alta resolución

**Screely** (https://screely.com)
- Sube tu screenshot
- Añade fondo y sombras profesionales
- Descarga en alta calidad

**Figma Mockups**
- Busca "iPhone mockup" en Figma Community
- Inserta tus screenshots
- Exporta a PNG

---

## 📂 Estructura de Archivos

Después de crear todos los assets, tu estructura debería verse así:

```
frontend/public/
├── icon-1024.png          ✅ (1024×1024 px)
├── cover-1200x630.png     ✅ (1200×630 px)
├── splash.png             ⭕ opcional
└── screenshots/
    ├── screenshot-1.png   ✅ (1284×2778 px)
    ├── screenshot-2.png   ✅ (1284×2778 px)
    └── screenshot-3.png   ✅ (1284×2778 px)
```

---

## 🚀 Deployment

Una vez que hayas creado todos los archivos:

```bash
# Desde la raíz del proyecto
cd /home/xabier/basedev/Vault/basevault

# Agregar los nuevos archivos
git add frontend/public/icon-1024.png
git add frontend/public/cover-1200x630.png
git add frontend/public/splash.png  # si lo creaste
git add frontend/public/screenshots/

# Commit
git commit -m "Add visual assets for Base App indexing"

# Push a GitHub (Vercel hace auto-deploy)
git push origin main
```

---

## ✅ Verificar Assets

Después del deployment de Vercel (~2 minutos), verifica que los assets sean accesibles:

```bash
# Ejecutar el script de verificación
chmod +x check-assets.sh
./check-assets.sh
```

O manualmente abre estas URLs en tu navegador:
- https://basevault-woad.vercel.app/icon-1024.png
- https://basevault-woad.vercel.app/cover-1200x630.png
- https://basevault-woad.vercel.app/screenshots/screenshot-1.png
- https://basevault-woad.vercel.app/screenshots/screenshot-2.png
- https://basevault-woad.vercel.app/screenshots/screenshot-3.png

---

## 📱 Siguiente Paso: Compartir en Base App

Una vez que TODOS los assets sean accesibles (200 OK):

1. Abre Base App o Warpcast
2. Crea un nuevo post/cast
3. Incluye tu URL: `https://basevault-woad.vercel.app`
4. Publica el post
5. Espera ~10 minutos para indexing
6. Busca "BaseVault" en Base App

**Ejemplo de post**:
```
🏦 Introducing BaseVault - Collaborative savings on Base!

Create shared vaults with your community
💰 Pool funds together
🗳️ Vote on proposals democratically
✅ Reach your savings goals

Try it now: https://basevault-woad.vercel.app

#Base #DeFi #CollaborativeSavings
```

---

## 🆘 Ayuda y Recursos

**Plantillas y herramientas**:
- Canva Templates: https://www.canva.com/templates/
- Figma Community: https://www.figma.com/community
- Unsplash (fotos): https://unsplash.com
- Iconscout (iconos): https://iconscout.com

**Necesitas ayuda con diseño?**
- Puedes contratar en Fiverr ($5-$20)
- r/freedesign en Reddit
- Pedir ayuda en Discord de Base

**Documentación**:
- Base Docs: https://docs.base.org/mini-apps/
- Ver también: `BASE_APP_INDEXING_CHECKLIST.md`

---

*¡Buena suerte con tu launch en Base App! 🚀*
