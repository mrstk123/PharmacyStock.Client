import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HttpService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    get<T>(endpoint: string, params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }, headers?: HttpHeaders): Observable<T> {
        return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params, headers });
    }

    post<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, { headers });
    }

    put<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, { headers });
    }

    patch<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
        return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, { headers });
    }

    delete<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}${endpoint}`, { headers });
    }
}
