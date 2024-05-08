import * as Q from "effect/Queue";
import * as E from "effect/Effect";
import * as L from "effect/Layer";
import { Context } from "effect";

export class WebsocketService extends Context.Tag('WebsocketService')<
    WebsocketService,
    {
        readonly createStream: (
            url: string,
            payload: string,
            queue: Q.Queue<string>,
        ) => E.Effect<void, never, never>;
    }
>() {}

export const WebsocketServiceLive = L.succeed(
    WebsocketService,
    WebsocketService.of({
        createStream: (
            url: string,
            payload: string,
            queue: Q.Queue<string>,
        ) => E.scoped(
            E.gen(function* () {
                const ws = new WebSocket(url);

                ws.onopen = () => {
                    ws.send(payload);
                }

                ws.onmessage = (event) => {
                    E.runPromise(Q.offer(queue, event.data.toString()));
                }

                ws.onerror = (event) => {
                    console.log('errored on websocket', event);
                };
                
                yield* E.never;
            })
        )
    })
)