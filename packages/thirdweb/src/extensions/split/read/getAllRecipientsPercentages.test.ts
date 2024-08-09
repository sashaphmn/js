import { describe, expect, it } from "vitest";
import { TEST_SPLIT_CONTRACT } from "~test/test-contracts.js";
import { getAllRecipientsPercentages } from "./getAllRecipientsPercentages.js";

const contract = TEST_SPLIT_CONTRACT;

describe("getAllRecipientsPercentages", () => {
  it("should work", async () => {
    const result = await getAllRecipientsPercentages({ contract });
    expect(result).toStrictEqual([
      {
        address: "0x12345674b599ce99958242b3D3741e7b01841DF3",
        splitPercentage: 50,
      },
      {
        address: "0x89f84D4e4ecaBa42233EEfc46eE49a03Db943bAD",
        splitPercentage: 21.97,
      },
      {
        address: "0xA6f11e47dE28B3dB934e945daeb6F538E9019694",
        splitPercentage: 28.03,
      },
    ]);
  });
});
