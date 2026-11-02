export default function RootLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6">
      <div className="flex items-center gap-3 animate-pulse">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-2xl font-black text-white shadow-md shadow-blue-500/20">
          🛡️
        </span>
        <div className="leading-tight">
          <span className="text-2xl font-black text-slate-900 tracking-tight">Trustit</span>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-blue-700">Verified Local</span>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-slate-400">
        <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
        <span>Loading verified businesses...</span>
      </div>
    </div>
  );
}
