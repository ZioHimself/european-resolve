import type { TierId } from "@/data/event";

export type ParticipationType = "runner" | "supporter";

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

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}
