import Link from "next/link";

const flows = [
  {
    href: "/flow1-goodeal-retention",
    title: "굿딜 테마스탬프",
    description: "온보딩(보상테마 선택) → 미션참여(스탬프+골든타임) → 리마인드 → 보상획득 전체 여정",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">카카오페이 프로토타입</h1>
        <p className="text-zinc-500 mb-10">클릭해서 시나리오를 확인하세요</p>
        <div className="grid gap-4">
          {flows.map((flow) => (
            <Link
              key={flow.href}
              href={flow.href}
              className="block rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-zinc-300"
            >
              <h2 className="text-lg font-semibold text-zinc-900">{flow.title}</h2>
              <p className="text-sm text-zinc-500 mt-1">{flow.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
