/** Shared classes — lavender & turquoise primary, rose as warm accent detail */
export const ui = {
  activeNav:
    "bg-rose-100 text-rose-500 ring-1 ring-rose-200/60 border-l-[3px] border-rose-400",
  navIdle:
    "text-gray-600 border-l-[3px] border-transparent hover:bg-rose-50/70 hover:text-rose-500 hover:border-rose-200",
  activeMobileNav: "text-rose-500",
  selectableActive:
    "border-rose-300 bg-lavender-50 text-lavender-800 font-medium ring-1 ring-rose-100",
  selectableIdle:
    "border-gray-100 hover:border-rose-200 hover:bg-rose-50/50",
  activeCard:
    "bg-rose-100 shadow-soft ring-1 ring-rose-200/60",
  progressActive: "bg-lavender-400",
  progressTrack: "bg-rose-50/80",
  linkAccent: "text-rose-400 hover:text-lavender-600",
  iconAccent: "text-rose-500",
  titleUnderline:
    "h-0.5 w-10 bg-gradient-to-r from-rose-300 via-rose-200 to-lavender-300 rounded-full",
} as const;
