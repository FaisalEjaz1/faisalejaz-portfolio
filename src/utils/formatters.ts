/**
 * Formatting utilities for MIS & Analytics reporting (US Dollar standard)
 */

// Format currency in US Dollars ($)
export function formatCurrency(
  amount: number,
  compact = false,
  decimals = 1
): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '$0';
  
  if (compact) {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    if (abs >= 1000000000) {
      return `${sign}$${(abs / 1000000000).toFixed(decimals)}B`;
    }
    if (abs >= 1000000) {
      return `${sign}$${(abs / 1000000).toFixed(decimals)}M`;
    }
    if (abs >= 1000) {
      return `${sign}$${(abs / 1000).toFixed(decimals)}k`;
    }
    return `${sign}$${abs.toFixed(0)}`;
  }

  // Standard international comma separator format (e.g. $1,234,567)
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals > 0 ? decimals : 0,
    minimumFractionDigits: 0,
  }).format(absAmount);

  return `${isNegative ? '-' : ''}$${formatted}`;
}

// Format numbers with standard thousands separators
export function formatNumber(
  num: number,
  compact = false,
  decimals = 1
): string {
  if (isNaN(num) || num === null || num === undefined) return '0';

  if (compact) {
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    if (abs >= 1000000) {
      return `${sign}${(abs / 1000000).toFixed(decimals)}M`;
    }
    if (abs >= 1000) {
      return `${sign}${(abs / 1000).toFixed(decimals)}k`;
    }
    return `${sign}${abs.toFixed(0)}`;
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals > 0 ? decimals : 0,
  }).format(num);
}

// Format percentage to 1 decimal place (e.g. 14.2%)
export function formatPercent(value: number, includeSign = false): string {
  if (isNaN(value) || value === null || value === undefined) return '0.0%';
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

// Format date into human-readable string
export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format YYYY-MM into Month Year (e.g. "2025-04" -> "Apr 2025")
export function formatMonthYear(monthStr: string): string {
  if (!monthStr) return '-';
  const parts = monthStr.split('-');
  if (parts.length < 2) return monthStr;
  const year = parts[0];
  const month = parseInt(parts[1], 10) - 1;
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${monthNames[month] || monthStr} ${year}`;
}

// Export array of objects to CSV download
export function exportToCsv(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Header row
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `${filename.replace(/\.csv$/, '')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
