export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-8">
      <div className="relative w-[390px] h-[844px] bg-black rounded-[55px] p-3 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-2xl z-20" />
        <div className="relative w-full h-full bg-white rounded-[42px] overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
