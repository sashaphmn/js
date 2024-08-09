import { describe, expect, it } from "vitest";
import { TEST_CLIENT } from "~test/test-clients.js";
import { avalancheFuji } from "../../../chains/chain-definitions/avalanche-fuji.js";
import { getContract } from "../../../contract/contract.js";
import { getRecipientSplitPercentage } from "./getRecipientSplitPercentage.js";

/**
 * All access to this contract (admin roles) have been removed
 * so this contract is effectively read-only
 *
 * cons: We might have to update the test if avalancheFuji is deprecated
 */
const contract = getContract({
  address: "0x87077BDEEC6Bc1Bc0D399c76742b49A5844F66F8",
  chain: avalancheFuji,
  client: TEST_CLIENT,
});

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
