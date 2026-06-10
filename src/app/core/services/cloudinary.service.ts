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
   * Inserta transformaciones en una URL de Cloudinary para obtener un avatar
   * cuadrado recortado con detección facial.
   */
  avatarUrl(url: string | null | undefined, sizePx = 280): string {
    if (!url) return 'assets/icons/default-avatar.svg';
    const idx = url.indexOf(CLOUDINARY_UPLOAD_MARKER);
    if (idx === -1) return url;
    const base = url.slice(0, idx + CLOUDINARY_UPLOAD_MARKER.length);
    const rest = url.slice(idx + CLOUDINARY_UPLOAD_MARKER.length);
    if (rest.startsWith('c_fill')) return url;
    return `${base}c_fill,g_face,w_${sizePx},h_${sizePx},q_auto,f_auto/${rest}`;
  }
}
