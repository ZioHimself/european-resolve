import { describe, it, expect, beforeEach } from "vitest";
import {
  mergePendingDonation,
  readWhyDonateLocalDonation,
  whyDonateDonationInfoKey,
} from "@/lib/whydonateDonationStorage";

const SHORTCODE = "KvhGb";
const WIDGET_ID = `${SHORTCODE}-1`;

describe("whydonateDonationStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reads donor name and message from WhyDonate localStorage", () => {
    localStorage.setItem(
      whyDonateDonationInfoKey(SHORTCODE),
      JSON.stringify({
        [WIDGET_ID]: {
          firstname: "Mariia",
          lastname: "Onyshchenko",
          message_donor: "Wish you a good run!",
          is_anonymous: false,
        },
      }),
    );

    expect(readWhyDonateLocalDonation(SHORTCODE)).toEqual({
      donorName: "Mariia Onyshchenko",
      message: "Wish you a good run!",
    });
  });

  it("returns undefined donor name when anonymous", () => {
    localStorage.setItem(
      whyDonateDonationInfoKey(SHORTCODE),
      JSON.stringify({
        [WIDGET_ID]: {
          firstname: "Mariia",
          lastname: "Onyshchenko",
          message_donor: "Hidden supporter",
          is_anonymous: true,
        },
      }),
    );

    expect(readWhyDonateLocalDonation(SHORTCODE)).toEqual({
      donorName: undefined,
      message: "Hidden supporter",
    });
  });

  it("prefers WhyDonate localStorage over empty session values", () => {
    localStorage.setItem(
      whyDonateDonationInfoKey(SHORTCODE),
      JSON.stringify({
        [WIDGET_ID]: {
          firstname: "Mariia",
          lastname: "Onyshchenko",
          message_donor: "Wish you a good run!",
          is_anonymous: false,
        },
      }),
    );

    expect(
      mergePendingDonation(SHORTCODE, { amount: 100, donor: "", message: "" }),
    ).toEqual({
      amount: 100,
      donorName: "Mariia Onyshchenko",
      message: "Wish you a good run!",
    });
  });
});
