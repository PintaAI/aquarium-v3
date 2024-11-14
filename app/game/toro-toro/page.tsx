import ToroToroLayout from "./components/layout";

export default function ToroToroGame() {
  return (
    <ToroToroLayout>
      <div className="p-6">
        <p className="text-gray-600 mb-4">
          Game Toro-Toro akan segera hadir! Fitur yang akan tersedia:
        </p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Tebak kata Korea</li>
          <li>Sistem point dan level</li>
          <li>Berbagai kategori kata</li>
          <li>Mode multiplayer</li>
        </ul>
      </div>
    </ToroToroLayout>
  );
}
