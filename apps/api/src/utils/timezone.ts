export function startOfNextDay(timezone: string): number {
  // Get the current date in the given timezone
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find((p) => p.type === 'year')?.value ?? '', 10);
  const month = parseInt(parts.find((p) => p.type === 'month')?.value ?? '', 10);
  const day = parseInt(parts.find((p) => p.type === 'day')?.value ?? '', 10);

  // Create date for the next day at midnight in the specified timezone
  const nextDay = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

  // Convert back to UTC to get the correct timestamp
  const offset = getTimezoneOffset(now, timezone);
  const nextDayUTC = new Date(nextDay.getTime() + offset);

  return nextDayUTC.getTime();
}

function getTimezoneOffset(date: Date, timezone: string): number {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  return utcDate.getTime() - tzDate.getTime();
}

