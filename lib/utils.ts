import { Genders, TrainingStatus } from "@prisma/client";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(priceInCents: string) {
  const price = parseFloat(priceInCents);
  const dollars = price / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    // Use minimumFractionDigits to handle cases like $59.00 -> $59
    minimumFractionDigits: dollars % 1 !== 0 ? 2 : 0,
  }).format(dollars);
}




export function isValidSubscription(status: any) {
  return !["cancelled", "expired", "unpaid"].includes(status);
}


export function formatDate(date: string | number | Date | null | undefined) {
  if (!date) return "";

  return new Date(date).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}



export function mapReplicateStatus(status: string): TrainingStatus {
  switch (status) {
    case "starting":
      return TrainingStatus.starting;
    case "processing":
      return TrainingStatus.processing;
    case "completed":
      return TrainingStatus.succeeded;
    case "failed":
      return TrainingStatus.failed;
    case "canceled":
    case "aborted": // map "aborted" to canceled
      return TrainingStatus.canceled;
    default:
      return TrainingStatus.failed; // fallback
  }
}


export function mapGender(gender: string): Genders {
  switch (gender.toLowerCase()) {
    case "male":
    case "man":
      return Genders.man;
    case "female":
    case "woman":
      return Genders.women;
    default:
      return Genders.man; // default fallback
  }
}
