import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUser, UpdateUser, ChangePassword } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) { }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    getMe(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/me`);
    }

    getUser(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    createUser(user: CreateUser): Observable<User> {
        return this.http.post<User>(this.apiUrl, user);
    }

    updateUser(id: number, user: UpdateUser): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}`, user);
    }

    changePassword(id: number, data: ChangePassword): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/change-password`, data);
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
