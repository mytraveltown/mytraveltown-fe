import { useState } from "react";
import { Share2, Link2, Send, MessageCircle, Instagram, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  buildPackageUrl,
  buildShareLink,
  copyToClipboard,
  stopCardNavigation,
  type ShareTarget,
} from "@/lib/share";
import { packageText } from "@/lib/text";

interface ShareButtonProps {
  /** Package slug (preferred, SEO-friendly) or id. */
  packageSlugOrId: number | string;
  title: string;
  className?: string;
  size?: "sm" | "md";
}

const SHARE_OPTIONS: { target: ShareTarget; label: string; icon: typeof Send; color: string }[] = [
  { target: "whatsapp", label: packageText.share.options.whatsapp, icon: MessageCircle, color: "bg-green-100 text-green-600" },
  { target: "telegram", label: packageText.share.options.telegram, icon: Send, color: "bg-sky-100 text-sky-500" },
  { target: "instagram", label: packageText.share.options.instagram, icon: Instagram, color: "bg-pink-100 text-pink-600" },
  { target: "copy", label: packageText.share.options.copy, icon: Link2, color: "bg-gray-100 text-gray-700" },
];

export function ShareButton({ packageSlugOrId, title, className, size = "md" }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = buildPackageUrl(packageSlugOrId);

  const copyLink = async (successMessage: string) => {
    const ok = await copyToClipboard(url);
    if (!ok) {
      toast.error(packageText.share.copyFailed);
      return;
    }
    toast.success(successMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (target: ShareTarget) => {
    if (target === "copy") return copyLink(packageText.share.linkCopied);

    if (target === "instagram") {
      // Instagram has no web share URL, so copy the link and open Instagram to paste it
      await copyLink(packageText.share.linkCopiedInstagram);
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
      return;
    }

    window.open(buildShareLink(target, { url, title }), "_blank", "noopener,noreferrer");
  };

  return (
    // Dialog is portaled but React events still bubble to the parent card <Link>; stop them here
    <span onClick={stopCardNavigation}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label={packageText.share.triggerAria}
            className={cn(
              "flex items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur transition hover:scale-110",
              size === "sm" ? "h-7 w-7" : "h-9 w-9",
              className
            )}
          >
            <Share2 className={cn("text-gray-700", size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")} />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{packageText.share.title}</DialogTitle>
            <DialogDescription className="line-clamp-2">{title}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-2">
            {SHARE_OPTIONS.map(({ target, label, icon: Icon, color }) => (
              <button
                key={target}
                type="button"
                onClick={() => handleShare(target)}
                className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-caption hover:bg-muted transition"
              >
                <span className={cn("flex h-11 w-11 items-center justify-center rounded-full", color)}>
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-1.5 pl-3">
            <input
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 bg-transparent text-caption text-muted-foreground outline-none"
              aria-label={packageText.share.linkAria}
            />
            <button
              type="button"
              onClick={() => copyLink(packageText.share.linkCopied)}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-caption fw-semibold text-primary-foreground hover:opacity-90"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
              {copied ? packageText.share.copied : packageText.share.copy}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </span>
  );
}
