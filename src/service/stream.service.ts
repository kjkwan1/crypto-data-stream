import { Chunk, Console, Context, Effect, Layer, Queue, Ref, Schedule, Stream, SynchronizedRef, pipe } from "effect";
import { hasChanges } from "../state/blockchain.ref";

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
            key: keyof T,
            compareValue: keyof T,
        ) => Effect.Effect<void, Error, never>
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
            Stream.mapConcat((response: T) => Chunk.fromIterable(Object.values(response as Record<string, A>))),
            Stream.mapEffect((chunk) => Queue.offer(queue, chunk)),
            Stream.runDrain,
        ),
        streamQueueToRef: <T>(
            queue: Queue.Queue<T>,
            state: SynchronizedRef.SynchronizedRef<Record<string, T>>,
            key: keyof T,
            compareKey: keyof T,
        ) => pipe(
            Stream.fromQueue(queue),
            Stream.tap((item) => Console.log('streamQueueToRef: ', item)),
            Stream.mapEffect((data: T) => SynchronizedRef.update(state, prev => {
                const id = data[key] as string;
                const prevVal = prev[id];
                const newState = {...prev};

                if (!prevVal) {
                    newState[id] = data;
                    return newState;
                }

                if (data[compareKey] === prevVal[compareKey]) {
                    return prev;
                }
                
                console.log(`Data for ${data[key]} changed: `, data);
                newState[id] = data;
                return newState;
            })),
            Stream.runDrain,
        ),
    })
)