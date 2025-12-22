import type { Consumable, MagicItem } from "@/types/items";
import type { Rarity } from "@/types/items";

export const COLOUR_C = "#696969";
export const COLOUR_UC = "#006400";
export const COLOUR_R = "#0000FF";
export const COLOUR_VR = "#4B0082";
export const COLOUR_L = "#FF8C00";

export function getRarityText(rarity: Rarity) {
  if (rarity === "legendary") return "Legendary";
  if (rarity === "veryrare") return "Very rare";
  if (rarity === "rare") return "Rare";
  if (rarity === "uncommon") return "Uncommon";
  if (rarity === "common") return "Common";
  return "Unknown";
}

export function getRarityColour(rarity: Rarity) {
  if (rarity === "legendary") return COLOUR_L;
  if (rarity === "veryrare") return COLOUR_VR;
  if (rarity === "rare") return COLOUR_R;
  if (rarity === "uncommon") return COLOUR_UC;
  if (rarity === "common") return COLOUR_C;
  return "#A9A9A9";
}

export function getNumberEquipped(data?: (Consumable | MagicItem)[]) {
  if (!data) return 0;

  const equipped = data.filter((c) => c.equipped);
  return equipped.length;
}
