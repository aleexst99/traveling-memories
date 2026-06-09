import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';

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
}
