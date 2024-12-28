<!-- Logo -->
<p align="center">
  <picture>
    <source 
      media="(prefers-color-scheme: dark)" 
      height="150px"
      srcset="https://raw.githubusercontent.com/CoconutGoodie/monorepo-networker/master/.github/assets/light-logo.svg" />
    <img 
      src   ="https://raw.githubusercontent.com/CoconutGoodie/monorepo-networker/master/.github/assets/dark-logo.svg" 
      height="150px"
      alt   =""/>
  </picture>
</p>

<!-- Slogan -->
<p align="center">
  A library designed to facilitate the maintenance of networking code in monorepos
</p>

<!-- Badges -->
<p align="center">

  <!-- Github Badges -->
  <img src="https://raw.githubusercontent.com/TheSpawnProject/TheSpawnLanguage/master/.github/assets/github-badge.png" height="20px"/>
  <a href="https://github.com/CoconutGoodie/monorepo-networker/commits/master">
    <img src="https://img.shields.io/github/last-commit/CoconutGoodie/monorepo-networker"/>
  </a>
  <a href="https://github.com/CoconutGoodie/monorepo-networker/issues">
    <img src="https://img.shields.io/github/issues/CoconutGoodie/monorepo-networker"/>
  </a>

  <br/>

  <!-- Support Badges -->
  <img src="https://raw.githubusercontent.com/TheSpawnProject/TheSpawnLanguage/master/.github/assets/support-badge.png" height="20px"/>
  <a href="https://www.patreon.com/iGoodie">
    <img src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.vercel.app%2Fapi%3Fusername%3DiGoodie%26type%3Dpatrons"/>
  </a>
</p>

# 🧶 What is monorepo-networker?

Consider a scenario where you are maintaining a codebase that follows a monorepo pattern and houses an IPC-like communication mechanism between ends/sides, much like [FiveM's scripting SDK](https://docs.fivem.net/docs/scripting-reference/) and [Figma's plugin API](https://www.figma.com/plugin-docs/). In such a situation, you may find yourself dealing with numerous boilerplate code just to ensure that you are sending the right data under the correct title. The primary aim of this library is to streamline this process by abstracting away the transport strategies between sides, thereby standardizing the process.

# 💻 How to use it?

<!--

Before using it, keep in mind instances you create are supposed to be used commonly accross the sides. So we recommend storing those calls in a `/common/network` folder for convenience. -->

This library assumes your codebase is a monorepo that has distinct sides sharing some code. For simplicity, tutorial ahead will use a folder structure like so:

```
|- common
|- packages
|  |- ui
|  |- client
|  |- server
```

1. Start by creating sides and defining the events they can receive.

```ts
// ./common/networkSides.ts

import { MonorepoNetworker } from "monorepo-networker";

export const UI = MonorepoNetworker.createSide<{
  focusOnSelected(): void;
  focusOnElement(elementId: string): void;
}>("UI-side");

export const CLIENT = MonorepoNetworker.createSide<{
  hello(text: string): void;
  getClientTime(): number;
  createRectangle(width: number, height: number): void;
  execute(script: string): void;
}>("Client-side");

export const SERVER = MonorepoNetworker.createSide<{
  hello(text: string): void;
  getServerTime(): number;
  fetchUser(userId: string): { id: string; name: string };
  markPresence(online: boolean): void;
}>("Server-side");
```

> [!CAUTION]
> Side objects created here are supposed to be used across different side runtimes.
> Make sure **NOT** to use anything side-dependent in here.

2. Create the channels for each side. Channels are responsible of communicating with other sides and listening to incoming messages using the registered strategies. (Only the code for CLIENT side is shown, for simplicity.)

```ts
// ./packages/client/networkChannel.ts

import { CLIENT, SERVER, UI } from "@common/networkSides";

export const CLIENT_CHANNEL = CLIENT.createChannel({
  attachListener(next) {
    const listener = (event: MessageEvent) => {
      if (event.data?.pluginId == null) return;
      next(event.data.pluginMessage);
    };

    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
  },
});

// ----------- Declare how messages are emitted to other sides

CLIENT_CHANNEL.registerEmitStrategy(UI, (message) => {
  parent.postMessage({ pluginMessage: message }, "*");
});
CLIENT_CHANNEL.registerEmitStrategy(SERVER, (message) => {
  fetch("server://", { method: "POST", body: JSON.stringify(message) });
});

// ----------- Declare how an incoming message is handled

CLIENT_CHANNEL.registerMessageHandler("hello", (text, from) => {
  console.log(from.name, "said:", text);
});
CLIENT_CHANNEL.registerMessageHandler("getClientTime", () => {
  return Date.now();
});
```

3. Initialize each side in their entry point. And enjoy the standardized messaging api!

```ts
// ./packages/server/main.ts

import { SERVER, CLIENT } from "@common/networkSides";
import { SERVER_CHANNEL } from "@server/networkChannel";

async function bootstrap() {
  MonorepoNetworker.initialize(SERVER, SERVER_CHANNEL);

  // ... Omitted code that bootstraps the server

  SERVER_CHANNEL.emit(CLIENT, "hello", "Hi there, client!");
}

bootstrap();
```

```ts
// ./packages/client/main.ts

import { CLIENT, SERVER } from "@common/networkSides";
import { CLIENT_CHANNEL } from "@client/networkChannel";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";

MonorepoNetworker.initialize(CLIENT, CLIENT_CHANNEL);

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

CLIENT_CHANNEL.emit(SERVER, "hello", "Hi there, server!");

// Notice this one returns a Promise<T>
CLIENT_CHANNEL.request(SERVER, "getServerTime").then((response) => {
  console.log('Server responded with "' + response + '" !');
});
```

# 📜 License

&copy; 2024 Taha Anılcan Metinyurt (iGoodie)

For any part of this work for which the license is applicable, this work is licensed under the [Attribution-ShareAlike 4.0 International](http://creativecommons.org/licenses/by-sa/4.0/) license. (See LICENSE).

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a>
