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

## What is monorepo-networker?

Consider a scenario where you are maintaining a codebase that follows a monorepo pattern and houses an IPC-like communication mechanism between ends/sides, much like [FiveM's scripting SDK](https://docs.fivem.net/docs/scripting-reference/) and [Figma's plugin API](https://www.figma.com/plugin-docs/). In such a situation, you may find yourself dealing with numerous boilerplate code just to ensure that you are sending the right data under the correct title. The primary aim of this library is to streamline this process by transforming every message type into an isolated artifact, thereby standardizing the process.

## How to use it?

Before using it, keep in mind instances you create are supposed to be used commonly accross the sides. So we recommend storing those calls in a `/common/network` folder for convenience.

1. Declare and register sides and their handling mechanism under `/common/network/sides.ts`

```ts
import * as Networker from "monorepo-networker";

export namespace NetworkSide {
  export const SERVER = Networker.Side.register(
    new Networker.Side("Server", {
      attachListener: (callback) => server.on("message", callback),
      detachListener: (callback) => server.off("message", callback),
    })
  );

  export const CLIENT = Networker.Side.register(
    new Networker.Side<MessageEvent<any>>("Client", {
      shouldHandle: (event) => event.data?.pluginId != null,
      messageGetter: (event) => event.data.pluginMessage,
      attachListener: (callback) =>
        window.addEventListener("message", callback),
      detachListener: (callback) =>
        window.removeEventListener("message", callback),
    })
  );
}
```

- `attachListener:` declares how given callback is attached to that side's event listening mechanism
- `detachListener:` declares how given callback is detached from that side's event listening mechanism
- `shouldHandle?:` declares a predicate function, that determines whether incoming event is a network message we are interested in or not
- `messageGetter?:` there may be cases where the incoming event is not the actual message, but rather a wrapper around it. To handle such cases, this function specifies how to extract the message from the wrapper.

2. Create 2 test messages. We'll create a `HelloMessage` that emits a message to the other side, and other side prints out incoming data. And we'll create a `PingServerMessae` that will respond with "Pong!" to the requesting side. Create your messages under `/common/messages/HelloMessage.ts`:

```ts
import * as Networker from "monorepo-networker";

interface Payload {
  text: string;
}

export class HelloMessage extends Networker.MessageType<Payload> {
  constructor(private side: Networker.Side) {
    super("hello-" + side.getName());
  }

  receivingSide(): Networker.Side {
    return this.side;
  }

  handle(payload: Payload, from: Networker.Side) {
    console.log(`${from.getName()} said "${payload.text}"`);
  }
}
```

and `/common/messages/PingServerMessage.ts`:

```ts
import * as Networker from "monorepo-networker";
import { NetworkSide } from "@common/network/sides";

interface Payload {}

type Response = string;

export class PingMessage extends Networker.MessageType<Payload, Response> {
  receivingSide(): Networker.Side {
    return NetworkSide.SERVER;
  }

  handle(payload: Payload, from: Networker.Side): string {
    console.log(from.getName(), "has pinged us!");
    return `Pong, ${from.getName()}!`;
  }
}
```

> <picture>
>   <source media="(prefers-color-scheme: light)" srcset="https://github.com/Mqxx/GitHub-Markdown/blob/main/blockquotes/badge/light-theme/tip.svg">
>   <img alt="Tip" src="https://github.com/Mqxx/GitHub-Markdown/blob/main/blockquotes/badge/dark-theme/tip.svg">
> </picture><br>
>
> Some messages can present a response, where some do not. In that case, you should declare a `Response` type representing what does the handler respond with. This then later be used with `Network.MessageType::request`, we'll cover in next steps.

<!-- 2. Declare how sides can communicate with each other by creating an initializer with transport declarations under `/common/init.ts`:

```ts
import * as Networker from "monorepo-networker";
import { NetworkMessages } from "@common/network/messages";
import { NetworkSide } from "@common/network/sides";

export const initializeNetwork = Networker.createInitializer({
  messagesRegistry: NetworkMessages.registry,

  initTransports: function (register) {
    register(NetworkSide.PLUGIN, NetworkSide.UI, (message) => {
      figma.ui.postMessage(message);
    });

    register(NetworkSide.UI, NetworkSide.PLUGIN, (message) => {
      parent.postMessage({ pluginMessage: message }, "*");
    });
  },
});
``` -->
