import * as L from "effect/Layer";
import { Context, Effect, Queue } from "effect";
import { UnifiedData } from "../interface/unified-data.interface";

export class WebsocketService extends Context.Tag('WebsocketService')<
    WebsocketService,
    {
        readonly createAuthenticatedStream: (
            url: string,
            payload: string,
            queue: Queue.Queue<string>,
        ) => Effect.Effect<void>;
        readonly createStream: <T>(
            url: string,
            toUnifiedData: (data: T) => UnifiedData,
            queue: Queue.Queue<UnifiedData>,
        ) => Effect.Effect<void>;
    }
>() {}

export const WebsocketServiceLive = L.succeed(
    WebsocketService,
    WebsocketService.of({
        createAuthenticatedStream: (
            url: string,
            payload: string,
            queue: Queue.Queue<string>,
        ) => Effect.scoped(
            Effect.gen(function* () {
                const ws = new WebSocket(url);

                ws.onopen = () => {
                    ws.send(payload);
                }

                ws.onmessage = (event) => {
                    Effect.runPromise(Queue.offer(queue, event.data.toString()));
                }

                ws.onerror = (event) => {
                    console.log('errored on websocket', event);
                };
                
                yield* Effect.never;
            })
        ),
        createStream: <T>(url: string, toUnifiedData: (data: T) => UnifiedData, queue: Queue.Queue<UnifiedData>) => Effect.scoped(
            Effect.gen(function* () {
                const ws = new WebSocket(url);
                ws.onmessage = (event) => {
                    Effect.runPromise(Queue.offer(queue, toUnifiedData(event.data)));
                }

                ws.onerror = (event) => {
                    console.log('errored on websocket', event);
                };

                yield* Effect.never;
            })
        )
    })
)