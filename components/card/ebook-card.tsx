import * as React from "react"
import { Card, CardContent, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { BookIcon, ExternalLinkIcon } from "lucide-react"
import Link from "next/link"
import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"

interface EBookCardProps {
  title: string
  language: string
  type: string
  url: string
}

export function EBookCard({
  title,
  language,
  type,
  url,
}: EBookCardProps) {
  return (
    <Card className="group relative bg-card overflow-hidden rounded-lg border border-border transition-all duration-200 hover:shadow hover:shadow-primary/30 hover:-translate-y-0.5 flex flex-col">
      <div className="relative h-24 w-full overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20">
            {/* Decorative Orbs */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary/20 rounded-full blur-2xl" />
            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <BookIcon 
                className="h-12 w-12 text-primary/40 group-hover:text-primary/60 transition-colors -translate-y-3" 
              />
            </div>
          </div>
          
          {/* Bottom Metadata */}
          <div className="absolute bottom-0 inset-x-0">
            <div className="px-3 py-1.5 bg-background/50 backdrop-blur-sm">
              <span className="text-xs text-muted-foreground truncate block">
                {type}
              </span>
            </div>
          </div>
        </div>
        
        {/* Top Badge */}
        <div className="absolute top-2 left-2">
          <Badge
            variant="secondary"
            className={cn(
              "px-2.5 py-1 text-xs font-medium",
              language === "English" 
                ? "bg-blue-100 text-blue-800 border-blue-200" 
                : "bg-green-100 text-green-800 border-green-200"
            )}
          >
            {language}
          </Badge>
        </div>
      </div>

      <CardContent className="p-3 flex flex-col flex-1">
        <CardTitle className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors mb-auto">
          {title}
        </CardTitle>
        
        <div className="mt-3 pt-3 border-t border-border/50">
          <Link href={url} passHref legacyBehavior>
            <Button 
              asChild 
              variant="outline" 
              size="sm" 
              className="w-full h-8 text-xs group-hover:bg-primary/5"
            >
              <a target="_blank" rel="noopener noreferrer">
                Buka / Unduh
                <ExternalLinkIcon className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
