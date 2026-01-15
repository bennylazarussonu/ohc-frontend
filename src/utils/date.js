export function formatDateDMY(dateInput) {
  if (!dateInput) return "";

  const date = new Date(dateInput);
  if (isNaN(date)) return "";

  const day = String(date.getDate()).padStart(2, "0");

  const month = date
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase();

  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}