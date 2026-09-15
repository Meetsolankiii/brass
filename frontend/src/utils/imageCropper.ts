/**
 * Automatically crops solid background borders from an image file
 * and converts white/near-white backgrounds into transparent pixels so the logo has no rectangular box.
 * Returns a new File object containing the transparent, tightly cropped image.
 */
export async function autoCropImage(file: File, padding = 6, threshold = 25): Promise<File> {
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
            if (a > 30) isContent = true;
          } else {
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

      if (!foundContent || (minX === 0 && minY === 0 && maxX === width - 1 && maxY === height - 1)) {
        return resolve(file);
      }

      const cropX = Math.max(0, minX - padding);
      const cropY = Math.max(0, minY - padding);
      const cropW = Math.min(width - cropX, (maxX - minX) + (padding * 2));
      const cropH = Math.min(height - cropY, (maxY - minY) + (padding * 2));

      if (cropW <= 0 || cropH <= 0) return resolve(file);

      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = cropW;
      croppedCanvas.height = cropH;
      const croppedCtx = croppedCanvas.getContext('2d', { willReadFrequently: true });
      if (!croppedCtx) return resolve(file);

      // Draw cropped area on transparent canvas
      croppedCtx.drawImage(
        canvas,
        cropX, cropY, cropW, cropH,
        0, 0, cropW, cropH
      );

      // Make any near-white or background pixels fully transparent
      const croppedData = croppedCtx.getImageData(0, 0, cropW, cropH);
      const cData = croppedData.data;
      for (let i = 0; i < cData.length; i += 4) {
        const r = cData[i];
        const g = cData[i + 1];
        const b = cData[i + 2];
        const a = cData[i + 3];

        if (a > 0) {
          const diffFromBg = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
          // If close to original solid background or near pure white
          if ((bgA >= 50 && diffFromBg <= threshold) || (r > 230 && g > 230 && b > 230)) {
            cData[i + 3] = 0; // Transparent
          }
        }
      }
      croppedCtx.putImageData(croppedData, 0, 0);

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
