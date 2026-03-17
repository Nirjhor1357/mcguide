export default function DashboardLoading() {
  return (
    <div className="container-shell py-20">
      <div className="glass gradient-border rounded-[2rem] p-8">
        <div className="h-10 w-64 animate-pulse rounded-2xl bg-white/10" />
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-3xl bg-white/8" />
          ))}
        </div>
      </div>
    </div>
  );
}
