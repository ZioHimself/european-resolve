/** Keys used by WhyDonate before Stripe redirect (see wp_styling.js). */
export interface WhyDonateStoredDonor {
  firstname?: string;
  lastname?: string;
  message_donor?: string;
  is_anonymous?: boolean;
}

export interface PendingDonationDetails {
  amount: number;
  donorName?: string;
  message?: string;
}

export function whyDonateWidgetId(shortcode: string): string {
  return `${shortcode}-1`;
}

export function whyDonateDonationInfoKey(shortcode: string): string {
  const id = whyDonateWidgetId(shortcode);
  return `donation_info_${id}_${shortcode}`;
}

/** Read name + message WhyDonate saved to localStorage before payment redirect. */
export function readWhyDonateLocalDonation(
  shortcode: string,
): Pick<PendingDonationDetails, "donorName" | "message"> | null {
  if (typeof window === "undefined") return null;

  try {
    const id = whyDonateWidgetId(shortcode);
    const raw = localStorage.getItem(whyDonateDonationInfoKey(shortcode));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Record<string, WhyDonateStoredDonor>;
    const donor = parsed[id];
    if (!donor) return null;

    const donorName = donor.is_anonymous
      ? undefined
      : [donor.firstname, donor.lastname].filter(Boolean).join(" ").trim() || undefined;

    const message = donor.message_donor?.trim() || undefined;

    return { donorName, message };
  } catch {
    return null;
  }
}

export function mergePendingDonation(
  shortcode: string,
  session: { amount: number; donor: string; message: string },
): PendingDonationDetails {
  const fromWhyDonate = readWhyDonateLocalDonation(shortcode);

  return {
    amount: session.amount,
    donorName: fromWhyDonate?.donorName || session.donor.trim() || undefined,
    message: fromWhyDonate?.message || session.message.trim() || undefined,
  };
}
