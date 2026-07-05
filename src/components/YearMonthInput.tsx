const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

interface YearMonthInputProps {
  label: string;
  year: number | "";
  month: number | "";
  onChange: (year: number | "", month: number | "") => void;
}

export function YearMonthInput({ label, year, month, onChange }: YearMonthInputProps) {
  return (
    <div className="year-month-input">
      <span className="year-month-input__label">{label}</span>
      <select
        aria-label={`${label}年`}
        value={year}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "", month)}
      >
        <option value="">指定なし</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}年
          </option>
        ))}
      </select>
      <select
        aria-label={`${label}月`}
        value={month}
        onChange={(e) => onChange(year, e.target.value ? Number(e.target.value) : "")}
        disabled={year === ""}
      >
        <option value="">(年全体)</option>
        {MONTHS.map((m) => (
          <option key={m} value={m}>
            {m}月
          </option>
        ))}
      </select>
    </div>
  );
}
