import HangeulGame from "./components/HangeulGame";

export default function HangeulPage() {
  return (
    <div className="flex items-center justify-center h-full pb-24">
      <div className="w-full max-w-3xl">
        <HangeulGame />
      </div>
    </div>
  );
}
