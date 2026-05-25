import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { User } from '../../shared/models/app.models';
import { environment } from '../../../environments/environment';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();
  
  // Using an environment variable or a base API URL constant would be better here
  // Assuming frontend is running and backend is on port 3000
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor() {
    this.initAuth();
  }

  private initAuth(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get<UserResponse>(`${this.apiUrl}/me`).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.currentUserSubject.next(res.data);
          } else {
            this.logout();
          }
        },
        error: () => this.logout()
      });
    }
  }

  login(identifier: string, password: string, _admin = false): Observable<User | null> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { identifier, password }).pipe(
      tap((res) => {
        if (res.success && res.data) {
          localStorage.setItem('token', res.data.token);
          this.currentUserSubject.next(res.data.user);
        }
      }),
      map(res => res.data?.user || null)
    );
  }

  register(payload: Omit<User, 'id' | 'role' | 'isActive'> & { password: string }): Observable<User | null> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap((res) => {
        if (res.success && res.data) {
          localStorage.setItem('token', res.data.token);
          this.currentUserSubject.next(res.data.user);
        }
      }),
      map(res => res.data?.user || null)
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  getCurrentUserSnapshot(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
}
