export function StatCard({ label, value, helper, hint }: { label: string; value: any; helper?: string; hint?: string }) {
  return <div className="card stat"><span>{label}</span><strong>{value}</strong>{helper || hint ? <small>{helper || hint}</small> : null}</div>;
}
