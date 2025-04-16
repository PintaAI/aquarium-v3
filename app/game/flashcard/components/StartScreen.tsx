import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CollectionSelector from './CollectionSelector';

interface StartScreenProps {
  onSelectCollection: (collectionId: number | undefined) => void;
}

export function StartScreen({ onSelectCollection }: StartScreenProps) {
  return (
    <Card className="w-full h-full flex flex-col shadow-lg border-t-4 border-b-0 border-t-blue-500">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl">플래시카드</CardTitle>
            <Badge variant="outline" className="uppercase text-xs">
              Kartu Flash
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col items-center justify-center text-center gap-8">
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-3xl font-bold">Selamat Datang di FlashCard Korea</h2>
          <p className="text-muted-foreground">
            Belajar kosakata bahasa Korea dengan metode kartu flash yang efektif.
            Pilih koleksi kata yang ingin Anda pelajari dan mulai mengingat!
          </p>
        </div>
        
        <div className="space-y-6 w-full max-w-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Cara Bermain</div>
              <div className="text-sm">Klik kartu untuk melihat arti kata</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Fitur</div>
              <div className="text-sm">Lacak progres pembelajaran Anda</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Koleksi</div>
              <div className="text-sm">Pilih dari berbagai kategori kata</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Pilih Koleksi Kosakata</h3>
            <CollectionSelector onSelect={onSelectCollection} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
