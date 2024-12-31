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

Consider a scenario where you maintain a codebase following the monorepo pattern, with an IPC-esque communication mechanism between sides—similar to [FiveM's Scripting SDK](https://www.figma.com/plugin-docs/) or [Figma's Plugin API](https://docs.fivem.net/docs/scripting-reference/). In such cases, you may encounter excessive boilerplate code just to ensure that the correct data is sent under the appropriate title. This library aims to simplify that process by abstracting transport strategies between sides, thereby standardizing communication.

# 🎁 Examples

- [Simple Example](https://github.com/CoconutGoodie/monorepo-networker/tree/master/examples/simple): with 3 mockup sides: midware "Client", HTTP "Server" and React "UI"
- [Figma Plugin Example](https://github.com/CoconutGoodie/monorepo-networker/tree/master/examples/figma-plugin): with 2 sides: figma "Plugin", and the renderer "UI"
- [FiveM Server Example](https://github.com/CoconutGoodie/monorepo-networker/tree/master/examples/fivem-script): with 3 sides: resource "Server", resource "Client", and the "NUI"

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

## 1. Define the Sides

Start by creating sides and defining the events they can receive.

```ts
// ./common/networkSides.ts

import { Networker } from "monorepo-networker";

export const UI = Networker.createSide("UI-side").listens<{
  focusOnSelected(): void;
  focusOnElement(elementId: string): void;
}>();

export const CLIENT = Networker.createSide("Client-side").listens<{
  hello(text: string): void;
  getClientTime(): number;
  createRectangle(width: number, height: number): void;
  execute(script: string): void;
}>();

export const SERVER = Networker.createSide("Server-side").listens<{
  hello(text: string): void;
  getServerTime(): number;
  fetchUser(userId: string): { id: string; name: string };
  markPresence(online: boolean): void;
}>();
```

> [!CAUTION]
> Side objects created here are supposed to be used across different side runtimes.
> Make sure **NOT** to use anything side-dependent in here.

## 2. Create the Channels

Create the channels for each side. Channels are responsible of communicating with other sides and listening to incoming messages using the registered strategies.

(Only the code for CLIENT side is shown, for simplicity.)

```ts
// ./packages/client/networkChannel.ts

import { CLIENT, SERVER, UI } from "@common/networkSides";

export const CLIENT_CHANNEL = CLIENT.channelBuilder()
  .emitsTo(UI, (message) => {
    // We're declaring how CLIENT sends a message to UI
    parent.postMessage({ pluginMessage: message }, "*");
  })
  .emitsTo(SERVER, (message) => {
    // We're declaring how CLIENT sends a message to SERVER
    fetch("server://", { method: "POST", body: JSON.stringify(message) });
  })
  .receivesFrom(UI, (next) => {
    // We're declaring how CLIENT receives a message from SERVER
    const listener = (event: MessageEvent) => {
      if (event.data?.pluginId == null) return;
      next(event.data.pluginMessage);
    };

    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
  })
  .startListening();

// ----------- Declare how an incoming message is handled

CLIENT_CHANNEL.registerMessageHandler("hello", (text, from) => {
  console.log(from.name, "said:", text);
});
CLIENT_CHANNEL.registerMessageHandler("getClientTime", () => {
  // Returning a value will make this event "request-able"
  return Date.now();
});
```

## 3. Initialize & Invoke

Initialize each side in their entry point. And enjoy the standardized messaging api!

- `Channel::emit` will emit given event to the given side
- `Channel::request` will emit given event to the given side, and wait for a response from the target side.
- `Channel::subscribe` will subscribe a listener for incoming messages on this side. (Note: subscribed listener cannot "respond" to them. Use `Channel::registerMessageHandler` to create a proper responder.)

```ts
// ./packages/server/main.ts

import { Networker } from "monorepo-networker";
import { SERVER, CLIENT } from "@common/networkSides";
import { SERVER_CHANNEL } from "@server/networkChannel";

async function bootstrap() {
  Networker.initialize(SERVER, SERVER_CHANNEL);

  console.log("We are at", Networker.getCurrentSide().name);

  // ... Omitted code that bootstraps the server

  SERVER_CHANNEL.emit(CLIENT, "hello", ["Hi there, client!"]);

  // Event though CLIENT's `createRectangle` returns void, we can still await on its acknowledgement.
  await SERVER_CHANNEL.request(CLIENT, "createRectangle", [100, 200]);
}

bootstrap();
```

```tsx
// ./packages/client/main.ts

import { Networker } from "monorepo-networker";
import { CLIENT, SERVER } from "@common/networkSides";
import { CLIENT_CHANNEL } from "@client/networkChannel";
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";

Networker.initialize(CLIENT, CLIENT_CHANNEL);

console.log("We are @", Networker.getCurrentSide().name);

CLIENT_CHANNEL.emit(SERVER, "hello", ["Hi there, server!"]);

// This one corresponds to SERVER's `getServerTime(): number;` event
CLIENT_CHANNEL.request(SERVER, "getServerTime", []).then((serverTime) => {
  console.log('Server responded with "' + serverTime + '" !');
});

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

function App() {
  const rectangles = useRef<{ w: number; h: number }[]>([]);

  useEffect(() => {
    const unsubscribe = CLIENT_CHANNEL.subscribe(
      "createRectangle",
      (width, height, from) => {
        console.log(from.name, "asked for a rectangle!");
        rectangles.current.push({ w: width, h: height });
      }
    );

    return () => unsubscribe();
  }, []);

  return <main>{/* ... Omitted for simplicity */}</main>;
}
```

# ⭐ Special Thanks to

- [@thediaval](https://github.com/thediaval): For his endless support and awesome memes.

# 📜 License

&copy; 2024 Taha Anılcan Metinyurt (iGoodie)

For any part of this work for which the license is applicable, this work is licensed under the [Attribution-ShareAlike 4.0 International](http://creativecommons.org/licenses/by-sa/4.0/) license. (See LICENSE).

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a>
