import { WebsocketService, WebsocketServiceLive } from "../service/websocket.service";
import { Effect, Fiber, Layer, Queue } from "effect";
import { blockchainRef } from "../state/blockchain.ref";
import { QueueService, QueueServiceLive } from "../service/queue.service";

const blockchain = (channel: string): Effect.Effect<void, never, WebsocketService | QueueService> => 
    Effect.scoped(
        Effect.gen(function* () {
            const websocketService = yield* WebsocketService;
            const queueService = yield* QueueService;
            const queue = yield* Queue.bounded<string>(10);

            const url = 'wss://ws.blockchain.info/mercury-gateway/v1/ws';
            const payload = JSON.stringify({
                token: process.env.BLOCKCHAIN_SECRET,
                action: 'subscribe',
                channel,
            });

            const websocketFiber: Fiber.RuntimeFiber<void, never> = yield* Effect.fork(
                websocketService.createStream(url, payload, queue),
            );
            const queueProcessingFiber: Fiber.RuntimeFiber<void, never> = yield* Effect.fork(
                queueService.processQueue(blockchainRef, queue, 'id'),
            );

            yield* Fiber.joinAll([websocketFiber, queueProcessingFiber]);
        })
    );

const BlockchainLive = Layer.merge(QueueServiceLive, WebsocketServiceLive);
export const blockchainProgram = (channel: string) => Effect.provide(blockchain(channel), BlockchainLive);