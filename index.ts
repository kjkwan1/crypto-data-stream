import dotenv from "dotenv";
import { Effect } from "effect";
import { apiStreamRunnable } from "./src/program/api-stream";

dotenv.config();

const main = () => Effect.gen(function* () {
   const apiStream = yield* Effect.fork(apiStreamRunnable);
});

Effect.runPromise(main());