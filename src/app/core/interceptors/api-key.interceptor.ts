import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '@environments/environment';
import { AuthService } from '@core/services/auth.service';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const token = auth.getToken();

  // If the user is logged in send Bearer JWT, otherwise fall back to X-API-KEY
  const headers = token
    ? req.headers.set('Authorization', `Bearer ${token}`)
    : req.headers.set('X-API-KEY', environment.apiKey);

  return next(req.clone({ headers }));
};
