import { apiFetch } from "./http";
import type { Screening } from "../types/types";

export function fetchScreeningsByShow(showId: string): Promise<Screening[]>{
    return apiFetch<Screening[]>(`/api/shows/${showId}/screenings`);
}

export function fetchScreeningsByTheatre(theatreId: string): Promise<Screening[]>{
    return apiFetch<Screening[]>(`/api/theatres/${theatreId}/screenings`);
}

export function fetchScreeningsByShowAndTheatre(showId: string, theatreId: string): Promise<Screening[]>{
    return apiFetch<Screening[]>(`/api/shows/${showId}/screenings?theatreId=${theatreId}`);
}