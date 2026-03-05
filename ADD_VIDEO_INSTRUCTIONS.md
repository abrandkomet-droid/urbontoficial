# Cómo Agregar el Video Banner a tu Proyecto

## Ubicación Final
```
/public/videos/banner.mp4
```

## Paso 1: Crear la Carpeta (si no existe)

Si estás usando terminal/bash:
```bash
mkdir -p public/videos
```

Si estás usando Windows (PowerShell):
```powershell
New-Item -ItemType Directory -Force -Path public/videos
```

O simplemente crea manualmente:
- Ve a tu carpeta del proyecto
- Crea carpeta `public` (si no existe)
- Dentro de `public`, crea carpeta `videos`
- Resultado: `proyecto/public/videos/`

## Paso 2: Descargar el Video

**Opción A - Si tienes el link de Google Drive:**
1. Abre: https://drive.google.com/file/d/1m2u9FjvWRRxn_yVXowV0vIVCWtI0CuEq/view
2. Click en descargar (ícono de flecha hacia abajo)
3. Se descargará como `banner.mp4`

**Opción B - Si ya tienes el archivo:**
- Localiza el archivo `banner.mp4`
- Cópialo

## Paso 3: Colocar el Video en la Carpeta

1. Ve a la carpeta que creaste: `proyecto/public/videos/`
2. Pega el archivo `banner.mp4` aquí
3. Verifica que el archivo se ve así:
   ```
   proyecto/
   ├── public/
   │   ├── videos/
   │   │   └── banner.mp4  ← Aquí debe estar
   │   └── ...
   ├── src/
   ├── package.json
   └── ...
   ```

## Paso 4: Verificar que Todo Funciona

Abre tu terminal en la carpeta del proyecto y ejecuta:
```bash
# Solo para verificar que el archivo existe
ls public/videos/
# Debería mostrar: banner.mp4
```

O en Windows (PowerShell):
```powershell
Get-ChildItem public/videos/
```

## Paso 5: Commit y Push

```bash
# Agregar todos los cambios (incluyendo el video)
git add -A

# Commit
git commit -m "Add banner video for welcome screen"

# Push
git push origin main
```

## ¿Qué Pasa Después?

1. Vercel detectará el archivo en `public/videos/`
2. Lo servirá automáticamente cuando se despliegue
3. El WelcomeScreen lo cargará desde `/videos/banner.mp4`
4. Si el video no está disponible, se muestra un gradient gris como fallback

## Verificación en Producción

Después de que Vercel termine el deploy:
1. Abre: https://urbontoficial.vercel.app
2. Deberías ver el video en el fondo de la pantalla Welcome
3. Si no ves nada, el gradient fallback aparecerá
4. Abre DevTools (F12) → Network y busca `banner.mp4`

## Si Algo Va Mal

### El video no se ve en preview local
```bash
# Reinicia el servidor
npm run dev
# O
yarn dev
```

### El archivo no se copia en el build
```bash
# Verifica permisos
chmod 644 public/videos/banner.mp4

# O sube manualmente en Vercel:
# Settings → Code & Integrations → Environment Variables
```

### Error "archivo no encontrado"
1. Verifica la estructura de carpetas exacta
2. Asegúrate que el nombre es exactamente: `banner.mp4`
3. No uses espacios ni caracteres especiales en el nombre

## Tamaño del Archivo

- Ideal: Menos de 10MB para carga rápida
- Máximo: No hay límite técnico, pero afecta rendimiento
- Recomendación: Comprimir si es mayor a 5MB

### Para Comprimir (opcional)
Usa cualquier herramienta online como:
- https://www.freeconvert.com/video-compressor
- HandBrake (desktop app)
- FFmpeg (terminal)

```bash
# Ejemplo con FFmpeg (si tienes instalado)
ffmpeg -i banner.mp4 -c:v libx264 -crf 28 -preset faster -c:a aac -b:a 128k banner-compressed.mp4
```

## Confirmación Final

Antes de hacer push, verifica que:
- [ ] Carpeta `public/videos/` existe
- [ ] Archivo `banner.mp4` está dentro
- [ ] Ejecutaste `git add -A` para incluir el video
- [ ] El commit incluye el video (usa `git status` para ver)

---

**Nota**: Los archivos en `public/` son servidos directamente por Vercel sin necesidad de construcción adicional. Son accesibles públicamente, así que el video estará disponible para todos los usuarios sin problemas de autenticación o permisos.
