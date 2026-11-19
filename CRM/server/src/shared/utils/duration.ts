const UNIT_TO_MS: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
};

export const parseDurationToMs = (value: string): number => {
  const match = /^(\d+)\s*(s|m|h|d|w)$/i.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid duration: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2]?.toLowerCase() ?? '';
  const multiplier = UNIT_TO_MS[unit];

  if (!multiplier) {
    throw new Error(`Invalid duration unit: ${value}`);
  }

  return amount * multiplier;
};
