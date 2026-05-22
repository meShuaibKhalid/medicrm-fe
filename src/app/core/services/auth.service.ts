import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { MOCK_USERS } from '../../shared/data/mock-data';
import { User } from '../../shared/models/app.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  login(identifier: string, _password: string, admin = false): Observable<User | null> {
    const user = MOCK_USERS.find((item) => admin ? item.role === 'admin' && item.email === identifier : item.email === identifier || item.phone === identifier) ?? null;
    this.currentUserSubject.next(user);
    return of(user);
  }

  register(payload: Omit<User, 'id' | 'role' | 'isActive'> & { password: string }): Observable<User> {
    const user: User = {
      id: `usr-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: 'customer',
      isActive: true,
    };
    this.currentUserSubject.next(user);
    return of(user);
  }

  logout(): void {
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
