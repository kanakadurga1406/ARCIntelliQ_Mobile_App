export const motion = {
  fast: 160,
  base: 220,
  slow: 280,
} as const;

export const radii = {
  card: 20,
  sheet: 24,
  button: 14,
  input: 14,
  chip: 999,
  icon: 12,
} as const;

export const shadows = {
  card: {
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  header: {
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  raised: {
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;
