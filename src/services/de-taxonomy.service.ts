import { IHttpPromise } from 'angular';
import { IDeApiService } from '../providers/de-api.provider';
import { handleApiResponse } from '../utils/handleApiResponse';

export interface ISubtype {
  type: string;
  description: string;
}

export interface ILocation {
  id: string;
  name: string;
  loc: [number, number];
}

export interface ISocialPlatform {
  id: string;
  name: string;
}

export interface IDeTaxonomyService {
  subtypes(category: string): IHttpPromise<any>;
  locations(): ILocation[];
  categories(): { [key: string]: string };
  accreditations(): IHttpPromise<any>;
  social(): ISocialPlatform[];
  data(params?: any, id?: string): IHttpPromise<any>;
  update(
    id: string,
    data: any,
    language?: string,
    remove_data?: any,
    add_data?: any
  ): IHttpPromise<any>;
  create(type: string, data: any): IHttpPromise<any>;
  remove(id: string): IHttpPromise<any>;
}

class DeTaxonomyService implements IDeTaxonomyService {
  static $inject = ['DeApi'];

  // private subtypesData: ISubtype[] = [
  //   {
  //     type: 'LANDMARK',
  //     description: 'Landmark',
  //   },
  //   {
  //     type: 'EDUCATION',
  //     description: 'Educational',
  //   },
  //   {
  //     type: 'FOODDRINK',
  //     description: 'Food and Drink',
  //   },
  //   {
  //     type: 'MUSICAL',
  //     description: 'Musical Performance',
  //   },
  //   {
  //     type: 'CEREMONY',
  //     description: 'Ceremony',
  //   },
  //   {
  //     type: 'SPORT',
  //     description: 'Sports Event',
  //   },
  //   {
  //     type: 'PERFORMANCE',
  //     description: 'Performances',
  //   },
  //   {
  //     type: 'PARADE',
  //     description: 'March and Parade',
  //   },
  //   {
  //     type: 'CULTURAL',
  //     description: 'Cutural',
  //   },
  //   {
  //     type: 'ACTIVITY',
  //     description: 'Activities',
  //   },
  //   {
  //     type: 'MEDITATION',
  //     description: 'Meditation',
  //   },
  //   {
  //     type: 'PHOTOGRAPHY',
  //     description: 'Photography Event',
  //   },
  //   {
  //     type: 'TALK',
  //     description: 'Talks',
  //   },
  //   {
  //     type: 'FORUM',
  //     description: 'Forums',
  //   },
  //   {
  //     type: 'FOOD',
  //     description: 'Food',
  //   },
  //   {
  //     type: 'DESSERT',
  //     description: 'Snacks and Desserts',
  //   },
  //   {
  //     type: 'DRINK',
  //     description: 'Drinks',
  //   },
  //   {
  //     type: 'SHOP',
  //     description: 'Shops',
  //   },
  //   {
  //     type: 'INFO',
  //     description: 'Information',
  //   },
  //   {
  //     type: 'VOLUNTEER',
  //     description: 'Volunteers',
  //   },
  //   {
  //     type: 'DISPLAY',
  //     description: 'Art and Display',
  //   },
  //   {
  //     type: 'SERVICE',
  //     description: 'Services',
  //   },
  // ];

  private locationsData: ILocation[] = [
    {
      id: 'BNELETTER',
      name: 'Brisbane Letters',
      loc: [-27.474147, 153.020482],
    },
    {
      id: 'QC',
      name: 'Queensland Conservatorium',
      loc: [-27.4768193, 153.0208075],
    },
    {
      id: 'LIANA',
      name: 'Liana Lounge',
      loc: [-27.475902, 153.021213],
    },
    {
      loc: [-27.4706487, 153.0170457],
      id: 'GOMA',
      name: 'GOMA (Gallery of Modern Art)',
    },
    {
      id: 'CF',
      name: 'Cultural Forecourt',
      loc: [-27.4739896, 153.0203686],
    },
    {
      loc: [-27.4748418, 153.0212796],
      id: 'RB',
      name: 'Riverbank',
    },
    {
      loc: [-27.476474, 153.021173],
      name: 'Lumbini Garden',
      id: 'LG',
    },
    {
      loc: [-27.4771943, 153.0217732],
      id: 'NB',
      name: 'No Boundaries',
    },
    {
      loc: [-27.476186, 153.021666],
      name: 'Rainforest Green',
      id: 'RG',
    },
    {
      id: 'CMP',
      name: 'The South Bank Piazza',
      loc: [-27.4769716, 153.0214888],
    },
    {
      id: 'PAS',
      loc: [-27.474771, 153.0209563],
      name: 'Performing Arts Stage',
    },
  ];

  private categoriesData: { [key: string]: string } = {
    ACCOMM: 'Accommodation',
    APP: 'Application',
    ATTRACTION: 'Attraction',
    COMPANY: 'Company',
    DESTINFO: 'Destination Information',
    EVENT: 'Event',
    GENSERVICE: 'General Services',
    GROUP: 'Group',
    HIRE: 'Hire',
    INFO: 'Information Services',
    JOURNEY: 'Journey',
    ORG: 'Organisation',
    RESTAURANT: 'Food and Drink',
    TOUR: 'Tour',
    TRANSPORT: 'Transport',
  };

  private socialData: ISocialPlatform[] = [
    { id: 'in', name: 'Instagram' },
    { id: 'fb', name: 'Facebook' },
    { id: 'li', name: 'LinkedIn' },
    { id: 'tw', name: 'Twitter' },
    { id: 'yt', name: 'YouTube' },
  ];

  constructor(private DeApi: IDeApiService) {}

  subtypes(category: string): IHttpPromise<any> {
    const endpoint = `/taxonomy/data/${category}`;
    const response = this.DeApi.get(endpoint, {});

    return response;
  }

  locations(): ILocation[] {
    return this.locationsData;
  }

  categories(): { [key: string]: string } {
    return this.categoriesData;
  }

  accreditations(): IHttpPromise<any> {
    const endpoint = '/taxonomy/data/ACCREDITN';
    const response = this.DeApi.get(endpoint, {});
    return handleApiResponse(response, this.DeApi.getIsV3SyntaxEnabled());
  }

  social(): ISocialPlatform[] {
    return this.socialData;
  }

  data(params?: any, id: string = ''): IHttpPromise<any> {
    const endpoint = `/taxonomy/data/${id}`;
    const response = this.DeApi.get(endpoint, params);
    return handleApiResponse(response, this.DeApi.getIsV3SyntaxEnabled());
  }

  update(
    id: string,
    data: any,
    language?: string,
    remove_data?: any,
    add_data?: any
  ): IHttpPromise<any> {
    const endpoint = `/taxonomy/data/${id}`;
    const putData: any = { data };

    if (language !== undefined) {
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

  create(type: string, data: any): IHttpPromise<any> {
    const endpoint = '/taxonomy/data/';
    if (!data.hasOwnProperty('type')) {
      data.type = type;
    }
    const postData = { data };
    return this.DeApi.post(endpoint, postData);
  }

  remove(id: string): IHttpPromise<any> {
    const endpoint = `/taxonomy/data/${id}`;
    return this.DeApi.delete(endpoint);
  }
}

export default DeTaxonomyService;
