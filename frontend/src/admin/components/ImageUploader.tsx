import { useCallback, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  existingImages?: Array<{ id: string; url: string; altText?: string }>;
  onDeleteExisting?: (id: string) => void;
}

export default function ImageUploader({ onFilesSelected, multiple = false, existingImages = [], onDeleteExisting }: ImageUploaderProps) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [dragging, setDragging] = useState(false);

  const processFiles = useCallback((files: FileList | File[]) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    const newPreviews = valid.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    if (multiple) {
      setPreviews((prev) => [...prev, ...newPreviews]);
      onFilesSelected(valid);
    } else {
      setPreviews(newPreviews);
      onFilesSelected(valid.slice(0, 1));
    }
  }, [multiple, onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

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
                  <button onClick={() => onDeleteExisting(img.id)}
                    className="absolute inset-0 bg-red-500/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragging ? 'border-primary-DEFAULT bg-primary-50' : 'border-gray-300 hover:border-primary-DEFAULT hover:bg-gray-50'}`}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input id="file-input" type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => e.target.files && processFiles(e.target.files)} />
        <Upload size={28} className="text-gray-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-600">Drag & drop {multiple ? 'images' : 'an image'} here</p>
        <p className="text-xs text-gray-400 mt-1">or click to select (max 5MB per file)</p>
      </div>

      {/* New previews */}
      {previews.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">New Images (queued for upload)</p>
          <div className="flex flex-wrap gap-3">
            {previews.map((p, i) => (
              <div key={p.url} className="relative group w-24 h-24 rounded-xl overflow-hidden border-2 border-primary-200">
                <img src={p.url} alt="" className="w-full h-full object-contain bg-gray-50" />
                <button onClick={(e) => { e.stopPropagation(); removePreview(i); }}
                  className="absolute inset-0 bg-red-500/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={18} className="text-white" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-center text-xs py-0.5">
                  New
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
