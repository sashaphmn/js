import type { BaseTransactionOptions } from "../../../transaction/types.js";
import { payee } from "../__generated__/Split/read/payee.js";
import { payeeCount } from "../__generated__/Split/read/payeeCount.js";
import {
  type SplitRecipient,
  getRecipientSplitPercentage,
} from "./getRecipientSplitPercentage.js";

/**
 * Get all the recipients of a Split contracts
 * @extension SPLIT
 * @returns an array of recipients' addresses and split percentage of each
 *
 * @example
 * ```ts
 * import { getAllRecipients } from "thirdweb/extensions/split";
 *
 * const allRecipients = await getAllRecipient({ contract });
 * // Example result:
 * [
 *   {
 *     address: "0x1...",
 *     splitPercentage: 0.25, // 25%
 *   },
 *   {
 *     address: "0x2...",
 *     splitPercentage: 0.75, // 75%
 *   },
 * ];
 * ```
 *
 * ### In case you don't need to fetch the split percentage
 * ```ts
 * const allRecipients = await getAllRecipient({
 *   contract,
 *   excludeSplitPercentage: true
 * });
 *
 * // Result
 * [
 *   {
 *     address: "0x1...",
 *     splitPercentage: null,
 *   },
 *   {
 *     address: "0x2...",
 *     splitPercentage: null,
 *   },
 * ];
 * ```
 */
export async function getAllRecipients(
  options: BaseTransactionOptions,
): Promise<SplitRecipient[]> {
  const { contract } = options;
  const _totalRecipients = await payeeCount(options);
  const indexes = Array.from({ length: Number(_totalRecipients) }, (_, i) => i);
  const recipientAddresses = await Promise.all(
    indexes.map((index) => payee({ contract, index: BigInt(index) })),
  );
  return await Promise.all(
    recipientAddresses.map((recipientAddress) =>
      getRecipientSplitPercentage({ contract, recipientAddress }),
    ),
  );
}
