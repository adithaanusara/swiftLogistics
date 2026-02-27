export default function DataTable({ columns, rows }) {
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((c) => <th key={c}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={columns.length} className="small">No data available.</td></tr>
        ) : (
          rows.map((r, idx) => (
            <tr key={idx}>
              {Object.values(r).map((v, i) => <td key={i}>{v}</td>)}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}