import { IHttpPromise } from 'angular';
import { IDeApiService } from '../providers/de-api.provider';

export interface IDeLocationsService {
  data(params?: any, id?: string): IHttpPromise<any>;
  country(path: string, params?: any): IHttpPromise<any>;
  update(
    id: string,
    data: any,
    language?: string,
    remove_data?: any,
    add_data?: any
  ): IHttpPromise<any>;
}

class DeLocationsService implements IDeLocationsService {
  static $inject = ['DeApi'];

  constructor(private DeApi: IDeApiService) {}

  data(params?: any, id: string = ''): IHttpPromise<any> {
    const endpoint = `/locations/data/${id}`;
    return this.DeApi.get(endpoint, params);
  }

  country(path: string, params?: any): IHttpPromise<any> {
    const endpoint = `/locations/country/${path}`;
    return this.DeApi.get(endpoint, params);
  }

  update(
    id: string,
    data: any,
    language?: string,
    remove_data?: any,
    add_data?: any
  ): IHttpPromise<any> {
    const endpoint = `/locations/data/${id}`;
    const putData: any = { data };

    if (language !== undefined && language !== 'english') {
      putData.language = language;
    }
    if (remove_data !== undefined && remove_data !== null) {
      putData.remove = remove_data;
    }
    if (add_data !== undefined && add_data !== null) {
      putData.add = add_data;
    }

    return this.DeApi.put(endpoint, putData);
  }
}

export default DeLocationsService;
