export const formatCurrency = (amount: number): string =>
  `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatMinutes = (mins: number): string => {
  if (mins < 60) {
    return `${Math.round(mins)}m`;
  }
  const hours = Math.floor(mins / 60);
  const remaining = Math.round(mins % 60);
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
};

export const formatPercent = (pct: number): string =>
  `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
