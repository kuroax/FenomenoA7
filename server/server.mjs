import { createServer } from "node:http";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createApp } from "./app.mjs";

function start() {
  const host = process.env.API_HOST ?? "127.0.0.1";
  const port = Number(process.env.API_PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("API_PORT must be an integer from 1 to 65535.");
    process.exitCode = 1;
    return;
  }

  const server = createServer(createApp());
  server.once("error", (error) => {
    console.error(`API failed to listen on ${host}:${port}: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, host, () => {
    console.log(`API listening at http://${host}:${port}`);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  start();
}
