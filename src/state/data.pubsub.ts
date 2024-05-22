import { PubSub } from "effect";
import { BlockchainData } from "../interface/blockchain.interface";

export const blockchainPubSub = PubSub.bounded<BlockchainData>(100);