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
   * Si la URL no es de Cloudinary, la devuelve sin modificar.
   *
   * @param url      URL original devuelta por Cloudinary
   * @param sizePx   Lado del cuadrado en píxeles (por defecto 280 para pantallas retina)
   */
  avatarUrl(url: string | null | undefined, sizePx = 280): string {
    if (!url) return 'assets/icons/default-avatar.svg';

    const idx = url.indexOf(CLOUDINARY_UPLOAD_MARKER);
    if (idx === -1) return url; // URL externa, no tocamos

    const base = url.slice(0, idx + CLOUDINARY_UPLOAD_MARKER.length);
    const rest = url.slice(idx + CLOUDINARY_UPLOAD_MARKER.length);

    // Evita duplicar transformaciones si la URL ya las lleva
    if (rest.startsWith('c_fill')) return url;

    const transforms = `c_fill,g_face,w_${sizePx},h_${sizePx},q_90,f_auto`;
    return `${base}${transforms}/${rest}`;
  }
}
