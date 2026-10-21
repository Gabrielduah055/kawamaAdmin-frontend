import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiEnvelope, AuthSession, LoginResponse } from './admin.models';
import { buildApiUrl } from './endpoint';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'kawama-admin-session';
  private readonly sessionState = signal<AuthSession | null>(this.restore());

  readonly session = this.sessionState.asReadonly();
  readonly admin = computed(() => this.sessionState()?.admin ?? null);
  readonly isAuthenticated = computed(() => {
    const session = this.sessionState();
    return Boolean(session && session.expiresAt > Date.now());
  });

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<AuthSession> {
    return this.http
      .post<ApiEnvelope<LoginResponse>>(
        buildApiUrl(environment.apiBaseUrl, environment.apiEndpoints.authLogin),
        { email, password },
      )
      .pipe(
        map(({ data }) => ({
          token: data.token,
          tokenType: data.tokenType,
          expiresAt: Date.now() + data.expiresIn * 1000,
          admin: data.admin,
        })),
        tap((session) => this.persist(session)),
      );
  }

  token(): string | null {
    if (!this.isAuthenticated()) {
      this.logout();
      return null;
    }
    return this.sessionState()?.token ?? null;
  }

  logout(): void {
    this.sessionState.set(null);
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(this.storageKey);
  }

  private persist(session: AuthSession): void {
    this.sessionState.set(session);
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(this.storageKey, JSON.stringify(session));
  }

  private restore(): AuthSession | null {
    if (typeof sessionStorage === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(this.storageKey);
      if (!raw) return null;
      const session = JSON.parse(raw) as AuthSession;
      if (!session.token || !session.admin?.email || session.expiresAt <= Date.now()) {
        sessionStorage.removeItem(this.storageKey);
        return null;
      }
      return session;
    } catch {
      sessionStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
