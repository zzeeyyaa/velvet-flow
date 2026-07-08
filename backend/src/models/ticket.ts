export interface Ticket {
    id: string;
    event_id: string;
    category_id: string; // 👈 Menunjuk ke Master Data Category
    total_capacity: number;
    price: number;
    stock: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}