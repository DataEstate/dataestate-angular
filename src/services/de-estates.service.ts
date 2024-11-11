// src/services/de-estates.service.ts
import { IHttpPromise } from 'angular';
import { IDeApiService } from '../providers/de-api.provider';

export interface IDeEstatesService {
  data(params?: any, id?: string): IHttpPromise<any>;
  update(
    id: string,
    data: any,
    language?: string,
    remove_data?: any,
    add_data?: any
  ): IHttpPromise<any>;
  create(category_code: string, data: any): IHttpPromise<any>;
  remove(id: string): IHttpPromise<any>;
}

class DeEstatesService implements IDeEstatesService {
  static $inject = ['DeApi'];

  constructor(private DeApi: IDeApiService) {}

  data(params?: any, id?: string): IHttpPromise<any> {
    const endpointId = id || '';
    const endpoints = `/estates/data/${endpointId}`;
    return this.DeApi.get(endpoints, params);
  }

  update(
    id: string,
    data: any,
    language?: string,
    remove_data?: any,
    add_data?: any
  ): IHttpPromise<any> {
    const endpoints = `/estates/data/${id}`;
    const putData: any = { data };

    if (language && language !== 'english') {
      putData.language = language;
    }
    if (remove_data != null) {
      putData.remove = remove_data;
    }
    if (add_data != null) {
      putData.add = add_data;
    }

    return this.DeApi.put(endpoints, putData);
  }

  create(category_code: string, data: any): IHttpPromise<any> {
    const endpoints = '/estates/data/';
    const postData = {
      data,
      category_code,
    };
    return this.DeApi.post(endpoints, postData);
  }

  remove(id: string): IHttpPromise<any> {
    const endpoints = `/estates/data/${id}`;
    return this.DeApi.delete(endpoints);
  }
}

export default DeEstatesService;
