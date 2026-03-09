export default function PlaceholderTab({ title, description }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="mt-2">{description}</p>
    </div>
  );
}
