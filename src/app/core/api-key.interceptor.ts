import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo añade la API key en llamadas al backend propio
  if (req.url.startsWith(environment.apiUrl)) {
    const authReq = req.clone({
      headers: req.headers.set('X-API-KEY', environment.apiKey)
    });
    return next(authReq);
  }
  return next(req);
};
