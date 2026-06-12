export const CLIENT_COLORS = ['#635BFF', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export const clientColor = (index: number) => CLIENT_COLORS[((index % CLIENT_COLORS.length) + CLIENT_COLORS.length) % CLIENT_COLORS.length]
