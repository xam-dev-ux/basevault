# Base App Indexing Checklist - BaseVault

**Tu App**: https://basevault-woad.vercel.app

## 📋 Estado Actual del Indexing

### ✅ COMPLETADO

1. **Manifest Accesible** ✓
   - URL: https://basevault-woad.vercel.app/.well-known/farcaster.json
   - Estado: Accesible y válido
   - Estructura JSON: Correcta

2. **Campos Requeridos del Manifest** ✓
   - ✅ `name`: "BaseVault" (usado para búsqueda)
   - ✅ `primaryCategory`: "finance" (para categorización)
   - ✅ `homeUrl`: Configurado correctamente
   - ✅ `subtitle`: Descriptivo y claro
   - ✅ `description`: Completo y detallado
   - ✅ `tags`: Apropiados (savings, collaborative, dao, voting, defi, web3, ethereum, base)

3. **URLs Configuradas** ✓
   - ✅ Home URL apunta a https://basevault-woad.vercel.app
   - ✅ Todas las URLs usan el dominio correcto

---

## ⚠️ PENDIENTE - Assets Visuales

### Assets que FALTAN (404 Error):

1. **App Icon (CRÍTICO)** ❌
   - Ubicación esperada: `/frontend/public/icon-1024.png`
   - URL pública: https://basevault-woad.vercel.app/icon-1024.png
   - **Requisitos**:
     - Dimensiones: 1024×1024 px
     - Formato: PNG sin transparencia
     - Legible en tamaños pequeños (48px)
   - **Estado**: NO EXISTE (404)

2. **Cover Photo (IMPORTANTE)** ❌
   - Ubicación esperada: `/frontend/public/cover-1200x630.png`
   - URL pública: https://basevault-woad.vercel.app/cover-1200x630.png
   - **Requisitos**:
     - Dimensiones: 1200×630 px (ratio 1.91:1)
     - Formato: PNG o JPG
     - Sin logo de Base o fotos de equipo
   - **Estado**: NO EXISTE (404)

3. **Splash Image (OPCIONAL)** ❌
   - Ubicación esperada: `/frontend/public/splash.png`
   - URL pública: https://basevault-woad.vercel.app/splash.png
   - **Estado**: NO EXISTE (404)

4. **Screenshots (IMPORTANTE)** ❌
   - Ubicación esperada: `/frontend/public/screenshots/`
   - URLs públicas:
     - https://basevault-woad.vercel.app/screenshots/screenshot-1.png
     - https://basevault-woad.vercel.app/screenshots/screenshot-2.png
     - https://basevault-woad.vercel.app/screenshots/screenshot-3.png
   - **Requisitos**:
     - Dimensiones: 1284×2778 px (portrait)
     - Formato: PNG o JPG
     - Mostrar funcionalidad clave
   - **Estado**: NO EXISTEN (404)

---

## 🚀 PASOS PARA APARECER EN BASE APP

### Paso 1: Crear Assets Visuales (OBLIGATORIO)

Necesitas crear y subir estos archivos:

```bash
cd /home/xabier/basedev/Vault/basevault/frontend/public/

# Crear estos archivos:
# 1. icon-1024.png (1024×1024 px)
# 2. cover-1200x630.png (1200×630 px)
# 3. splash.png (opcional)
# 4. screenshots/screenshot-1.png (1284×2778 px)
# 5. screenshots/screenshot-2.png (1284×2778 px)
# 6. screenshots/screenshot-3.png (1284×2778 px)
```

### Paso 2: Hacer Deploy de los Assets

Una vez creados los archivos:

```bash
git add frontend/public/icon-1024.png
git add frontend/public/cover-1200x630.png
git add frontend/public/screenshots/*.png
git commit -m "Add visual assets for Base App indexing"
git push origin main
```

Vercel hará auto-deploy y los assets estarán disponibles en:
- https://basevault-woad.vercel.app/icon-1024.png
- https://basevault-woad.vercel.app/cover-1200x630.png
- etc.

### Paso 3: Compartir URL en Base App (CRÍTICO)

**⚠️ IMPORTANTE**: El indexing NO es automático. Debes hacer esto:

1. Abre Base App o Warpcast
2. Crea un post/cast con tu URL: `https://basevault-woad.vercel.app`
3. Publica el post en el feed social
4. Base App detectará la URL y validará el manifest
5. **Espera ~10 minutos** para que se complete el indexing

**Ejemplo de post**:
```
🏦 BaseVault - Collaborative savings on Base!

Create shared vaults, pool funds with your community, and vote democratically on proposals.

Try it now: https://basevault-woad.vercel.app

#Base #DeFi #DAO
```

### Paso 4: Verificar que Aparece en Búsqueda

Después de ~10 minutos:

1. Abre Base App
2. Ve a la búsqueda (🔍)
3. Busca "BaseVault"
4. Tu app debería aparecer en los resultados
5. También debería aparecer en la categoría "Finance"

---

## 🔍 Cómo Funciona la Búsqueda

### Indexing Automático
- ✅ No requiere aprobación manual
- ✅ No hay proceso de revisión
- ✅ Se indexa automáticamente al compartir URL
- ⏱️ Tarda ~10 minutos en completarse

### Búsqueda
- 🔎 Base App busca en el campo `name` de tu manifest
- 📱 Funciona con búsquedas exactas y parciales
- 📂 También aparece en "Finance" category
- ⭐ Ranking basado en engagement de 7 días

### Superficies de Descubrimiento

Tu app aparecerá en:
1. **Búsqueda directa**: Por nombre "BaseVault"
2. **Category browsing**: En "Finance"
3. **Saved apps**: Si usuarios la guardan
4. **Direct messages**: Si compartes URL en chats

---

## 📊 Ranking y Visibilidad

### Factores de Ranking:
- 📈 Shares en últimos 7 días (principal)
- 🎯 Engagement general
- 💬 Menciones en posts

### Para Mejorar Visibilidad:
1. ✅ Compartir en posts regularmente
2. ✅ Pedir a usuarios que compartan
3. ✅ Crear contenido sobre la app
4. ✅ Participar en comunidades relevantes

---

## ⚠️ Problemas Comunes que Previenen Indexing

### ❌ Manifest No Accesible
- Verifica que el archivo esté en `/public/.well-known/farcaster.json`
- Prueba la URL: https://basevault-woad.vercel.app/.well-known/farcaster.json
- **Tu Estado**: ✅ Accesible

### ❌ Campos Requeridos Faltantes
- Asegura que `name` y `primaryCategory` estén presentes
- **Tu Estado**: ✅ Todos los campos presentes

### ❌ Assets 404
- Todos los assets deben ser accesibles públicamente
- **Tu Estado**: ⚠️ Assets pendientes de crear

### ❌ No Compartiste la URL
- Debes compartir la URL en el feed para iniciar indexing
- **Tu Estado**: 🔴 PENDIENTE (paso crítico)

---

## ✅ Checklist Final

Antes de compartir tu URL, verifica:

- [ ] Icon 1024×1024 existe y es accesible
- [ ] Cover 1200×630 existe y es accesible
- [ ] 3 Screenshots existen y son accesibles
- [ ] Manifest accesible en `.well-known/farcaster.json` ✅
- [ ] Campo `name` presente ✅
- [ ] Campo `primaryCategory` presente ✅
- [ ] Todas las URLs en manifest apuntan a dominio correcto ✅
- [ ] App funciona correctamente ✅
- [ ] Ready to share URL in Base App feed 🚀

---

## 🔄 Reindexing (Si Cambias Manifest)

Si actualizas el manifest después del primer indexing:

1. Modifica el archivo `farcaster.json`
2. Haz deploy de los cambios
3. **Comparte la URL de nuevo** en el feed
4. Base App reindexará con los nuevos datos

**Nota**: Los cambios en manifest NO se detectan automáticamente. Debes compartir la URL nuevamente.

---

## 📚 Recursos Adicionales

- **Base Docs**: https://docs.base.org/mini-apps/
- **Troubleshooting**: https://docs.base.org/mini-apps/troubleshooting/
- **Featured Checklist**: Ver `BASE_FEATURED_CHECKLIST.md` en este repo

---

## 🎯 Próximos Pasos Inmediatos

1. **URGENTE**: Crear icon-1024.png
2. **URGENTE**: Crear cover-1200x630.png
3. **IMPORTANTE**: Crear 3 screenshots
4. **CRÍTICO**: Hacer deploy de los assets
5. **CRÍTICO**: Compartir URL en Base App/Warpcast
6. Esperar ~10 minutos
7. Verificar que aparece en búsqueda

---

*Última actualización: 2026-01-09*
