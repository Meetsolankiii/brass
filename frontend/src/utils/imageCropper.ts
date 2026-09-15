/**
 * Automatically crops solid background borders (white/near-white or transparent) from an image file.
 * Returns a new File object containing the tightly cropped image.
 */
export async function autoCropImage(file: File, padding = 8, threshold = 25): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      if (width === 0 || height === 0) return resolve(file);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return resolve(file);

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Sample background color from top-left (0,0)
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];
      const bgA = data[3];

      let minX = width;
      let minY = height;
      let maxX = 0;
      let maxY = 0;
      let foundContent = false;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          let isContent = false;
          if (bgA < 30) {
            // Transparent background
            if (a > 30) isContent = true;
          } else {
            // Solid background (like white or light grey)
            const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
            if (diff > threshold || Math.abs(a - bgA) > 30) {
              isContent = true;
            }
          }

          if (isContent) {
            foundContent = true;
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }

      // If no borders found or couldn't detect content, return original
      if (!foundContent || (minX === 0 && minY === 0 && maxX === width - 1 && maxY === height - 1)) {
        return resolve(file);
      }

      // Add padding
      const cropX = Math.max(0, minX - padding);
      const cropY = Math.max(0, minY - padding);
      const cropW = Math.min(width - cropX, (maxX - minX) + (padding * 2));
      const cropH = Math.min(height - cropY, (maxY - minY) + (padding * 2));

      if (cropW <= 0 || cropH <= 0) return resolve(file);

      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = cropW;
      croppedCanvas.height = cropH;
      const croppedCtx = croppedCanvas.getContext('2d');
      if (!croppedCtx) return resolve(file);

      // Preserve clean white background if original had white background
      if (bgA >= 200 && bgR > 230 && bgG > 230 && bgB > 230) {
        croppedCtx.fillStyle = '#ffffff';
        croppedCtx.fillRect(0, 0, cropW, cropH);
      }

      croppedCtx.drawImage(
        canvas,
        cropX, cropY, cropW, cropH,
        0, 0, cropW, cropH
      );

      croppedCanvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const croppedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".png", {
            type: 'image/png',
            lastModified: Date.now(),
          });
          resolve(croppedFile);
        },
        'image/png'
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}
