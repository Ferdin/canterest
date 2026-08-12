import type { ActiveMenu } from "./uiSlice";

export const menuTitles: Record<Exclude<ActiveMenu, null>, string> = {
  createBoard: "Create a Board",
  notification: "Notifications",
  message: "Messages",
  settings: "Settings",
};
