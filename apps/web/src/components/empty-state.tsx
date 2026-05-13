export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{body}</p>
    </div>
  );
}
