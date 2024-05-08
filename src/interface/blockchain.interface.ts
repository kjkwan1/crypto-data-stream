export interface BlockchainResponse {
    [key: string]: BlockchainData;
}

export interface BlockchainData {
    auction_price: number;
    auction_size: number;
    auction_time: string;
    base_currency: string;
    base_currency_scale: number;
    counter_currency: string;
    counter_currency_scale: number;
    id: number;
    imbalance: number;
    lot_size: number;
    lot_size_scale: number;
    max_order_size: number;
    max_order_size_scale: number;
    min_order_size: number
    min_order_size_scale: number
    min_price_increment: number
    min_price_increment_scale: number;
    status: string;
}