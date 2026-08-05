export type ParticipationType = "runner" | "supporter";

export interface RegisterResponse {
  participantId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  tierId: "supporter" | "sprinter" | "relay-runner" | "marathoner" | "ultramarathoner";
  tierName: string;
  participationType: ParticipationType;
  amountEur: number;
  rewards: string[];
  paymentToken: string;
  status?: "pending" | "paid";
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}
