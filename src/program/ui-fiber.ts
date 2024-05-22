import { Console, Effect, Stream, SubscriptionRef, pipe } from "effect";
import { BlockchainData } from "../interface/blockchain.interface";

export const blockchainUiFiber = (ref: SubscriptionRef.SubscriptionRef<Record<string, BlockchainData>>) => pipe(
    ref.changes,
    Stream.tap((chunk) => {
        return Console.log('In UI Fiber: ', chunk);
    }),
    Stream.runDrain,
)

// const createOrUpdate: Effect.Effect<void, Error> = (chunk: Record<string, BlockchainData>) => pipe(
//     Stream.filter()
// )