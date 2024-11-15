import { BookOpen, Gamepad, MessageCircle, Trophy } from 'lucide-react';

export default function Fitur() {
  const fiturList = [
    {
      icon: BookOpen,
      title: "Materi Lengkap",
      desc: "Pembelajaran dari dasar hingga mahir"
    },
    {
      icon: Gamepad,
      title: "Game Interaktif",
      desc: "Belajar sambil bermain game seru"
    },
    {
      icon: MessageCircle,
      title: "Latihan Percakapan",
      desc: "Praktik dialog bahasa Korea sehari-hari"
    },
    {
      icon: Trophy,
      title: "Sistem Reward",
      desc: "Dapatkan penghargaan atas pencapaianmu"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Fitur Unggulan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {fiturList.map((fitur, index) => {
            const Icon = fitur.icon;
            return (
              <div key={index} className="bg-background border border-primary/20 rounded-xl p-6 text-center hover:border-primary transition-colors">
                <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">{fitur.title}</h3>
                <p className="text-primary/80">{fitur.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
