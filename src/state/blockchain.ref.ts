import { Effect, Ref, SubscriptionRef } from "effect";
import { BlockchainData } from "../interface/blockchain.interface";

export const blockchainRef = Effect.runSync(SubscriptionRef.make<Record<string, BlockchainData>>({}));
export const hasChanges = Effect.runSync(Ref.make<boolean>(false));
