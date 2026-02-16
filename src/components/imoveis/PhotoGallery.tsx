import { useState, useRef, useCallback } from "react";
import { Upload, Camera, X, Star, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface PhotoGalleryProps {
  photos: string[];
  coverIndex: number;
  onChange: (photos: string[], coverIndex: number) => void;
}

const MAX_PHOTOS = 15;
const MAX_SIZE_KB = 800;
const TARGET_WIDTH = 1200;

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > TARGET_WIDTH) {
          h = Math.round((h * TARGET_WIDTH) / w);
          w = TARGET_WIDTH;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);

        let quality = 0.85;
        let result = canvas.toDataURL("image/jpeg", quality);
        while (result.length / 1024 > MAX_SIZE_KB && quality > 0.3) {
          quality -= 0.1;
          result = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(result);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoGallery({ photos, coverIndex, onChange }: PhotoGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArr.length === 0) return;

    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      toast({ title: "Limite atingido", description: `Máximo de ${MAX_PHOTOS} fotos.`, variant: "destructive" });
      return;
    }
    const toProcess = fileArr.slice(0, remaining);

    setUploading(true);
    setProgress(0);
    const newPhotos: string[] = [];

    for (let i = 0; i < toProcess.length; i++) {
      try {
        const compressed = await compressImage(toProcess[i]);
        newPhotos.push(compressed);
      } catch {
        // skip failed
      }
      setProgress(Math.round(((i + 1) / toProcess.length) * 100));
    }

    setUploading(false);
    if (newPhotos.length > 0) {
      onChange([...photos, ...newPhotos], coverIndex);
      toast({ title: `${newPhotos.length} foto(s) adicionada(s)` });
    }
  }, [photos, coverIndex, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const removePhoto = (index: number) => {
    const next = photos.filter((_, i) => i !== index);
    let newCover = coverIndex;
    if (index === coverIndex) newCover = 0;
    else if (index < coverIndex) newCover = coverIndex - 1;
    onChange(next, Math.min(newCover, Math.max(0, next.length - 1)));
  };

  const setCover = (index: number) => {
    onChange(photos, index);
    toast({ title: "Foto de capa definida" });
  };

  return (
    <div className="space-y-3">
      <label className="text-xs text-muted-foreground flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5" /> Galeria de Fotos ({photos.length}/{MAX_PHOTOS})
      </label>

      {/* Drop zone */}
      <div
        ref={dropRef}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer",
          dragging
            ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(183_100%_50%/0.2)]"
            : "border-border/50 hover:border-primary/50 bg-secondary/30"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Arraste fotos aqui ou <span className="text-primary">clique para selecionar</span>
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, WebP • Compressão automática</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && processFiles(e.target.files)}
      />

      {/* Camera button */}
      <Button
        type="button"
        variant="outline"
        className="w-full border-primary/30 text-primary hover:bg-primary/10"
        onClick={() => cameraInputRef.current?.click()}
      >
        <Camera className="w-4 h-4 mr-2" /> Tirar Foto
      </Button>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files && processFiles(e.target.files)}
      />

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2 [&>div]:bg-primary" />
          <p className="text-xs text-primary text-center">{progress}% processado</p>
        </div>
      )}

      {/* Thumbnails */}
      {photos.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {photos.map((src, i) => (
            <div
              key={i}
              className={cn(
                "relative group aspect-square rounded-md overflow-hidden border-2 transition-all",
                i === coverIndex
                  ? "border-primary shadow-[0_0_8px_hsl(183_100%_50%/0.4)]"
                  : "border-border/30 hover:border-primary/50"
              )}
            >
              <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />

              {/* Cover badge */}
              {i === coverIndex && (
                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full font-medium">
                  CAPA
                </span>
              )}

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {i !== coverIndex && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCover(i); }}
                    className="w-7 h-7 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary hover:bg-primary/40 transition-colors"
                    title="Definir como capa"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                  className="w-7 h-7 rounded-full bg-destructive/20 border border-destructive/50 flex items-center justify-center text-destructive hover:bg-destructive/40 transition-colors"
                  title="Remover"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
