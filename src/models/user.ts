export interface User {
    id: string;
    /** Misspelled field kept from the Angular model; HNPWA sends `created_time`. */
    crated_time?: number;
    created_time?: number;
    created: string;
    karma: number;
    avg?: number;
    about?: string;
}
