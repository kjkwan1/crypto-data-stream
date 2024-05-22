import { Effect, Fiber, Layer, Queue } from "effect";
import { ApiService, ApiServiceLive } from "../service/api.service";
import { StreamService, StreamServiceLive } from "../service/stream.service";
import { BlockchainData, BlockchainResponse } from "../interface/blockchain.interface";
import { blockchainRef } from "../state/blockchain.ref";
import { blockchainUiFiber } from "./ui-fiber";

const apiStream = (): Effect.Effect<void, Error, StreamService | ApiService> => 
    Effect.scoped(
        Effect.gen(function* () {
            const apiService = yield* ApiService;
            const streamService = yield* StreamService;
        
            const url = 'https://api.blockchain.com/v3/exchange/symbols';
            const headers = {
                'Accept':'application/json',
                'X-API-Token': process.env.BLOCKCHAIN_SECRET,
            };
            const blockchainData = apiService.get<BlockchainResponse>(url, headers);
            const blockchainQueue = yield* Queue.bounded<BlockchainData>(200);

            const apiStreamFiber: Fiber.RuntimeFiber<void, Error> = yield* Effect.fork(
                streamService.generateApiStream<BlockchainResponse, BlockchainData>(
                    blockchainData,
                    blockchainRef,
                    blockchainQueue,
                    'base_currency',
                    'auction_price',
                    3000
                )
            );

            const uiFiber: Fiber.RuntimeFiber<void, Error> = yield* Effect.fork(blockchainUiFiber(blockchainRef));
            yield* Fiber.joinAll<void, Error>([apiStreamFiber, uiFiber]);

        })
    )

const MainLayerLive = Layer.merge(ApiServiceLive, StreamServiceLive);

export const apiStreamRunnable = Effect.provide(apiStream(), MainLayerLive);