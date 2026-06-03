export default function Loading() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">블로그</h1>
      </div>

      <div className="space-y-4">
        <div className="animate-pulse flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-slate-200" />
          <div className="h-6 w-1/3 rounded bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="h-6 w-3/4 rounded bg-slate-200 mb-3" />
              <div className="h-3 w-1/2 rounded bg-slate-200 mb-2" />
              <div className="space-y-2 mt-2">
                <div className="h-3 w-full rounded bg-slate-200" />
                <div className="h-3 w-5/6 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
