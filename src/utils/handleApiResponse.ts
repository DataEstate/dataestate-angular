// src/utils/handleApiResponse.ts
import { IHttpPromise, IHttpResponse } from 'angular';

export interface SearchResponseMeta {
  totalCount: number;
  count: number;
  page?: number;
}

export const handleApiResponse = (
  response: IHttpPromise<any>,
  isV3SyntaxEnabled: boolean
): IHttpPromise<any> => {
  if (isV3SyntaxEnabled) {
    return response.then((res: IHttpResponse<any>) => {
      // Extract the meta information
      const meta = res.data.meta || {};

      // Create a custom headers function that matches the expected signature
      const headers: angular.IHttpHeadersGetter = (
        headerName?: string
      ): any => {
        if (headerName) {
          if (headerName.toLowerCase() === 'x-total-count') {
            return meta.totalCount;
          } else if (typeof res.headers === 'function') {
            // Preserve other headers if they exist
            return res.headers(headerName);
          }
          return null;
        }
        // Return all headers as an object when no headerName is provided
        return res.headers();
      };

      return {
        ...res,
        data: res.data.data, // Return the nested `data` array
        headers, // Override the headers function
      };
    });
  }
  return response;
};
