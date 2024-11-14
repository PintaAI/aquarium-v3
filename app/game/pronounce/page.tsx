import PronounceLayout from "./components/layout";

export default function PronounceGame() {
  return (
    <PronounceLayout>
      <div className="p-6">
        <p className="text-gray-600 mb-4">
          Game latihan pengucapan akan segera hadir! Fitur yang akan tersedia:
        </p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Latihan pengucapan dasar</li>
          <li>Deteksi pengucapan</li>
          <li>Feedback langsung</li>
          <li>Level bertingkat</li>
        </ul>
      </div>
    </PronounceLayout>
  );
}
