export interface CoincapResponse {
    data: CoincapData[];
}

export interface CoincapData {
    id: string;
    rank: string;
    symbol: string;
    name: string;
    supply: string;
    maxSupply: string;
    marketCapUsd: string;
    volumeUsd24Hr: string;
    priceUsd: string;
    changePercent24Hr: string;
    vwap24Hr: string;
}

export interface CoincapTrade {
    exchange: string,
    base: string,
    quote: string,
    direction: string,
    price: number,
    volume: number,
    timestamp: number,
    priceUsd:  number,
}

export interface CoincapPrice {
    bitcoin: number;
    etherium: number;
    monero: number;
    litecoin: number;
}