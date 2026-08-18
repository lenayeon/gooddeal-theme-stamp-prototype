export default function StatusBar({ dark = false }: { dark?: boolean }) {
  const color = dark ? "text-white" : "text-black";
  return (
    <div className={`flex items-center justify-between px-6 pt-3 pb-1 text-[13px] font-semibold ${color}`}>
      <span>9:41</span>
      <span className="flex items-center gap-1">●●●● LTE 🔋</span>
    </div>
  );
}
