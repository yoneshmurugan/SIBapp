import { Loader2 } from "lucide-react";

export default function HalfPageLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center z-50">
      <Loader2 className="animate-spin text-amber-500" size={48} />
    </div>
  );
}