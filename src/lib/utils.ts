import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export function formatDate(isoDate: string) {
  const dateObj = new Date(isoDate);

  const options: Intl.DateTimeFormatOptions = { month: 'short' };
  const month = new Intl.DateTimeFormat('en-US', options).format(dateObj);
  const day = dateObj.getDate();
  const hours = dateObj.getHours() % 12 || 12;
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const amPm = dateObj.getHours() >= 12 ? 'pm' : 'am';

  const formattedDate = `${month} ${day} at ${hours}:${minutes} ${amPm}`;

  return formattedDate
}


export function formatCustomDate(isoDate: string) {
  const date = new Date(isoDate);
  const today = new Date();

  // Check if the date is today
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) {
    return "Today";
  }

  // Format the date as "Dec 29 2024"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}