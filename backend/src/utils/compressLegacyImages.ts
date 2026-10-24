import { prisma } from './prisma';
import sharp from 'sharp';

/**
 * One-time background migration to compress any legacy, large Base64 images
 * stored in the PostgreSQL database into lightweight WebP format (~35KB).
 * Reduces database payload by 95-97%, making product images load instantly.
 */
export async function compressLegacyImages(): Promise<{ total: number; compressed: number; savedBytes: number }> {
  console.log('\n🔍 [Image Optimizer] Checking database for uncompressed legacy images...');
  
  let compressedCount = 0;
  let totalSavedBytes = 0;

  try {
    // 1. Check Product Images
    const productImages = await prisma.productImage.findMany({
      select: { id: true, url: true, altText: true },
    });

    for (const img of productImages) {
      if (!img.url || !img.url.startsWith('data:image/')) continue;
      
      const originalLength = img.url.length;
      // Skip if already small WebP (< 85KB base64 string)
      if (originalLength < 85000 && img.url.startsWith('data:image/webp')) {
        continue;
      }

      try {
        const matches = img.url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) continue;

        const inputBuffer = Buffer.from(matches[2], 'base64');
        const originalBytes = inputBuffer.length;

        // Resize to max 1200px width/height and encode to high-efficiency WebP (quality: 80)
        const compressedBuffer = await sharp(inputBuffer)
          .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toBuffer();

        const compressedBytes = compressedBuffer.length;
        const newUrl = `data:image/webp;base64,${compressedBuffer.toString('base64')}`;

        await prisma.productImage.update({
          where: { id: img.id },
          data: { url: newUrl },
        });

        const saved = originalBytes - compressedBytes;
        totalSavedBytes += saved;
        compressedCount++;

        console.log(
          `⚡ [Image Optimizer] Compressed image (${img.altText || img.id}): ` +
          `${(originalBytes / 1024).toFixed(1)} KB -> ${(compressedBytes / 1024).toFixed(1)} KB WebP ` +
          `(-${((saved / originalBytes) * 100).toFixed(1)}%)`
        );
      } catch (err: any) {
        console.error(`⚠️ [Image Optimizer] Failed to compress image ${img.id}:`, err.message);
      }
    }

    // 2. Check Category Images
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, image: true },
    });

    for (const cat of categories) {
      if (!cat.image || !cat.image.startsWith('data:image/')) continue;
      if (cat.image.length < 85000 && cat.image.startsWith('data:image/webp')) continue;

      try {
        const matches = cat.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) continue;

        const inputBuffer = Buffer.from(matches[2], 'base64');
        const originalBytes = inputBuffer.length;

        const compressedBuffer = await sharp(inputBuffer)
          .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toBuffer();

        const newUrl = `data:image/webp;base64,${compressedBuffer.toString('base64')}`;

        await prisma.category.update({
          where: { id: cat.id },
          data: { image: newUrl },
        });

        const saved = originalBytes - compressedBuffer.length;
        totalSavedBytes += saved;
        compressedCount++;

        console.log(
          `⚡ [Image Optimizer] Compressed category image (${cat.name}): ` +
          `${(originalBytes / 1024).toFixed(1)} KB -> ${(compressedBuffer.length / 1024).toFixed(1)} KB WebP`
        );
      } catch (err: any) {
        console.error(`⚠️ [Image Optimizer] Failed to compress category ${cat.name}:`, err.message);
      }
    }

    if (compressedCount > 0) {
      console.log(
        `✅ [Image Optimizer] Finished! Successfully compressed ${compressedCount} images. ` +
        `Saved ${(totalSavedBytes / (1024 * 1024)).toFixed(2)} MB of data!\n`
      );
    } else {
      console.log(`✨ [Image Optimizer] All images are already compressed & optimized.\n`);
    }

    return { total: productImages.length + categories.length, compressed: compressedCount, savedBytes: totalSavedBytes };
  } catch (error: any) {
    console.error('❌ [Image Optimizer] Error during image compression migration:', error.message);
    return { total: 0, compressed: 0, savedBytes: 0 };
  }
}
