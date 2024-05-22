import { Effect, Fiber, Layer, Queue } from "effect";
import { ApiService, ApiServiceLive } from "../service/api.service";
import { StreamService, StreamServiceLive } from "../service/stream.service";
import { CoincapData, CoincapResponse } from "../interface/coincap.interface";
import { coincapRef } from "../state/coincap.ref";

const coincapStream = (): Effect.Effect<void, Error, StreamService | ApiService> => 
    Effect.scoped(
        Effect.gen(function* () {
            const apiService = yield* ApiService;
            const streamService = yield* StreamService;
        
            const url = 'api.coincap.io/v2/assets';
            const coincapData = apiService.get<CoincapResponse>(url);
            const coincapQueue = yield* Queue.bounded<CoincapData>(100);

            const apiStreamFiber: Fiber.RuntimeFiber<void, Error> = yield* Effect.fork(
                streamService.generateApiStream<CoincapResponse, CoincapData>(
                    coincapData,
                    coincapQueue,
                    5000
                )
            );
            const streamQueueToRefFiber: Fiber.RuntimeFiber<void, Error> = yield* Effect.fork(
                streamService.streamQueueToRef(
                    coincapQueue,
                    coincapRef,
                    'id',
                )
            );
        
            yield* Fiber.joinAll([apiStreamFiber, streamQueueToRefFiber]);
        })
    )

const MainLayerLive = Layer.merge(ApiServiceLive, StreamServiceLive);

export const coincapStreamRunnable = Effect.provide(coincapStream(), MainLayerLive);