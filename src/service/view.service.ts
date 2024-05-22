import { Context, Effect, Layer, SynchronizedRef } from "effect";
import { ElementNotFoundError } from "../errors/errors";

export class ViewService extends Context.Tag('ViewService')<
    ViewService,
    {
        readonly render: <T>(
            containerId: string,
            syncRef: SynchronizedRef.SynchronizedRef<Record<string, T>>
        ) => Effect.Effect<void, ElementNotFoundError>
    }
>
() {}

export const ViewServiceLive = Layer.succeed(
    ViewService,
    ViewService.of({
        render: (containerId: string) => Effect.gen(function* () {
            const container = document.getElementById(containerId);
            if (!container) {
                Effect.fail(new ElementNotFoundError());
            }
              
        })
    })
)