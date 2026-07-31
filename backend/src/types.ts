export type TierId = "supporter" | "champion" | "patron";
export type TshirtSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";
export type Language = "English" | "French" | "Ukrainian" | "Dutch" | "German";

export const LANGUAGE_TO_LOCALE: Record<Language, string> = {
  English: "en",
  French: "fr",
  Ukrainian: "uk",
  Dutch: "nl",
  German: "de",
};
export type ParticipationType = "runner" | "supporter";

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone?: string;
  tshirtSize?: TshirtSize;
  language: Language;
  country: string;
  tierId: TierId;
  participationType: ParticipationType;
  gdprConsent: boolean;
  commsOptin?: boolean;
}

export interface RegisterResponse {
  participantId: string;
  fullName: string;
  email: string;
  tierId: TierId;
  tierName: string;
  participationType: ParticipationType;
  amountEur: number;
  rewards: string[];
  paymentToken: string;
}

export interface ConfirmPaymentRequest {
  token: string;
}

export interface ConfirmPaymentResponse {
  confirmed: boolean;
  participantId: string;
  tierName: string;
  amountEur: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] };

export interface FundraiserCreateRequest {
  displayName: string;
  message: string;
  goalEur: number;
}

export interface FundraiserResponse {
  slug: string;
  displayName: string;
  message: string;
  goalEur: number;
  photoUrl: string | null;
  status: "draft" | "published";
  createdAt: string;
  editToken?: string;
}

export interface FundraiserUpdateRequest {
  displayName?: string;
  message?: string;
  goalEur?: number;
  status?: "draft" | "published";
}

export interface ProgressResponse {
  totalRaisedEur: number;
  goalEur: number;
  goalPercent: number;
  participantCount: number;
  donorCount: number;
}

export interface DonorWallEntry {
  fundraiserSlug: string;
  donorName: string;
  message: string;
  createdAt: string;
}

export interface DonorWallRequest {
  fundraiserSlug: string;
  donorName: string;
  message: string;
}

export interface FundraiserRegisterResponse {
  fundraiser: {
    slug: string;
    editToken: string;
    displayName: string;
    photoUrl: string | null;
  };
  registration: {
    participantId: string;
    fullName: string;
    tierId: TierId;
    tierName: string;
    amountEur: number;
    rewards: string[];
    paymentToken: string;
  };
}
