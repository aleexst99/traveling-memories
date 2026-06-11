import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';

const CLOUDINARY_UPLOAD_MARKER = '/image/upload/';

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private http = inject(HttpClient);

  private readonly uploadUrl =
    `https://api.cloudinary.com/v1_1/${environment.cloudinaryCloudName}/image/upload`;

  /**
   * Sube una imagen a Cloudinary y devuelve la URL pública.
   * Usa unsigned upload — no requiere credenciales secretas en el frontend.
   */
  upload(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.cloudinaryUploadPreset);

    return this.http.post<{ secure_url: string }>(this.uploadUrl, formData).pipe(
      map(res => res.secure_url)
    );
  }

  /**
   * Añade optimización de calidad y formato a una URL de Cloudinary.
   * No recorta — el navegador gestiona el display con object-fit.
   * Si la URL no es de Cloudinary, la devuelve sin modificar.
   */
  avatarUrl(url: string | null | undefined): string {
    if (!url) return 'assets/icons/default-avatar.svg';

    const idx = url.indexOf(CLOUDINARY_UPLOAD_MARKER);
    if (idx === -1) return url;

    const base = url.slice(0, idx + CLOUDINARY_UPLOAD_MARKER.length);
    const rest = url.slice(idx + CLOUDINARY_UPLOAD_MARKER.length);

    return `${base}q_90,f_auto/${rest}`;
  }
}
