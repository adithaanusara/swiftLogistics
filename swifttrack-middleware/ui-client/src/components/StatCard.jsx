export default function StatCard({ title, value, pillText, pillTone="good" }) {
  return (
    <div className="card" style={{gridColumn:"span 3"}}>
      <div className="stat">
        <div>
          <div className="small">{title}</div>
          <div className="value">{value}</div>
        </div>
        <div className={`pill ${pillTone}`}>{pillText}</div>
      </div>
    </div>
  );
}