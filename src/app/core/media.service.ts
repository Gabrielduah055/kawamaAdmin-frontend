import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiEnvelope, ProductImage, UploadSignature } from './admin.models';
import { buildApiUrl, resolveEndpoint } from './endpoint';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly base = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  uploadImage(file: File): Observable<ProductImage> {
    return this.http.post<ApiEnvelope<UploadSignature>>(
      buildApiUrl(this.base, environment.apiEndpoints.uploadSignature),
      {},
    ).pipe(
      map(({ data }) => data),
      switchMap((signature) => {
        const form = new FormData();
        form.append('file', file);
        form.append('timestamp', String(signature.timestamp));
        form.append('signature', signature.signature);
        form.append('api_key', signature.apiKey);
        form.append('folder', signature.folder);

        return this.http.post<{ secure_url: string; public_id: string }>(
          resolveEndpoint(environment.externalEndpoints.cloudinaryImageUpload, { cloudName: signature.cloudName }),
          form,
        );
      }),
      map((result) => ({
        src: result.secure_url,
        publicId: result.public_id,
        alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        position: 0,
      })),
    );
  }

  deleteUpload(publicId: string): Observable<void> {
    return this.http.delete<void>(buildApiUrl(this.base, environment.apiEndpoints.uploads), {
      body: { publicId },
    });
  }
}
