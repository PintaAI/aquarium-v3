"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Copy, Instagram, Youtube, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareCourseButtonProps {
  onShare?: () => void;
}

export function ShareCourseButton({ onShare }: ShareCourseButtonProps) {
  const { toast } = useToast();
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    toast({
      title: "Link Copied!",
      description: "Course link copied to clipboard.",
    });
    onShare?.();
  };

  const handleSocialShare = (platform: string) => {
    const text = "Check out this amazing course!";
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedText = encodeURIComponent(text);
    
    let shareUrl = "";
    
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "instagram":
        // Try to open Instagram web, fallback to copying link
        if (navigator.userAgent.includes('Mobile')) {
          // On mobile, try to open Instagram app
          shareUrl = `instagram://camera`;
          handleCopyLink();
          toast({
            title: "Link Copied for Instagram!",
            description: "Link copied! Open Instagram and paste it in your story or bio.",
          });
        } else {
          // On desktop, open Instagram web and copy link
          shareUrl = `https://www.instagram.com/`;
          handleCopyLink();
          toast({
            title: "Link Copied for Instagram!",
            description: "Instagram opened! Paste the link in your story or bio.",
          });
        }
        break;
      case "tiktok":
        // Open TikTok web and copy link
        shareUrl = `https://www.tiktok.com/`;
        handleCopyLink();
        toast({
          title: "Link Copied for TikTok!",
          description: "TikTok opened! Paste the link in your video description.",
        });
        break;
      case "youtube":
        // Open YouTube Studio upload page
        shareUrl = `https://studio.youtube.com/`;
        handleCopyLink();
        toast({
          title: "Link Copied for YouTube!",
          description: "YouTube Studio opened! Paste the link in your video description.",
        });
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      default:
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
      onShare?.();
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: "Amazing Course",
      text: "Check out this amazing course!",
      url: currentUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        onShare?.();
        return;
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
    
    // Fallback to copy link
    handleCopyLink();
  };

  if (!currentUrl) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
        >
          <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share (Native)
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare("twitter")}>
          <Twitter className="mr-2 h-4 w-4" />
          Share to X (Twitter)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare("whatsapp")}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382"/>
          </svg>
          Share to WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare("facebook")}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Share to Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare("telegram")}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          Share to Telegram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare("instagram")}>
          <Instagram className="mr-2 h-4 w-4" />
          Share to Instagram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare("tiktok")}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.849-1.314-1.958-1.314-3.124V.857h-3.428v14.286c0 1.905-1.552 3.428-3.429 3.428s-3.428-1.523-3.428-3.428S8.095 11.714 10 11.714c.362 0 .705.067 1.029.181V8.467a6.943 6.943 0 0 0-1.029-.076c-3.771 0-6.857 3.086-6.857 6.857S6.229 22.105 10 22.105s6.857-3.086 6.857-6.857V9.333a9.64 9.64 0 0 0 5.714 1.905v-3.429c-1.29 0-2.438-.524-3.25-1.247z"/>
          </svg>
          Share to TikTok
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare("youtube")}>
          <Youtube className="mr-2 h-4 w-4" />
          Share to YouTube
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
