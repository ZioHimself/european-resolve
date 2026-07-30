export type ParticipationType = "runner" | "supporter";

export interface RegisterResponse {
  participantId: string;
  fullName: string;
  tierId: "supporter" | "champion" | "patron";
  tierName: string;
  participationType: ParticipationType;
  amountEur: number;
  rewards: string[];
  paymentToken: string;
  whydonateWidgetUrl: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
