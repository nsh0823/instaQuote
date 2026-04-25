import type { ReactNode } from "react";

export function SectionCard({
  action,
  children,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  title: string;
}): JSX.Element {
  return (
    <section className="rounded-[10px] border border-black/7.5 bg-white shadow-sm">
      <div className="flex items-center border-b border-black/7.5 p-3">
        <div className="text-[1.2rem] font-medium text-[#3d3d43]">{title}</div>
        <div className="ml-auto h-7">{action}</div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
