import { Context, Effect, Layer, Queue, Stream, SynchronizedRef, pipe } from "effect";

export class QueueService extends Context.Tag('QueueService')<
    QueueService,
    {
        readonly processQueue: <T>(
            ref: SynchronizedRef.SynchronizedRef<Record<string, T>>,
            queue: Queue.Queue<string>,
            keyby: string
        ) => Effect.Effect<void, never, never>
    }
>() {}

export const QueueServiceLive = Layer.succeed(
    QueueService,
    QueueService.of({
        processQueue: <T>(
            ref: SynchronizedRef.SynchronizedRef<Record<string, T>>,
            queue: Queue.Queue<string>,
            keyby: string
        ) => pipe(
            Stream.fromQueue(queue),
            Stream.map(JSON.parse),
            Stream.mapEffect((data: any) => SynchronizedRef.update(ref, prev => {
                const newState = {...prev};
                if (data[keyby]) {
                    newState[keyby] = data;
                }
                return newState;
            })),
            Stream.runDrain,
        )
    })
)