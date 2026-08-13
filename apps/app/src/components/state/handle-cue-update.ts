import type { Workspace } from "obsidian";
import type { MediaInfo } from "@/info/media-info";
import { onPlayerMounted, type MediaViewStoreApi } from "../context";

declare module "obsidian" {
  interface App {
    commands: {
      commands: Record<string, Command>;
    };
  }
  interface Workspace {
    on(
      name: "mx:cue-change",
      callback: (source: MediaInfo, trackId: string, cueIds: string[]) => any,
      ctx?: any,
    ): any;
    trigger(
      name: "mx:cue-change",
      source: MediaInfo,
      trackId: string,
      cueIds: string[],
    ): void;
  }
}

export function handleCueUpdate(
  store: MediaViewStoreApi,
  workspace: Workspace,
) {
  return onPlayerMounted(store, (player) =>
    player.subscribe(({ textTrack }) => {
      if (!textTrack) return;
      const onCueChange = () => {
        // Do not emit cue changes while the media is not ready. On mobile the
        // local file server may start late; during the failed/loading state
        // activeCues can incorrectly report every cue, which makes third-party
        // integrations (e.g. VoiceGenie) play all segments at once.
        if (!player.state.canPlay) return;
        const source = store.getState().source?.url;
        if (!source) return;
        workspace.trigger(
          "mx:cue-change",
          source,
          textTrack.id,
          textTrack.activeCues.map((c) => c.id),
        );
      };
      textTrack.addEventListener("cue-change", onCueChange);
      return () => {
        textTrack.removeEventListener("cue-change", onCueChange);
      };
    }),
  );
}
