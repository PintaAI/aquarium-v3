export default function Testimoni() {
  const testimonials = [
    {
      name: "Rina",
      feedback: "Platform ini sangat membantu saya belajar bahasa Korea dengan cepat dan menyenangkan!"
    },
    {
      name: "Andi",
      feedback: "Game interaktifnya membuat belajar jadi tidak membosankan. Sangat direkomendasikan!"
    },
    {
      name: "Sari",
      feedback: "Materi yang disediakan sangat lengkap dan mudah dipahami. Terima kasih!"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Apa Kata Mereka
        </h2>
        <div className="space-y-8">
          {testimonials.map((testimoni, index) => (
            <div key={index} className="bg-primary/10 p-6 rounded-lg shadow-md">
              <p className="text-lg text-primary/80 mb-4">"{testimoni.feedback}"</p>
              <h3 className="text-xl font-semibold text-primary">{testimoni.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
