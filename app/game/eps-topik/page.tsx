import EpsTopikLayout from "./components/layout";

export default function EpsTopikGame() {
  return (
    <EpsTopikLayout>
      <div className="p-6">
        <p className="text-gray-600 mb-4">
          Latihan EPS-TOPIK akan segera hadir! Fitur yang akan tersedia:
        </p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Bank soal lengkap</li>
          <li>Simulasi ujian</li>
          <li>Pembahasan detail</li>
          <li>Tracking progress</li>
        </ul>
      </div>
    </EpsTopikLayout>
  );
}
