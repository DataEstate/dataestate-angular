import {
  IHttpService,
  IServiceProvider,
  IHttpPromise,
  IRequestConfig,
} from 'angular';

export interface IDeApiService {
  get(endpoints: string, params?: any): IHttpPromise<any>;
  put(endpoints: string, data: any): IHttpPromise<any>;
  post(endpoints: string, data: any): IHttpPromise<any>;
  delete(endpoints: string): IHttpPromise<any>;
  patch(endpoints: string, pipeline: any): IHttpPromise<any>;
  getAuthType(): 'api-key' | 'token' | 'none';
  getApiKey(): string;
  getToken(): string;
  getApiUrl(): string;
  getHeaders(): any;
  getIsV3SyntaxEnabled(): boolean;
}

class DeApiProvider implements IServiceProvider {
  private apiUrl: string = 'https://api.dataestate.net/v2'; // Default
  /**
   * Whether the new API v3 response style is enabled.
   */
  private isV3SyntaxEnabled = false;
  private apiKey: string = '';
  private authType: 'api-key' | 'token' | 'none' = 'api-key'; // Default v0.1.4
  private oauthData: { token?: string } = {};

  // Configurations
  setApi(api_url: string): void {
    this.apiUrl = api_url;
  }

  setApiKey(api_key: string): void {
    this.apiKey = api_key;
  }

  // v0.1.4
  setToken(auth_token: string): void {
    this.oauthData.token = auth_token;
  }

  setIsV3SyntaxEnabled(enbaleV3Syntax: boolean): void {
    this.isV3SyntaxEnabled = enbaleV3Syntax;
  }
  // v0.4.9: added "none" for proxies
  setAuthType(auth_type: 'api-key' | 'token' | 'none'): void {
    const allowedTypes = ['token', 'api-key', 'none'];
    if (allowedTypes.includes(auth_type)) {
      this.authType = auth_type;
    }
  }
  // Helper method to get headers
  public getHeaders(): any {
    const headers: any = {};
    if (this.authType === 'api-key') {
      headers['API-KEY'] = this.apiKey;
    } else if (this.authType === 'token') {
      headers['Authorization'] = `Bearer ${this.oauthData.token}`;
    }
    return headers;
  }

  // The $get method
  $get = [
    '$http',
    ($http: IHttpService): IDeApiService => {
      const service: IDeApiService = {
        get: (endpoints: string, params: any = {}): IHttpPromise<any> => {
          if (!endpoints) {
            console.error(`GET request made without endpoints!`);
            return;
          }

          const httpReq: IRequestConfig = {
            url: `${this.apiUrl}${endpoints}`,
            method: 'GET',
            params: params,
          };

          // Set headers based on authType
          if (this.authType === 'api-key') {
            params.api_key = params.api_key || this.apiKey;
          } else if (this.authType === 'token') {
            httpReq.headers = {
              Authorization: `Bearer ${this.oauthData.token}`,
            };
          }

          // Decode keyword if present
          if (params.keyword) {
            params.keyword = decodeURI(params.keyword);
          }

          return $http(httpReq);
        },
        put: (endpoints: string, data: any): IHttpPromise<any> => {
          if (!endpoints) {
            console.error(`PUT request made without endpoints!`);
            return;
          }

          const headers = this.getHeaders();
          return $http({
            url: `${this.apiUrl}${endpoints}`,
            method: 'PUT',
            data: data,
            headers: headers,
          });
        },
        post: (endpoints: string, data: any): IHttpPromise<any> => {
          if (!endpoints) {
            console.error(`POST request made without endpoints!`);
            return;
          }

          const headers = this.getHeaders();
          return $http({
            url: `${this.apiUrl}${endpoints}`,
            method: 'POST',
            data: data,
            headers: headers,
          });
        },
        delete: (endpoints: string): IHttpPromise<any> => {
          if (!endpoints) {
            console.error(`DELETE request made without endpoints!`);
            return;
          }

          const headers = this.getHeaders();
          return $http({
            url: `${this.apiUrl}${endpoints}`,
            method: 'DELETE',
            headers: headers,
          });
        },
        patch: (endpoints: string, pipeline: any): IHttpPromise<any> => {
          if (!endpoints) {
            console.error(`PATCH request made without endpoints!`);
            return;
          }

          const headers = this.getHeaders();
          return $http({
            url: `${this.apiUrl}${endpoints}`,
            method: 'PATCH',
            data: pipeline,
            headers: headers,
          });
        },
        getAuthType: (): 'api-key' | 'token' | 'none' => {
          return this.authType;
        },
        getApiKey: (): string => {
          return this.apiKey;
        },
        getToken: (): string => {
          return this.oauthData.token || '';
        },
        getApiUrl: (): string => {
          return this.apiUrl;
        },
        getHeaders: (): any => {
          return this.getHeaders();
        },
        getIsV3SyntaxEnabled: (): boolean => {
          return this.isV3SyntaxEnabled;
        },
      };

      return service;
    },
  ];
}

export default DeApiProvider;
