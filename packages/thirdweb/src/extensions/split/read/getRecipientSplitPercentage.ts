import type { BaseTransactionOptions } from "../../../transaction/types.js";
import { totalShares } from "../__generated__/Split/read/totalShares.js";
import { shares } from "../__generated__/Split/read/shares.js";

export interface SplitRecipient {
  /**
   * The address of the recipient
   */
  address: string;

  /**
   * The split of the recipient as a percentage of the total amount
   *
   * I.e. If a recipient has a split of 50%, and the asset sells for 100 ETH,
   * the recipient will receive 50 ETH.
   */
  splitPercentage: number;
}

export async function getRecipientSplitPercentage(
  options: BaseTransactionOptions<{ recipientAddress: string }>,
): Promise<SplitRecipient> {
  const { contract, recipientAddress } = options;
  const [_totalShares, walletsShares] = await Promise.all([
    totalShares({ contract }),
    shares({ contract, account: recipientAddress }),
  ]);
  return {
    address: recipientAddress,
    // We convert to basis points to avoid floating point loss of precision
    // 7544n -> 0.7544 (75.44 %)
    splitPercentage:
      (Number(walletsShares) * 100_000) / Number(totalShares) / 100_000,
  };
}
