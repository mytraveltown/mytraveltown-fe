import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { MediaKind } from "./MediaTile";

export interface MediaPreviewItem {
  src: string;
  kind: MediaKind;
  title: string;
}

interface MediaPreviewDialogProps {
  item: MediaPreviewItem | null;
  onClose: () => void;
}

/** Full-size preview of one gallery image or video. */
export function MediaPreviewDialog({ item, onClose }: MediaPreviewDialogProps) {
  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-4">
        {item && (
          <>
            <DialogTitle className="text-body-sm fw-medium text-neutral-700 truncate pr-8">
              {item.title}
            </DialogTitle>
            <div className="flex items-center justify-center bg-neutral-950 rounded-lg overflow-hidden">
              {item.kind === "image" ? (
                <img src={item.src} alt={item.title} className="max-h-[75vh] w-auto object-contain" />
              ) : (
                <video src={item.src} controls autoPlay playsInline className="max-h-[75vh] w-full" />
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
