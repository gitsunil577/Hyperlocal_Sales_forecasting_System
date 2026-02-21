export const PRODUCT_FAMILY_MAP: Record<string, { displayName: string; emoji: string }> = {
  'BREAD/BAKERY': { displayName: 'Bread & Bakery', emoji: '🍞' },
  'DAIRY':        { displayName: 'Dairy',           emoji: '🥛' },
  'DELI':         { displayName: 'Deli',            emoji: '🥩' },
  'EGGS':         { displayName: 'Eggs',            emoji: '🥚' },
  'MEATS':        { displayName: 'Meats',           emoji: '🍖' },
  'POULTRY':      { displayName: 'Poultry',         emoji: '🍗' },
  'SEAFOOD':      { displayName: 'Seafood',         emoji: '🐟' },
  'PRODUCE':      { displayName: 'Produce',         emoji: '🥬' },
  'PREPARED FOODS': { displayName: 'Prepared Foods', emoji: '🍱' },
};

export function getDisplayName(family: string): string {
  return PRODUCT_FAMILY_MAP[family]?.displayName || family;
}

export function getEmoji(family: string): string {
  return PRODUCT_FAMILY_MAP[family]?.emoji || '📦';
}
