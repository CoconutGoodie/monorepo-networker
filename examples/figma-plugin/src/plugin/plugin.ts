import { PLUGIN, UI } from "@common/networkSides";
import { PLUGIN_CHANNEL } from "@plugin/plugin.network";
import { MonorepoNetworker } from "../../../../src";

async function bootstrap() {
  MonorepoNetworker.initialize(PLUGIN, PLUGIN_CHANNEL);

  if (figma.editorType === "figma") {
    figma.showUI(__html__, {
      width: 800,
      height: 650,
      title: "My Figma Plugin!",
    });
  }

  console.log("Bootstrapped @", MonorepoNetworker.getCurrentSide().name);

  PLUGIN_CHANNEL.emit(UI, "hello", "Hey there, UI!");
}

bootstrap();
