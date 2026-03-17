import { Pickaxe } from 'lucide-react';

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-accent">
        <Pickaxe className="h-5 w-5 accent-text" />
      </div>
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80">
          Minecraft
        </div>
        <div className="text-lg font-semibold text-white">Progression Companion</div>
      </div>
    </div>
  );
}
