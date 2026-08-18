"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PhoneFrame from "@/components/PhoneFrame";
import StatusBar from "@/components/StatusBar";
import PushNotificationScreen from "@/components/PushNotificationScreen";

type ThemeId = "cafe" | "cvs" | "bakery";
type SlotState = "empty" | "done";

type RewardType = {
  label: string;
  unit: "원" | "P";
  min: number;
  max: number;
  hint: string;
};

type Theme = {
  id: ThemeId;
  emoji: string;
  title: string;
  quote: string;
  rewardTypes: [RewardType, RewardType];
  goldenTime: string | null;
  brandLabel: string;
  bgGradient: string;
  bgEmojis: string[];
};

const THEMES: Theme[] = [
  {
    id: "cafe",
    emoji: "☕",
    title: "카페인에 진심",
    quote: "난 커피가 없으면 매일 허전해",
    rewardTypes: [
      { label: "카페인 지원 쿠폰", unit: "원", min: 1000, max: 5000, hint: "최소 1천원부터 5천원까지 랜덤!" },
      { label: "카페인 지원금", unit: "P", min: 10, max: 50000, hint: "최소 10P부터 5만P까지 랜덤!" },
    ],
    goldenTime: "13~14시",
    brandLabel: "카페",
    bgGradient: "from-[#5B3A29] to-[#2E1A12]",
    bgEmojis: ["☕", "🫘", "🍮"],
  },
  {
    id: "cvs",
    emoji: "🏪",
    title: "편의점 야호",
    quote: "난 모든 일상의 소비가 편의점에 몰린 편",
    rewardTypes: [
      { label: "편의점 지원 쿠폰", unit: "원", min: 1000, max: 5000, hint: "최소 1천원부터 5천원까지 랜덤!" },
      { label: "편의점 지원금", unit: "P", min: 10, max: 50000, hint: "최소 10P부터 5만P까지 랜덤!" },
    ],
    goldenTime: "19~20시",
    brandLabel: "편의점",
    bgGradient: "from-[#0F4C4C] to-[#082626]",
    bgEmojis: ["🏪", "🥤", "🍙"],
  },
  {
    id: "bakery",
    emoji: "🥐",
    title: "디저트 중독",
    quote: "난 밥대신 빵을 좋아해",
    rewardTypes: [
      { label: "빵순이 지원 쿠폰", unit: "원", min: 1000, max: 5000, hint: "최소 1천원부터 5천원까지 랜덤!" },
      { label: "빵순이 지원금", unit: "P", min: 10, max: 50000, hint: "최소 10P부터 5만P까지 랜덤!" },
    ],
    goldenTime: null,
    brandLabel: "베이커리",
    bgGradient: "from-[#7A4B6B] to-[#4A2C42]",
    bgEmojis: ["🥐", "🍞", "🧁"],
  },
];

const WEEK_LABELS = ["1주차 8/1~8/7", "2주차 8/8~8/15", "3주차 8/16~8/23", "4주차 8/24~8/30"];
const BONUS_TARGET = 9;
const GOLDEN_WINDOW_SECONDS = 45 * 60;

const EMOJI_SPOTS = [
  { top: "6%", left: "8%", size: 34, rot: -12 },
  { top: "12%", left: "76%", size: 44, rot: 10 },
  { top: "34%", left: "18%", size: 28, rot: 6 },
  { top: "42%", left: "82%", size: 32, rot: -8 },
];

const THEME_SELECT_SPOTS = [
  { top: "5%", left: "10%", size: 26, rot: -10 },
  { top: "8%", left: "80%", size: 30, rot: 12 },
  { top: "30%", left: "88%", size: 24, rot: -6 },
  { top: "55%", left: "4%", size: 28, rot: 8 },
  { top: "78%", left: "85%", size: 26, rot: -14 },
];

const CONFETTI_EMOJIS = ["☕", "🏪", "🥐", "🎉", "✨"];

const BRAND_BY_THEME: Record<ThemeId, { name: string; emoji: string; dist: string; discount: string }> = {
  cafe: { name: "메가MGC커피", emoji: "☕", dist: "82m", discount: "5% 할인" },
  cvs: { name: "세븐일레븐", emoji: "🏪", dist: "195m", discount: "10% 할인" },
  bakery: { name: "파리바게뜬", emoji: "🥐", dist: "120m", discount: "1,000원 할인" },
};

const FILLER_BRANDS = [
  { name: "배스킨라빈스", emoji: "🍦", dist: "148m", discount: "4% 할인" },
  { name: "이십사시감자탕", emoji: "🍲", dist: "210m", discount: "4% 할인" },
];

type View =
  | "push"
  | "home"
  | "onboardTheme"
  | "onboardConfirm"
  | "mission"
  | "payment"
  | "paymentSuccess"
  | "reminderPush";

type GoldenState = { week: number; slot: number; remainingSec: number } | null;

function makeEmptyWeeks(): SlotState[][] {
  return Array.from({ length: 4 }, () => Array<SlotState>(4).fill("empty"));
}

function formatCountdown(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function StampSlot({
  state,
  golden,
  countdown,
}: {
  state: SlotState;
  golden: boolean;
  countdown?: string;
}) {
  if (golden) {
    return (
      <div className="relative shrink-0 mb-5">
        <div
          className="w-11 h-11 rounded-full p-[3px] bg-[conic-gradient(from_0deg,#f59e0b,#ec4899,#8b5cf6,#f59e0b)] animate-spin"
          style={{ animationDuration: "3s" }}
        >
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-base">⏱</div>
        </div>
        {countdown && (
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-amber-700 bg-amber-50 rounded-full px-1.5 py-0.5 border border-amber-300">
            {countdown}
          </span>
        )}
      </div>
    );
  }
  return (
    <div
      className={`w-11 h-11 rounded-full flex items-center justify-center text-base border-2 shrink-0 ${
        state === "done" ? "bg-[#FEE500] border-[#FEE500]" : "border-dashed border-zinc-300"
      }`}
    >
      {state === "done" ? "✅" : ""}
    </div>
  );
}

export default function Flow1GoodDealRetention() {
  const [view, setView] = useState<View>("push");
  const [themeId, setThemeId] = useState<ThemeId | null>(null);
  const [joined, setJoined] = useState(false);
  const [weeks, setWeeks] = useState<SlotState[][]>(makeEmptyWeeks());
  const [goldenActive, setGoldenActive] = useState<GoldenState>(null);
  const [weekRewardClaimed, setWeekRewardClaimed] = useState<boolean[]>([false, false, false, false]);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [rewardModal, setRewardModal] = useState<{ text: string; kind: "weekly" | "bonus" } | null>(null);
  const [consentSheetOpen, setConsentSheetOpen] = useState(false);
  const [consentRequired, setConsentRequired] = useState(false);
  const [consentOptional, setConsentOptional] = useState(false);

  const theme = THEMES.find((t) => t.id === themeId) ?? null;
  const totalStamps = weeks.flat().filter((s) => s === "done").length;
  const currentWeekIdx = weeks.findIndex((w) => w.includes("empty"));

  const goldenWeek = goldenActive?.week;
  const goldenSlot = goldenActive?.slot;

  useEffect(() => {
    if (goldenWeek === undefined || goldenSlot === undefined) return;
    const id = setInterval(() => {
      setGoldenActive((prev) => {
        if (!prev) return prev;
        if (prev.remainingSec <= 1) return null;
        return { ...prev, remainingSec: prev.remainingSec - 1 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [goldenWeek, goldenSlot]);

  function grantReward(): string {
    if (!theme) return "";
    const type = theme.rewardTypes[Math.floor(Math.random() * theme.rewardTypes.length)];
    const raw = type.min + Math.random() * (type.max - type.min);
    const step = type.unit === "원" ? 100 : 10;
    const amount = Math.round(raw / step) * step;
    return `${type.label} ${amount.toLocaleString()}${type.unit}`;
  }

  function startOnboarding() {
    setView("onboardTheme");
  }

  function confirmTheme() {
    setConsentSheetOpen(true);
  }

  function confirmConsent() {
    setConsentSheetOpen(false);
    setView("onboardConfirm");
  }

  function startMission() {
    setJoined(true);
    setWeeks(makeEmptyWeeks());
    setWeekRewardClaimed([false, false, false, false]);
    setBonusClaimed(false);
    setGoldenActive(null);
    setView("home");
  }

  function openGoldenWindow() {
    if (!theme?.goldenTime || currentWeekIdx === -1) return;
    const slotIdx = weeks[currentWeekIdx].indexOf("empty");
    setGoldenActive({ week: currentWeekIdx, slot: slotIdx, remainingSec: GOLDEN_WINDOW_SECONDS });
  }

  function addStamp(golden: boolean) {
    if (!joined || !theme || currentWeekIdx === -1) return;
    const newWeeks = weeks.map((w) => [...w]);
    const week = newWeeks[currentWeekIdx];
    const firstEmpty = week.indexOf("empty");
    week[firstEmpty] = "done";
    let gained = 1;
    if (golden) {
      const secondEmpty = week.indexOf("empty");
      if (secondEmpty !== -1) {
        week[secondEmpty] = "done";
        gained = 2;
      }
    }
    setWeeks(newWeeks);
    setGoldenActive(null);

    const weekNowFull = !week.includes("empty");
    const newTotal = totalStamps + gained;

    if (weekNowFull && !weekRewardClaimed[currentWeekIdx]) {
      const picked = grantReward();
      setWeekRewardClaimed((prev) => prev.map((v, i) => (i === currentWeekIdx ? true : v)));
      setRewardModal({ text: picked, kind: "weekly" });
    } else if (newTotal >= BONUS_TARGET && !bonusClaimed) {
      const picked = grantReward();
      setBonusClaimed(true);
      setRewardModal({ text: picked, kind: "bonus" });
    }
  }

  function payAtBrand() {
    addStamp(false);
    setView("paymentSuccess");
  }

  const filledThisWeek = currentWeekIdx === -1 ? 4 : weeks[currentWeekIdx].filter((s) => s === "done").length;
  const dynamicBrand = BRAND_BY_THEME[themeId ?? "cafe"];

  return (
    <div className="flex flex-col items-center gap-6">
      <PhoneFrame>
        <div className="relative w-full h-full">
          {view === "push" && (
            <PushNotificationScreen
              title="굿딜 테마스탬프 오픈! 🎉"
              body="이번 달 나만의 소비 습관으로 업계 최저가 혜택을 얻을 수 있어요!"
              avatarEmoji="🎁"
              onOpen={() => setView("home")}
            />
          )}

          {view === "home" && (
            <div className="w-full h-full bg-white overflow-y-auto">
              <div className="bg-gradient-to-b from-sky-200 to-sky-300 px-4 pt-3 pb-7">
                <div className="flex items-center justify-between mb-6 text-zinc-800">
                  <span className="text-xl">‹</span>
                  <span className="flex items-center gap-3 text-base">
                    <span>ⓘ</span>
                    <span>🔖</span>
                    <span>🏠</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[15px] font-bold text-zinc-900 leading-snug">
                      굿바이 썸머, 컴포즈커피
                      <br />
                      무제한 10% 할인
                    </p>
                    <button className="mt-3 bg-zinc-800/80 text-white text-[12px] rounded-full px-3 py-1.5">
                      지금 확인하기
                    </button>
                  </div>
                  <div className="text-4xl">🥤🧉</div>
                </div>
                <p className="text-right text-[11px] text-zinc-500 mt-2">2 | 8</p>
              </div>

              <div className="px-4 -mt-4">
                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] text-zinc-400">3개월 동안 받은 혜택</p>
                      <p className="text-[16px] font-bold text-zinc-900">16,384원</p>
                    </div>
                    <div className="w-px h-8 bg-zinc-100" />
                    <div>
                      <p className="text-[12px] text-zinc-400">공유 리워드</p>
                      <p className="text-[16px] font-bold text-zinc-900">20원</p>
                    </div>
                  </div>

                  <div className="h-px bg-zinc-100 my-3" />

                  {!joined ? (
                    <div className="bg-[#FFFBE6] rounded-xl p-3 flex items-center gap-3">
                      <span className="text-2xl">🎁</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-zinc-900">굿딜 테마스탬프 이번 달 오픈!</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          그 어떤 스탬프, 통신사 할인보다 강력한 혜택
                        </p>
                      </div>
                      <button
                        onClick={startOnboarding}
                        className="shrink-0 bg-[#FEE500] text-black text-[12px] font-bold rounded-full px-3 py-2"
                      >
                        시작하기
                      </button>
                    </div>
                  ) : (
                    theme && (
                      <div className="bg-[#FFFBE6] rounded-xl p-3 flex items-center gap-3">
                        <span className="text-2xl">{theme.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-zinc-900">{theme.title} 스탬프 진행중</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            이번 주 {filledThisWeek}/4 · 보너스 {Math.min(totalStamps, BONUS_TARGET)}/{BONUS_TARGET}
                          </p>
                        </div>
                        <button
                          onClick={() => setView("mission")}
                          className="shrink-0 bg-zinc-900 text-white text-[12px] font-bold rounded-full px-3 py-2"
                        >
                          현황 보기
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="px-4 mt-3">
                <div className="bg-[#FFF4D6] rounded-2xl p-3 flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-zinc-800">🎂 08~12년생이면! 10% 할인</p>
                  <button className="bg-white text-[12px] font-semibold rounded-full px-3 py-1.5 text-zinc-700">
                    혜택 받기
                  </button>
                </div>
              </div>

              <div className="px-4 mt-5">
                <p className="text-[15px] font-bold text-zinc-900 mb-3">회원님을 위한 추천</p>
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {["내 주변", "나를 위한", "높은 혜택", "틴즈 혜택"].map((t, i) => (
                    <span
                      key={t}
                      className={`text-[12px] px-3 py-1.5 rounded-full border shrink-0 ${
                        i === 0
                          ? "border-blue-400 text-blue-500 font-semibold"
                          : "border-zinc-200 text-zinc-500"
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  <button
                    onClick={() => setView("payment")}
                    className="shrink-0 w-[108px] bg-white rounded-xl border border-zinc-100 p-3 text-left"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-2xl">{dynamicBrand.emoji}</span>
                      <span className="text-zinc-300 text-sm">🔖</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">{dynamicBrand.dist}</p>
                    <p className="text-[11px] font-bold text-zinc-800 truncate">{dynamicBrand.name}</p>
                    <p className="text-[13px] font-bold text-blue-500">{dynamicBrand.discount}</p>
                  </button>
                  {FILLER_BRANDS.map((b) => (
                    <div key={b.name} className="shrink-0 w-[108px] bg-white rounded-xl border border-zinc-100 p-3">
                      <div className="flex justify-between items-start">
                        <span className="text-2xl">{b.emoji}</span>
                        <span className="text-zinc-300 text-sm">🔖</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">{b.dist}</p>
                      <p className="text-[11px] font-bold text-zinc-800 truncate">{b.name}</p>
                      <p className="text-[13px] font-bold text-blue-500">{b.discount}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 mt-4">
                <div className="bg-gradient-to-r from-fuchsia-400 to-purple-400 text-white text-[12px] font-semibold rounded-full px-4 py-2.5 flex items-center justify-between">
                  <span>공유하고 매일 1,000P 받기</span>
                  <span>›</span>
                </div>
              </div>
              <div className="px-4 mt-3 mb-4">
                <div className="bg-zinc-100 rounded-full px-4 py-2.5 text-[13px] text-zinc-400">
                  🔍 브랜드를 검색해보세요
                </div>
              </div>
            </div>
          )}

          {view === "onboardTheme" && (
            <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#FFF3D6] via-[#FFEAF2] to-[#E8F5FF] flex flex-col">
              {THEME_SELECT_SPOTS.map((spot, i) => (
                <span
                  key={i}
                  className="absolute opacity-25 select-none pointer-events-none"
                  style={{ top: spot.top, left: spot.left, fontSize: spot.size, transform: `rotate(${spot.rot}deg)` }}
                >
                  {CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length]}
                </span>
              ))}
              <div className="relative z-10 flex flex-col h-full">
                <StatusBar />
                <div className="px-6 pt-3 pb-2">
                  <p className="text-xl font-extrabold text-zinc-900">받고 싶은 보상 테마를 선택하세요 🎯</p>
                  <p className="text-[13px] text-zinc-500 mt-1">
                    하나만 고를 수 있어요. 다음 달 1일에 다시 고를 수 있어요.
                  </p>
                </div>
                <div className="flex-1 px-5 py-3 flex flex-col gap-3 overflow-y-auto">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setThemeId(t.id)}
                      className={`text-left rounded-3xl border-2 p-4 flex items-center gap-3 shadow-sm transition-colors bg-white ${
                        themeId === t.id ? "border-[#FEE500] ring-2 ring-[#FEE500]/40" : "border-transparent"
                      }`}
                    >
                      <span
                        className={`w-14 h-14 rounded-full shrink-0 flex items-center justify-center text-2xl bg-gradient-to-br ${t.bgGradient}`}
                      >
                        {t.emoji}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-900">{t.title}</p>
                        <p className="text-[13px] text-zinc-500 truncate">&ldquo;{t.quote}&rdquo;</p>
                      </div>
                      {themeId === t.id && <span className="ml-auto text-[#DDB800] text-xl shrink-0">✓</span>}
                    </button>
                  ))}
                </div>
                <div className="p-5">
                  <button
                    disabled={!themeId}
                    onClick={confirmTheme}
                    className={`w-full rounded-xl py-4 font-bold transition-transform ${
                      themeId ? "bg-[#FEE500] text-black active:scale-[0.98]" : "bg-white/60 text-zinc-400"
                    }`}
                  >
                    선택 완료
                  </button>
                </div>
              </div>
            </div>
          )}

          {view === "onboardConfirm" && theme && (
            <div className={`w-full h-full relative overflow-hidden bg-gradient-to-b ${theme.bgGradient} flex flex-col`}>
              {EMOJI_SPOTS.map((spot, i) => (
                <span
                  key={i}
                  className="absolute opacity-20 select-none pointer-events-none"
                  style={{ top: spot.top, left: spot.left, fontSize: spot.size, transform: `rotate(${spot.rot}deg)` }}
                >
                  {theme.bgEmojis[i % theme.bgEmojis.length]}
                </span>
              ))}
              <div className="relative z-10 flex flex-col h-full">
                <StatusBar dark />
                <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4 text-white">
                  <p className="text-6xl drop-shadow-lg">{theme.emoji}</p>
                  <p className="text-2xl font-extrabold">{theme.title}</p>
                  <p className="text-[14px] text-white/80">&ldquo;{theme.quote}&rdquo;</p>
                  <div className="w-full bg-white/95 rounded-2xl p-4 mt-2 text-left">
                    <p className="text-[13px] font-semibold text-zinc-700 mb-3">미션 완료 시 아래 중 랜덤 지급 🎁</p>
                    <div className="flex flex-col gap-3">
                      {theme.rewardTypes.map((r) => (
                        <div key={r.label}>
                          <p className="text-[13px] font-semibold text-zinc-800">🔸 {r.label}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{r.hint}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="relative z-10 p-5">
                  <button
                    onClick={startMission}
                    className="w-full bg-[#FEE500] rounded-xl py-4 font-bold text-black active:scale-[0.98] transition-transform"
                  >
                    한달 미션 시작하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {view === "mission" && theme && (
            <div className={`w-full h-full relative overflow-hidden bg-gradient-to-b ${theme.bgGradient}`}>
              {EMOJI_SPOTS.map((spot, i) => (
                <span
                  key={i}
                  className="absolute opacity-20 select-none pointer-events-none"
                  style={{ top: spot.top, left: spot.left, fontSize: spot.size, transform: `rotate(${spot.rot}deg)` }}
                >
                  {theme.bgEmojis[i % theme.bgEmojis.length]}
                </span>
              ))}

              <div className="relative z-10 px-4 pt-3 pb-5 flex flex-col text-white">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setView("home")} className="text-xl">
                    ‹
                  </button>
                  <span className="text-[15px] font-bold">굿딜 테마스탬프</span>
                  <span className="flex items-center gap-3 text-base">
                    <span>🔖</span>
                    <span>🏠</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{theme.emoji}</span>
                  <div>
                    <p className="text-lg font-extrabold">{theme.title}</p>
                    <p className="text-[12px] text-white/80">&ldquo;{theme.quote}&rdquo;</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex flex-col bg-white rounded-t-3xl" style={{ height: "calc(100% - 132px)" }}>
                <div className="flex-1 overflow-y-auto px-5 py-5">
                  <span className="inline-block text-[11px] font-semibold bg-zinc-100 text-zinc-500 rounded-full px-2.5 py-1 mb-4">
                    미션 참여중
                  </span>

                  {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="mb-4">
                      <p className="text-[12px] text-zinc-400 mb-2">{WEEK_LABELS[wIdx]}</p>
                      <div className="flex items-center gap-2">
                        {week.map((s, sIdx) => {
                          const isGolden = goldenActive?.week === wIdx && goldenActive?.slot === sIdx;
                          return (
                            <StampSlot
                              key={sIdx}
                              state={s}
                              golden={isGolden}
                              countdown={isGolden ? formatCountdown(goldenActive!.remainingSec) : undefined}
                            />
                          );
                        })}
                        <span className={`text-xl ml-1 ${weekRewardClaimed[wIdx] ? "" : "opacity-25"}`}>🎁</span>
                      </div>
                    </div>
                  ))}

                  <div className="mt-2 rounded-xl bg-zinc-50 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[12px] font-semibold text-zinc-600">
                        보너스 선물! 8/1~8/30 [{Math.min(totalStamps, BONUS_TARGET)}/{BONUS_TARGET}]
                      </p>
                      <span className={`text-lg ${bonusClaimed ? "" : "opacity-25"}`}>🎁</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FEE500]"
                        style={{ width: `${(Math.min(totalStamps, BONUS_TARGET) / BONUS_TARGET) * 100}%` }}
                      />
                    </div>
                  </div>

                  {currentWeekIdx !== -1 && filledThisWeek === 3 && !goldenActive && (
                    <div className="mt-4 rounded-xl bg-[#FFFBE6] border border-[#FEE500] px-4 py-3">
                      <p className="text-[13px] font-bold text-zinc-800">스탬프 1개만 더 찍으면 보상 도착해요! 🔔</p>
                      <button
                        onClick={() => setView("reminderPush")}
                        className="text-[12px] text-[#8A6D00] underline mt-1"
                      >
                        리마인드 알림 미리보기
                      </button>
                    </div>
                  )}

                  {currentWeekIdx === -1 && (
                    <p className="text-[13px] text-zinc-400 text-center mt-4">
                      이번 달 미션을 모두 완료했어요! 다음 달 1일에 새로 초기화돼요.
                    </p>
                  )}
                </div>

                {currentWeekIdx !== -1 && (
                  <div className="px-5 pb-6 pt-2 flex flex-col gap-2.5">
                    <button
                      onClick={() => addStamp(false)}
                      className="w-full bg-zinc-900 rounded-xl py-3.5 font-bold text-white active:scale-[0.98] transition-transform"
                    >
                      {theme.brandLabel} 결제 시뮬레이션 (스탬프 +1)
                    </button>
                    {theme.goldenTime &&
                      (!goldenActive ? (
                        <button
                          onClick={openGoldenWindow}
                          className="w-full bg-white border-2 border-[#FEE500] rounded-xl py-3.5 font-bold text-black active:scale-[0.98] transition-transform"
                        >
                          ⚡ 골든타임({theme.goldenTime}) 열기 (시뮬레이션)
                        </button>
                      ) : (
                        <button
                          onClick={() => addStamp(true)}
                          className="w-full bg-[#FEE500] rounded-xl py-3.5 font-bold text-black active:scale-[0.98] transition-transform"
                        >
                          🎉 골든타임 결제하기 (스탬프 1+1)
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "payment" && (
            <div className="w-full h-full bg-white flex flex-col">
              <div className="bg-[#FEE500] px-4 pt-3 pb-3 flex items-center gap-3">
                <button onClick={() => setView("home")} className="text-xl text-black">
                  ‹
                </button>
                <span className="text-[14px] font-bold text-black">pay 카카오페이로 결제하세요</span>
              </div>

              <div className="px-5 pt-4">
                {joined && theme ? (
                  <button
                    onClick={() => setView("mission")}
                    className="w-full bg-[#FFFBE6] border border-[#FEE500] rounded-xl px-4 py-3 flex items-center justify-between mb-4"
                  >
                    <span className="text-[13px] font-semibold text-zinc-800">
                      {theme.emoji} {theme.title} 스탬프 {filledThisWeek}/4
                      {goldenActive ? " · 골든타임 진행중 ⏱" : ""}
                    </span>
                    <span className="text-zinc-400">›</span>
                  </button>
                ) : (
                  <button
                    onClick={startOnboarding}
                    className="w-full bg-[#FFFBE6] border border-[#FEE500] rounded-xl px-4 py-3 flex items-center justify-between mb-4"
                  >
                    <span className="text-[13px] font-semibold text-zinc-800">
                      🎁 굿딜 테마스탬프에 참여하고 혜택 받기
                    </span>
                    <span className="text-zinc-400">›</span>
                  </button>
                )}

                <div className="border border-zinc-100 rounded-2xl p-4 flex flex-col items-center">
                  <div className="w-40 h-40 bg-zinc-900 rounded-lg flex items-center justify-center text-white text-4xl">
                    ▦
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-2">02:50</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[13px] font-bold text-zinc-800">{dynamicBrand.name}</span>
                  <span className="text-[13px] font-bold text-blue-500">
                    {dynamicBrand.discount} · 1,000원 쿠폰 적용
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[13px] text-zinc-500">페이머니</span>
                  <span className="text-[13px] font-semibold text-zinc-800">257,700원</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[13px] text-zinc-500">페이포인트 사용</span>
                  <span className="text-[13px] font-semibold text-zinc-800">4,060원</span>
                </div>
              </div>

              <div className="mt-auto p-5">
                <button
                  onClick={payAtBrand}
                  className="w-full bg-[#FEE500] rounded-xl py-4 font-bold text-black active:scale-[0.98] transition-transform"
                >
                  결제하기
                </button>
              </div>
            </div>
          )}

          {view === "paymentSuccess" && (
            <div className="w-full h-full bg-white flex flex-col">
              <StatusBar />
              <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
                <p className="text-5xl">✅</p>
                <p className="text-xl font-bold text-zinc-900">결제 완료</p>
                {joined && theme ? (
                  <p className="text-[14px] text-zinc-500">
                    스탬프 1개 적립! ({theme.emoji} {theme.title} {filledThisWeek}/4)
                  </p>
                ) : (
                  <p className="text-[14px] text-zinc-500">결제가 완료됐어요</p>
                )}
              </div>
              <div className="p-5">
                <button
                  onClick={() => setView("home")}
                  className="w-full bg-[#FEE500] rounded-xl py-4 font-bold text-black active:scale-[0.98] transition-transform"
                >
                  홈으로 돌아가기
                </button>
              </div>
            </div>
          )}

          {view === "reminderPush" && (
            <PushNotificationScreen
              title="스탬프 1개만 더! 🔔"
              body="오늘 결제하면 바로 보상이 완성돼요. 놓치지 마세요!"
              avatarEmoji="🔔"
              onOpen={() => setView("mission")}
            />
          )}

          {consentSheetOpen && (
            <div className="absolute inset-0 z-50 bg-black/50 flex items-end">
              <div className="w-full bg-white rounded-t-3xl p-6 pb-8">
                <p className="text-lg font-bold text-zinc-900 mb-1">약관에 동의해주세요</p>
                <p className="text-[12px] text-zinc-400 mb-5">(문구는 법무 검토 후 최종 확정됩니다)</p>
                <div className="flex flex-col gap-4 mb-6">
                  <label className="flex items-center gap-3 text-[14px] text-zinc-800">
                    <input
                      type="checkbox"
                      checked={consentRequired}
                      onChange={(e) => setConsentRequired(e.target.checked)}
                      className="w-5 h-5 accent-[#FEE500]"
                    />
                    [필수] 굿딜 테마스탬프 이용약관 동의
                  </label>
                  <label className="flex items-center gap-3 text-[14px] text-zinc-800">
                    <input
                      type="checkbox"
                      checked={consentOptional}
                      onChange={(e) => setConsentOptional(e.target.checked)}
                      className="w-5 h-5 accent-[#FEE500]"
                    />
                    [선택] 알림 수신 동의
                  </label>
                </div>
                <button
                  disabled={!consentRequired}
                  onClick={confirmConsent}
                  className={`w-full rounded-xl py-4 font-bold transition-transform ${
                    consentRequired ? "bg-[#FEE500] text-black active:scale-[0.98]" : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  동의하고 계속하기
                </button>
              </div>
            </div>
          )}

          {rewardModal && (
            <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center px-6">
              <div className="w-full bg-white rounded-2xl p-6 flex flex-col items-center text-center gap-3">
                <p className="text-4xl">🎁</p>
                <p className="text-[12px] text-zinc-400">
                  {rewardModal.kind === "weekly" ? "이번 주 미션 완료!" : "월 보너스 미션 완료!"}
                </p>
                <p className="text-lg font-bold text-zinc-900">{rewardModal.text} 당첨!</p>
                <button
                  onClick={() => setRewardModal(null)}
                  className="w-full bg-[#FEE500] rounded-xl py-3 font-bold text-black mt-2 active:scale-[0.98] transition-transform"
                >
                  확인
                </button>
              </div>
            </div>
          )}
        </div>
      </PhoneFrame>
      <Link href="/" className="text-sm text-zinc-400 underline">
        ← 목록으로
      </Link>
    </div>
  );
}
