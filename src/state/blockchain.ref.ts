import { Effect, SynchronizedRef } from "effect";
import { BlockchainData } from "../interface/blockchain.interface";

export const blockchainRef = Effect.runSync(SynchronizedRef.make<Record<string, BlockchainData>>({}));
