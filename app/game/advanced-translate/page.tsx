import AdvancedTranslateLayout from "./components/layout";

export default function AdvancedTranslateGame() {
  return (
    <AdvancedTranslateLayout>
      <div className="p-6">
        <p className="text-gray-600 mb-4">
          Game terjemahan tingkat lanjut akan segera hadir! Fitur yang akan tersedia:
        </p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Terjemahan kalimat kompleks</li>
          <li>Penjelasan grammar</li>
          <li>Konteks budaya</li>
          <li>Latihan bertingkat</li>
        </ul>
      </div>
    </AdvancedTranslateLayout>
  );
}
