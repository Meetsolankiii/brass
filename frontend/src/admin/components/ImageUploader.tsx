import { useCallback, useState } from 'react';
import { Upload, X, ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { compressImage, autoCropImage } from '@/utils/imageCropper';

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  existingImages?: Array<{ id: string; url: string; altText?: string }>;
  onDeleteExisting?: (id: string) => void;
  mode?: 'compress' | 'logo';
}

interface PreviewItem {
  file: File;
  url: string;
  sizeKb: number;
  format: string;
}

export default function ImageUploader({
  onFilesSelected,
  multiple = false,
  existingImages = [],
  onDeleteExisting,
  mode = 'compress',
}: ImageUploaderProps) {
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setIsProcessing(true);
      try {
        const rawFiles = Array.from(files).filter(
          (f) => f.type.startsWith('image/') && f.size <= 25 * 1024 * 1024
        );

        const processed = await Promise.all(
          rawFiles.map(async (f) => {
            if (mode === 'logo') {
              return autoCropImage(f);
            }
            return compressImage(f, { maxWidth: 1200, maxHeight: 1200, quality: 0.82 });
          })
        );

        const newPreviews: PreviewItem[] = processed.map((f) => ({
          file: f,
          url: URL.createObjectURL(f),
          sizeKb: Math.round(f.size / 1024),
          format: f.type.replace('image/', '').toUpperCase(),
        }));

        if (multiple) {
          setPreviews((prev) => [...prev, ...newPreviews]);
          onFilesSelected([...previews.map((p) => p.file), ...processed]);
        } else {
          setPreviews(newPreviews);
          onFilesSelected(processed.slice(0, 1));
        }
      } catch (err) {
        console.error('Image optimization failed:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    [mode, multiple, onFilesSelected, previews]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const removePreview = (i: number) => {
    URL.revokeObjectURL(previews[i].url);
    const next = previews.filter((_, idx) => idx !== i);
    setPreviews(next);
    onFilesSelected(next.map((p) => p.file));
  };

  return (
    <div className="space-y-4">
      {/* Existing images */}
      {existingImages.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Current Images</p>
          <div className="flex flex-wrap gap-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative group w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200">
                <img src={img.url} alt={img.altText || ''} className="w-full h-full object-contain bg-gray-50" />
                {onDeleteExisting && (
                  <button
                    type="button"
                    onClick={() => onDeleteExisting(img.id)}
                    className="absolute inset-0 bg-red-500/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete image"
                  >
                    <X size={18} className="text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-primary-DEFAULT bg-primary-50'
            : 'border-gray-300 hover:border-primary-DEFAULT hover:bg-gray-50'
        }`}
        onClick={() => !isProcessing && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />

        {isProcessing ? (
          <div className="py-2 flex flex-col items-center gap-2">
            <Loader2 size={30} className="animate-spin text-primary-DEFAULT" />
            <p className="text-sm font-semibold text-primary-DEFAULT flex items-center gap-1.5">
              <Sparkles size={16} /> Auto-compressing & optimizing to WebP...
            </p>
          </div>
        ) : (
          <>
            <Upload size={28} className="text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">
              Drag & drop {multiple ? 'images' : 'an image'} here
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports JPG, PNG, WebP (auto-compressed to lightweight WebP)
            </p>
          </>
        )}
      </div>

      {/* New previews with compression indicator */}
      {previews.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            New Images (Optimized for instant loading)
          </p>
          <div className="flex flex-wrap gap-3">
            {previews.map((p, i) => (
              <div key={p.url} className="relative group w-28 h-28 rounded-xl overflow-hidden border-2 border-primary-200 flex flex-col">
                <div className="flex-1 overflow-hidden bg-gray-50 flex items-center justify-center p-1">
                  <img src={p.url} alt="" className="w-full h-full object-contain" />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePreview(i);
                  }}
                  className="absolute inset-0 bg-red-500/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X size={18} className="text-white" />
                </button>
                <div className="bg-emerald-600 text-white text-[10px] font-semibold text-center py-0.5 px-1 truncate">
                  ✓ {p.sizeKb} KB • {p.format}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {previews.length === 0 && existingImages.length === 0 && (
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <ImageIcon size={14} /> No images added yet.
        </div>
      )}
    </div>
  );
}
