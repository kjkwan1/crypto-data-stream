import { Context, Effect, Layer } from "effect";

export class ApiService extends Context.Tag('ApiService')<
    ApiService,
    {
        readonly get: <T>(url: string, headers?: any) => Effect.Effect<T, Error>;
    }
>() {}

export const ApiServiceLive = Layer.succeed(
    ApiService,
    ApiService.of({
        get: <T>(url: string, headers: any) => Effect.tryPromise({
            try: () => fetch(url, { method: 'GET', headers }).then((response) => <T>response.json()),
            catch: (unknown) => new Error(`something went wrong ${unknown}`)
        })
    })
)