import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../core/api-error';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });
  loading = false;
  errorMessage = '';
  readonly expired = this.route.snapshot.queryParamMap.get('reason') === 'expired';

  constructor(private readonly auth: AuthService) {
    if (this.auth.isAuthenticated()) void this.router.navigate(['/dashboard']);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).pipe(finalize(() => (this.loading = false))).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
        void this.router.navigateByUrl(returnUrl);
      },
      error: (error) => (this.errorMessage = apiErrorMessage(error, 'We could not sign you in. Check your credentials and try again.')),
    });
  }
}
