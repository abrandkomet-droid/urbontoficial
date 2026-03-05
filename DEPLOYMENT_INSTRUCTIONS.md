# Guía de Deployment a Vercel - Urbont App

## Estado Actual

Todos los cambios han sido implementados correctamente en el repositorio local. La aplicación está lista para ser subida a Vercel.

## Paso 1: Preparar el Video

1. Descarga el archivo `banner.mp4` desde el enlace de Google Drive que proporcionaste
2. Crea la carpeta si no existe:
   ```bash
   mkdir -p public/videos
   ```
3. Coloca el archivo en: `/public/videos/banner.mp4`

## Paso 2: Hacer Commit y Push

```bash
# Agregar todos los cambios
git add -A

# Crear commit
git commit -m "Corrections: Fix video path, add access chauffeur button, remove news duplication, fix server startup"

# Push a la rama actual
git push origin v0/contact-7969-7417593f
```

O si prefieres pushearlo a main:
```bash
git push origin main
```

## Paso 3: Vercel Deploy (Automático)

1. Ve a tu dashboard de Vercel: https://urbontoficial.vercel.app
2. Los cambios se desplegarán automáticamente cuando hagas push a GitHub
3. Espera a que el build se complete (generalmente 1-2 minutos)

## Lo que se ha Corregido

### ✅ Welcome Screen
- Video ahora carga desde `/public/videos/banner.mp4` (local, no Google Drive)
- Botón "Discover Urbont" funciona correctamente
- "Access Chauffeur" visible en la parte inferior
- Si el video no está disponible, muestra gradient como fallback

### ✅ Auth Screen (Phone)
- Formulario de login para clientes
- "Access Chauffeur" agregado - navega al login de choferes
- Navegación correcta entre pantallas

### ✅ News Screen
- News Screen duplicado removido
- El News Screen existente en el dashboard permanece intacto
- Funcionalidad de rating y favoritos en TripCompletedScreen sigue funcionando

### ✅ Server
- Error de GoogleGenAI al startup está arreglado
- Lazy loading implementado - solo crea instancia cuando se necesita
- Servidor inicia sin errores incluso sin GEMINI_API_KEY

## Checklist Antes de Deploy

- [ ] Video `banner.mp4` está en `/public/videos/`
- [ ] Git status muestra todos los cambios
- [ ] Commit message es descriptivo
- [ ] Push fue exitoso
- [ ] Vercel build completa sin errores

## URLs Importantes

- **Producción**: https://urbontoficial.vercel.app
- **GitHub Repo**: abrandkomet-droid/urbontoficial
- **Branch**: main o v0/contact-7969-7417593f (según tu preferencia)

## Solución de Problemas

### El video no se ve
- Verifica que `public/videos/banner.mp4` existe
- Comprueba que el archivo es formato MP4 válido
- Abre DevTools (F12) → Network y verifica que se intenta cargar el archivo

### Error en el servidor
- Verifica que NO hay GEMINI_API_KEY requerida (está en lazy loading)
- Revisa los logs de Vercel en el dashboard

### "Access Chauffeur" no funciona
- Asegúrate que `onBack()` en PhoneAuthScreen lleva a Welcome
- En Welcome, el botón "Access Chauffeur" debe navegar a 'chauffeur-login'

## Cambios de Archivo Específicos

**src/App.tsx**:
- L~502: Video path cambiado a `/videos/banner.mp4`
- L~1017: "ACCESS CHAUFFEUR" button agregado
- L~244: "NEWS & UPDATES" button removido del menú
- L~391: NewsScreen renderizado removido
- Línea ~2560-2691: Función NewsScreen completa removida

**src/types.ts**:
- L~1: Tipo 'news' removido de Screen union

**server/translation.ts**:
- L~7-18: Lazy loading de GoogleGenAI implementado

## Verificación Post-Deploy

1. Abre https://urbontoficial.vercel.app
2. Verifica que:
   - [ ] Welcome screen muestra video (o gradient fallback)
   - [ ] Botón "Discover Urbont" funciona
   - [ ] "Access Chauffeur" es visible
   - [ ] Click en "Access Chauffeur" lleva al login de choferes
   - [ ] No hay errores en la consola

## Soporte

Si tienes problemas:
1. Revisa los logs de Vercel (Settings → Deployments)
2. Comprueba que el video está en la carpeta correcta
3. Verifica que no hay conflictos de merge en Git
