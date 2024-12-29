import { IncomingMessage } from "node:http";

export function getHttpBody(request: IncomingMessage) {
  return new Promise<any>((resolve) => {
    const chunks: Array<Uint8Array> = [];
    let body: string;
    request
      .on("data", (chunk) => {
        chunks.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(chunks).toString();
        resolve(JSON.parse(body));
      });
  });
}
