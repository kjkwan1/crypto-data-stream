import { Queue } from "effect";
import { UnifiedData } from "../interface/unified-data.interface";

export const symbolDataQueue = Queue.bounded<UnifiedData>(100);