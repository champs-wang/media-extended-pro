import { Platform } from "obsidian";
import type MxPlugin from "@/mx-main";
import { LoginModal } from "./modal";

export function initLogin(this: MxPlugin) {
  if (!Platform.isDesktopApp) return;
  this.addCommand({
    id: "login",
    name: "Login website",
    callback: () => {
      new LoginModal(this.app).open();
    },
  });
}
