

export default function EpsTopikGame() {
  return (
    
      <div className="flex items-center justify-center min-h-[80vh] p-6">
        <div className="bg-card rounded-xl shadow-lg p-8 max-w-md w-full border">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary">
              Segera Hadir!
            </h1>
            <div className="mt-2 h-1 w-20 bg-primary mx-auto rounded-full"></div>
          </div>
          
          <p className="text-muted-foreground mb-6 text-center text-lg">
            Latihan EPS-TOPIK akan segera hadir dengan fitur-fitur menarik!
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-secondary rounded-lg">
              <div className="text-primary">📚</div>
              <p className="text-secondary-foreground">Bank soal lengkap</p>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-secondary rounded-lg">
              <div className="text-primary">⏱️</div>
              <p className="text-secondary-foreground">Simulasi ujian</p>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-secondary rounded-lg">
              <div className="text-primary">📝</div>
              <p className="text-secondary-foreground">Pembahasan detail</p>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-secondary rounded-lg">
              <div className="text-primary">📈</div>
              <p className="text-secondary-foreground">Tracking progress</p>
            </div>
          </div>
        </div>
      </div>
    
  );
}
