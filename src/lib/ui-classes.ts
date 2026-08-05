/** Shared classes for selected / active UI states (lavender primary) */
export const ui = {
  activeNav:
    "bg-lavender-100 text-lavender-600 shadow-soft",
  navIdle:
    "text-gray-600 hover:bg-lavender-50 hover:text-lavender-500",
  activeMobileNav: "text-lavender-600",
  selectableActive:
    "border-lavender-400 bg-lavender-50 text-lavender-800 font-medium",
  selectableIdle:
    "border-gray-100 hover:border-lavender-200",
  activeCard:
    "bg-lavender-100 shadow-soft ring-1 ring-lavender-200",
  progressActive: "bg-lavender-400",
  linkAccent: "text-lavender-500 hover:text-lavender-600",
} as const;
