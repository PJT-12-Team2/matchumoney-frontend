export function roundToTwoDecimalPlaces(value) {
  if (isNaN(value)) return value;
  return Math.round(parseFloat(value) * 100) / 100;
}
