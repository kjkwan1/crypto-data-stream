import { Chunk, Console, Context, Effect, Layer, Queue, Schedule, Stream, SynchronizedRef, pipe } from "effect";

export class StreamService extends Context.Tag('StreamService')<
    StreamService,
    {
        readonly generateApiStream: <T, A>(
            runnable: Effect.Effect<T, Error, never>,
            queue: Queue.Queue<A>,
            interval: number,
        ) => Effect.Effect<void, Error, never>,
        readonly streamQueueToRef: <T>(
            queue: Queue.Queue<T>,
            state: SynchronizedRef.SynchronizedRef<Record<string, T>>,
            key: string,
        ) => Effect.Effect<void, Error, never>,
    }
>() {}

export const StreamServiceLive = Layer.succeed(
    StreamService,
    StreamService.of({
        generateApiStream: <T, A>(
            runnable: Effect.Effect<T, Error, never>,
            queue: Queue.Queue<A>,
            interval: number,
        ) => pipe(
            Stream.repeatEffect(runnable),
            Stream.schedule(Schedule.fixed(interval)),
            Stream.tap(Console.log),
            Stream.mapConcat((response: T) => Chunk.fromIterable(Object.values(response as Record<string, A>))),
            Stream.mapEffect((chunk) => Queue.offer(queue, chunk)),
            Stream.runDrain,
        ),
        streamQueueToRef: <T>(
            queue: Queue.Queue<T>,
            state: SynchronizedRef.SynchronizedRef<Record<string, T>>,
            key: string,
        ) => pipe(
            Stream.fromQueue(queue),
            Stream.tap((item) => Console.log('streamQueueToRef: ', item)),
            Stream.mapEffect((data: any) => SynchronizedRef.update(state, prev => {
                const newState = {...prev};
                if (data[key]) {
                    newState[key] = data;
                }
                return newState;
            })),
            Stream.runDrain,
        )
    })
)