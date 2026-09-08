export const amountInWords = (value) => {
  const num = Math.round(Number(value || 0));
  if (num === 0) return "Zero Rupees Only";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (n) => (n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ""}`);
  const three = (n) => `${n >= 100 ? `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? " " : ""}` : ""}${n % 100 ? two(n % 100) : ""}`;
  const parts = [];
  let remaining = num;
  const crore = Math.floor(remaining / 10000000);
  if (crore) parts.push(`${three(crore)} Crore`);
  remaining %= 10000000;
  const lakh = Math.floor(remaining / 100000);
  if (lakh) parts.push(`${three(lakh)} Lakh`);
  remaining %= 100000;
  const thousand = Math.floor(remaining / 1000);
  if (thousand) parts.push(`${three(thousand)} Thousand`);
  remaining %= 1000;
  if (remaining) parts.push(three(remaining));
  return `${parts.join(" ")} Rupees Only`;
};

export const todayDate = () => new Date().toISOString().slice(0, 10);

export const preventFutureDateProps = {
  InputLabelProps: { shrink: true },
  inputProps: { max: todayDate() }
};
