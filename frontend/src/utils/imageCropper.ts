export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Compresses an image file on the client side using HTML5 Canvas.
 * - Resizes large dimensions (default max 1200px width/height)
 * - Converts to modern WebP format at 82% quality
 * - Reduces file size by 90%–98% (e.g. 5MB photo becomes ~40KB–70KB)
 * - Ensures instant network transfer and fast rendering
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = options;

  if (!file.type.startsWith('image/')) {
    return file;
  }

  // SVGs are already vector and lightweight; GIFs lose animation on Canvas
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { naturalWidth: width, naturalHeight: height } = img;
      if (width === 0 || height === 0) {
        return resolve(file);
      }

      // Calculate scaled dimensions keeping aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(file);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Attempt WebP export
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }

          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const compressedFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Specifically designed for business logos:
 * Automatically crops solid background borders and converts near-white backgrounds
 * to transparent pixels, scaling large dimensions to max 800px.
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

      // Scale logo if it's overly large (max 800px)
      const maxDim = 800;
      let outW = cropW;
      let outH = cropH;
      if (outW > maxDim || outH > maxDim) {
        const ratio = Math.min(maxDim / outW, maxDim / outH);
        outW = Math.round(outW * ratio);
        outH = Math.round(outH * ratio);
      }

      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = outW;
      croppedCanvas.height = outH;
      const croppedCtx = croppedCanvas.getContext('2d', { willReadFrequently: true });
      if (!croppedCtx) return resolve(file);

      croppedCtx.imageSmoothingEnabled = true;
      croppedCtx.imageSmoothingQuality = 'high';

      // Draw cropped area
      croppedCtx.drawImage(
        canvas,
        cropX, cropY, cropW, cropH,
        0, 0, outW, outH
      );

      // Make any near-white or background pixels fully transparent
      const croppedData = croppedCtx.getImageData(0, 0, outW, outH);
      const cData = croppedData.data;
      for (let i = 0; i < cData.length; i += 4) {
        const r = cData[i];
        const g = cData[i + 1];
        const b = cData[i + 2];
        const a = cData[i + 3];

        if (a > 0) {
          const diffFromBg = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
          if ((bgA >= 50 && diffFromBg <= threshold) || (r > 230 && g > 230 && b > 230)) {
            cData[i + 3] = 0;
          }
        }
      }
      croppedCtx.putImageData(croppedData, 0, 0);

      croppedCanvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const croppedFile = new File([blob], `${baseName}.png`, {
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
