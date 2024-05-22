import dotenv from "dotenv";
import { Effect } from "effect";
import { apiStreamRunnable } from "./src/program/api-stream";

dotenv.config();

Effect.runPromise(apiStreamRunnable).then(console.log);