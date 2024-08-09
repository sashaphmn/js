import type { BaseTransactionOptions } from "../../../transaction/types.js";

/**
 * Get all the recipients of a Split contracts
 * @extension SPLIT
 * @returns an array of recipients' addresses and split percentage of each (totalling 100)
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
 *     splitPercentage: 25,
 *   },
 *   {
 *     address: "0x2...",
 *     splitPercentage: 75,
 *   },
 * ];
 * ```
 */
export async function getAllRecipients(options: BaseTransactionOptions) {
  
}
