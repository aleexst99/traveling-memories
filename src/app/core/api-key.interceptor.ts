import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  // En producción apunta al backend real → añade la API key
  // En desarrollo usa el proxy local → el proxy ya inyecta la key
  if (environment.production) {
    const authReq = req.clone({
      headers: req.headers.set('X-API-KEY', environment.apiKey)
    });
    return next(authReq);
  }
  return next(req);
};
