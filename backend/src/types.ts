export type TierId = "supporter" | "champion" | "patron";
export type TshirtSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";
export type Language = "English" | "French" | "Ukrainian";

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone?: string;
  tshirtSize: TshirtSize;
  language: Language;
  country: string;
  tierId: TierId;
  gdprConsent: boolean;
  commsOptin?: boolean;
}

export interface RegisterResponse {
  participantId: string;
  fullName: string;
  tierId: TierId;
  tierName: string;
  amountEur: number;
  rewards: string[];
  monobankJarUrl: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] };
