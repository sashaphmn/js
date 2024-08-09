import { describe, expect, it } from "vitest";
import { TEST_SPLIT_CONTRACT } from "~test/test-contracts.js";
import { getRecipientSplitPercentage } from "./getRecipientSplitPercentage.js";

const contract = TEST_SPLIT_CONTRACT;

describe("getRecipientSplitPercentage", () => {
  it("should return something", async () => {
    const result = await getRecipientSplitPercentage({
      contract,
      recipientAddress: "0x12345674b599ce99958242b3D3741e7b01841DF3",
    });

    expect(result).toStrictEqual({
      address: "0x12345674b599ce99958242b3D3741e7b01841DF3",
      splitPercentage: 50,
    });
  });
});
