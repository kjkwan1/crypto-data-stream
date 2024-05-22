import { Chunk, Console, Context, Effect, Layer, Queue, Schedule, Stream, SynchronizedRef, pipe } from "effect";

export class StreamService extends Context.Tag('StreamService')<
    StreamService,
    {
        readonly generateApiStream: <T, A>(
            runnable: Effect.Effect<T, Error, never>,
            state: SynchronizedRef.SynchronizedRef<Record<string, A>>,
            queue: Queue.Queue<A>,
            key: keyof A,
            compareKey: keyof A,
            interval: number,
        ) => Effect.Effect<void, Error, never>
    }
>() {}

export const StreamServiceLive = Layer.succeed(
    StreamService,
    StreamService.of({
        generateApiStream: <T, A>(
            runnable: Effect.Effect<T, Error, never>,
            state: SynchronizedRef.SynchronizedRef<Record<string, A>>,
            queue: Queue.Queue<A>,
            key: keyof A,
            compareKey: keyof A,
            interval: number,
        ) => pipe(
            Stream.repeatEffect(runnable),
            Stream.schedule(Schedule.fixed(interval)),
            Stream.mapConcat((response: T) => Chunk.fromIterable(Object.values(response as Record<string, A>))),
            Stream.mapEffect((chunk: A) => {
                return Queue.offer(queue, chunk).pipe(
                    Effect.zipRight(SynchronizedRef.updateAndGet(state, prev => {
                        const id = chunk[key] as string;
                        const prevVal = prev[id];
                        const newState = {...prev};
        
                        if (!prevVal || chunk[compareKey] !== prevVal[compareKey]) {
                            console.log(`Data for ${id} changed or added: [prevVal: ${prevVal ? prevVal[compareKey] : 'None'}, currentVal: ${chunk[compareKey]}]`, chunk);
                            newState[id] = chunk;
                            return newState;
                        }
                        
                        return prev; 
                    }), { concurrent: true })
                )
            }),
            Stream.runDrain,
        ),
    })
)