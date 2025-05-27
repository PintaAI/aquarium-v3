import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CollectionSelector from './CollectionSelector';

interface StartScreenProps {
  onSelectCollection: (collectionId: number | undefined, title: string) => void;
}

export function StartScreen({ onSelectCollection }: StartScreenProps) {
  return (
    <Card className="w-full h-full flex flex-col shadow-lg bg-gradient-to-b from-muted/30 to-background">
      <CardHeader className="flex-shrink-0 pb-0 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <CardTitle className="text-3xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              플래시카드
            </CardTitle>
            <Badge variant="outline" className="uppercase text-xs border-accent">
              Kartu Flash
            </Badge>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/10 animate-gradient" />
      </CardHeader>

      <CardContent className="flex-grow flex flex-col items-center justify-center gap-12 pt-12">
        <div className="relative">
          <h2 className="text-4xl font-bold mb-3">Mulai Belajar</h2>
          <p className="text-muted-foreground text-lg max-w-md">
            Pilih koleksi kata yang ingin Anda Hafalkan
          </p>
          
        </div>

        <div className="w-full max-w-xl space-y-8">
          <CollectionSelector 
            onSelect={(id, title) => onSelectCollection(id, title)} 
          />
          
          <div className="w-full max-w-sm mx-auto p-4 rounded-lg bg-gradient-to-br from-muted/30 to-background shadow-sm text-center border border-border/50">
            <div className="text-primary font-medium mb-2">Cara Bermain</div>
            <div className="text-sm text-muted-foreground">Klik kartu untuk melihat arti kata</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
