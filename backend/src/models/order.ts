export interface Order {
    id: string;
    simulated_user_id: string;
    ticket_id: string;
    quantity: number;
    total_amount: number;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    payment_method: string;
    payment_status: 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';
    idempotency_key?: string;
    lock_strategy?: string;
    attempt_number?: number;
    created_at: Date;
    updated_at: Date;
}