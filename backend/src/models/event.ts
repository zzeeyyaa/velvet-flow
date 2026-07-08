export interface Event {
    id: string;
    name: string;
    description: string;
    status: 'UPCOMING' | 'ONGOING' | 'ENDED' | 'CANCELED';
    sale_starts_at: Date;
    created_at: Date;
    updated_at: Date;
}