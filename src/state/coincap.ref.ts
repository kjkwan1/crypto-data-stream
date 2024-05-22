import { Effect, SynchronizedRef } from "effect";
import { CoincapData } from "../interface/coincap.interface";

export const coincapRef = Effect.runSync(SynchronizedRef.make<Record<string, CoincapData>>({}));
