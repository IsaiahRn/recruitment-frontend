"use client";

type TabItem = {
  key: string;
  label: string;
  caption?: string;
};

export default function PageTabs({
  items,
  activeKey,
  onChange,
}: {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}) {
  const activeIndex = items.findIndex((item) => item.key === activeKey);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex flex-wrap items-start gap-8 lg:gap-12">
        {items.map((item, index) => {
          const isActive = item.key === activeKey;
          const isCompleted = index < activeIndex;

          return (
            <button key={item.key} type="button" onClick={() => onChange(item.key)} className="min-w-[180px] text-left">
              <div className={`text-[15px] font-semibold ${isActive ? "text-brand-700" : "text-slate-700"}`}>{item.label}</div>
              {item.caption ? <div className="mt-1 text-xs text-slate-400">{item.caption}</div> : null}
              <div className="mt-4 flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    isActive || isCompleted ? "border-[#2b7aef] text-[#2b7aef]" : "border-slate-300 text-slate-300"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${isActive || isCompleted ? "bg-[#2b7aef]" : "bg-slate-300"}`} />
                </span>
                {index < items.length - 1 ? <span className="h-px flex-1 bg-slate-200" /> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
