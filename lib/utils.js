import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatToIndianNumber(num) {
  // Convert the string to a number
  const number = Number(num);

  // Check if the conversion is valid
  if (isNaN(number)) {
    return num;
  }

  // Convert the number to Indian number format
  return number.toLocaleString("en-IN");
}
