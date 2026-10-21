import { HttpParams } from '@angular/common/http';

export function toHttpParams(query: object): HttpParams {
  let params = new HttpParams();

  for (const [key, value] of Object.entries(query as Record<string, string | number | undefined>)) {
    if (value !== undefined && value !== '') {
      params = params.set(key, String(value));
    }
  }

  return params;
}
