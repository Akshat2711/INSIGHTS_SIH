const generateUniqueID = () => {
  const now = new Date();

  // Format date as YYYYMMDD
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');

  // Format time as HHMMSSmmm (milliseconds)
  const timePart =
    now
      .toTimeString()
      .slice(0, 8) // HH:MM:SS
      .replace(/:/g, '') + now.getMilliseconds().toString().padStart(3, '0');

  // Add microseconds using performance.now()
  const microPart = Math.floor((performance.now() % 1) * 1000000)
    .toString()
    .padStart(6, '0');

  return `${datePart}${timePart}${microPart}`;
};

const getISTDateTimeRange = (day: 'today' | 'yesterday') => {
  // Get current UTC time
  const now = new Date();

  // Convert to IST by using toLocaleString with 'en-US' and 'Asia/Kolkata' timeZone
  const getISTDate = (date: Date) => {
    const istString = date.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    });
    return new Date(istString);
  };

  let targetDate = getISTDate(now);
  if (day === 'yesterday') {
    targetDate.setDate(targetDate.getDate() - 1);
  }

  // Start: 00:00, End: 23:59
  const startDate = new Date(targetDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(targetDate);
  endDate.setHours(23, 59, 0, 0);

  const format = (date: Date) =>
    date.toISOString().replace('T', ' ').slice(0, 16);

  return {
    start: format(startDate),
    end: format(endDate),
  };
};

export { generateUniqueID, getISTDateTimeRange };
