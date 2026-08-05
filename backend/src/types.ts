export type TierId = "supporter" | "sprinter" | "relay-runner" | "marathoner" | "ultramarathoner";
export type TshirtSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";
export type SocksSize = "36-39" | "40-42" | "43-46";
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
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  tshirtSize?: TshirtSize;
  socksSize?: SocksSize;
  language: Language;
  country?: string;
  tierId: TierId;
  participationType: ParticipationType;
  gdprConsent: boolean;
  commsOptin?: boolean;
}

export interface RegisterResponse {
  participantId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  tierId: TierId;
  tierName: string;
  participationType: ParticipationType;
  amountEur: number;
  rewards: string[];
  paymentToken: string;
  status?: "pending" | "paid";
}

export interface ConfirmPaymentRequest {
  token: string;
  amount?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface ConfirmPaymentResponse {
  confirmed: boolean;
  participantId: string;
  tierName: string;
  /** Absent when the actually-paid amount couldn't be determined — never assumed. */
  amountEur?: number;
  rewards: string[];
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
  raisedEur?: number;
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
    firstName: string;
    lastName: string;
    tierId: TierId;
    tierName: string;
    amountEur: number;
    rewards: string[];
    paymentToken: string;
  };
}
