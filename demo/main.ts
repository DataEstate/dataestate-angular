import dataEstateModule from '../src/dataEstateModule';
import * as angular from 'angular';
import DeApiProvider from '../src/providers/de-api.provider';
import { IDeEstatesService } from '../src/services/de-estates.service';
import { IDeAssetsService } from '../src/services/de-assets.service';

interface IDemoControllerScope extends angular.IScope {
  title: string;
}

class DemoController {
  static $inject = ['DeEstates', 'DeAssets'];

  title: string;
  listings: string[];

  constructor(
    private DeEstates: IDeEstatesService,
    private DeAssets: IDeAssetsService
  ) {
    this.title = 'Demo App!';
    this.listings = ['hi'];
    this.getListings();
  }

  getListings() {
    const thisYear = new Date().getFullYear();
    const currentYear = thisYear - 1;
    const lastYear = currentYear - 1;
    const params = {
      awarded: true,
      award_year: thisYear + ',' + currentYear + ',' + lastYear,
      fields:
        'id,name,description,info,rate,atap_accreditations,state,category,' +
        'locality,images,booking_url,tourism_awards,hero_image,attributes,subtypes,state_code,star_rating,' +
        'addresses,urls,emails,phones,_custom.travellers_ratings',
      size: 3,
      categories:
        'ACCOMM,ATTRACTION,TOUR,TRANSPORT,INFO,HIRE,RESTAURANT,GENSERVICE',
      sort: '-update_date',
    };

    this.DeEstates.data(params).then((res) => {
      const totalCount = res.headers('x-total-count');
    });
  }
}

angular
  .module('demoApp', [dataEstateModule.name])
  .config([
    'DeApiProvider',
    function (DeApiProvider: DeApiProvider) {
      DeApiProvider.setApi('http://localhost:3030/v3');
      DeApiProvider.setAuthType('none');
      DeApiProvider.setIsV3SyntaxEnabled(true);
    },
  ])
  .controller('DemoController', ['DeEstates', 'DeAssets', DemoController]);
