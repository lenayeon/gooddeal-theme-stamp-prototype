"use client";

type Props = {
  appName?: string;
  title: string;
  body: string;
  avatarEmoji?: string;
  time?: string;
  date?: string;
  onOpen: () => void;
};

export default function PushNotificationScreen({
  appName = "카카오페이",
  title,
  body,
  avatarEmoji = "💰",
  time = "13:25",
  date = "7월 23일 목요일",
  onOpen,
}: Props) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center pt-16 px-4">
      <p className="text-white/90 text-sm">{date}</p>
      <p className="text-white text-5xl font-semibold mt-1 mb-8">{time}</p>
      <button
        onClick={onOpen}
        className="w-full bg-white/95 rounded-2xl p-4 text-left shadow-lg active:scale-[0.98] transition-transform"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-lg shrink-0">
            {avatarEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-neutral-800">{appName}</span>
              <span className="text-[11px] text-neutral-400">지금</span>
            </div>
            <p className="text-[15px] font-bold text-neutral-900 mt-0.5">{title}</p>
            <p className="text-[13px] text-neutral-500 mt-0.5 leading-snug">{body}</p>
          </div>
        </div>
      </button>
      <p className="text-white/50 text-[13px] mt-6">알림을 눌러 화면을 열어보세요</p>
    </div>
  );
}
