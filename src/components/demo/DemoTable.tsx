export interface DemoTableColumn<T> {
  key: keyof T | string;
  label: string;
  align?: "left" | "right" | "center";
  render?: (row: T) => React.ReactNode;
}

export default function DemoTable<T extends { [key: string]: any }>({
  columns,
  rows,
  keyField,
}: {
  columns: DemoTableColumn<T>[];
  rows: T[];
  keyField: keyof T;
}) {
  return (
    <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink/5 text-xs uppercase tracking-wide text-ink/50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 font-medium ${
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={String(row[keyField])} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`px-4 py-3 ${
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                    }`}
                  >
                    {col.render ? col.render(row) : row[col.key as string]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
