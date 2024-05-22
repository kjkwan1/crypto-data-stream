import { WebsocketService, WebsocketServiceLive } from "../service/websocket.service";
import { Effect, Fiber, Layer, Queue } from "effect";
import { blockchainRef } from "../state/blockchain.ref";
import { QueueService, QueueServiceLive } from "../service/queue.service";
import { CoincapPrice } from "../interface/coincap.interface";

const coincapPrices = (): Effect.Effect<void, never, WebsocketService | QueueService> => 
    Effect.scoped(
        Effect.gen(function* () {
            const websocketService = yield* WebsocketService;
            const queueService = yield* QueueService;
            const queue = yield* Queue.bounded<string>(10);

            const url = 'wss://ws.blockchain.info/mercury-gateway/v1/ws';
            const websocketFiber: Fiber.RuntimeFiber<void, never> = yield* Effect.fork(
                websocketService.createStream<CoincapPrice>(url, queue),
            );
            const queueProcessingFiber: Fiber.RuntimeFiber<void, never> = yield* Effect.fork(
                queueService.processQueue(blockchainRef, queue, 'id'),
            );

            yield* Fiber.joinAll([websocketFiber, queueProcessingFiber]);
        })
    );

const BlockchainLive = Layer.merge(QueueServiceLive, WebsocketServiceLive);
export const blockchainRunnable = (channel: string) => Effect.provide(coincapPrices(), BlockchainLive);