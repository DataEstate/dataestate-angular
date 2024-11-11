// de-search.directive.ts

import {
  IScope,
  IDirective,
  IAttributes,
  IRootScopeService,
  IAugmentedJQuery,
  IAngularEvent,
} from 'angular';
import { IDeEstatesService } from '../services/de-estates.service';
import { IDeAssetsService } from '../services/de-assets.service';
import { IDeLocationsService } from '../services/de-locations.service';
import { IDeSearchScope } from './de-search.directive.types';
import DeSearchController from '../controllers/de-search.controller';

/**
 * Custom built search input container. Requires an <input> with de-search-bar as attribute.
 * Attributes:
 * location-label-alias (string) - Title for the location search result. Default is Location
 * estate-label-alias (string) - Title for the estate search result. Default is Estate
 * keyword-label-alias (string) - Title for the keyword search result. Default is Keyword
 * estate-url (string) - The base url to link to the estate detail view.
 */
function DeSearchDirective(
  $rootScope: IRootScopeService,
  DeEstates: IDeEstatesService,
  DeAssets: IDeAssetsService,
  DeLocations: IDeLocationsService
): IDirective<IDeSearchScope> {
  return {
    scope: {
      locationLabel: '@?locationLabelAlias',
      searchInState: '@?searchInState',
      estateLabel: '@?estateLabelAlias',
      keywordLabel: '@?keywordLabelAlias',
      estateUrl: '@?estateUrl',
      showState: '=?',
    },
    transclude: true,
    controller: DeSearchController,
    controllerAs: 'sc',
    bindToController: true,
    link: (
      scope: IDeSearchScope
      // element: IAugmentedJQuery,
      // attr: IAttributes,
      // ctrl: DeSearchController
    ) => {
      // Track window click for clickout close event.
      const winClickEventConstant = 'windowsClicked';

      window.onclick = (ev: MouseEvent) => {
        $rootScope.$broadcast(winClickEventConstant);
      };

      scope.$on(winClickEventConstant, (ev: IAngularEvent, data: any) => {
        if (data) {
          if (data.$id !== scope.$id && scope.popupOpen) {
            scope.popupOpen = false;
            if (scope.searchControl?.onClose) {
              const searchScope = {
                keyword: scope.searchControl.searchText,
                locality: scope.searchControl.searchLocality,
                region: scope.searchControl.searchRegion,
                state_code: scope.searchControl.searchState,
              };
              scope.searchControl.onClose({ $searchScope: searchScope });
            }
          }
        } else {
          scope.$apply(() => {
            if (scope.popupOpen) {
              scope.popupOpen = false;
              if (scope.searchControl?.onClose) {
                const searchScope = {
                  keyword: scope.searchControl.searchText,
                  locality: scope.searchControl.searchLocality,
                  region: scope.searchControl.searchRegion,
                  state_code: scope.searchControl.searchState,
                };
                const searchModes = scope.searchControl.searchModes
                  ? scope.searchControl.searchModes.split('|')
                  : [];
                if (
                  searchModes.length > 0 &&
                  !searchModes.includes('KEYWORD')
                ) {
                  delete searchScope.keyword;
                }
                scope.searchControl.onClose({ $searchScope: searchScope });
              }
            }
          });
        }
      });
    },
    template: `<div ng-transclude></div>
      <div class="searchinput-dropdown" ng-show="popupOpen">
        <div ng-if="showKeywordSearch" class="keyword-search" ng-click="sc.searchKeywordClicked()">
          <h4>{{sc.keywordLabel}}: </h4>
          <span class="search-term">{{sc.searchText}}</span>
        </div>
        <div ng-if="showLocationSearch">
          <h4>{{sc.locationLabel}}</h4>
          <ul>
            <li ng-repeat="searchOption in sc.searchLocationOptions track by $index" ng-click="sc.searchLocationClicked(searchOption)">
              <span>{{searchOption.label}}</span>
            </li>
          </ul>
        </div>
        <div ng-if="showEstateSearch">
          <h4>{{sc.estateLabel}}</h4>
          <ul>
            <li ng-repeat="searchOption in sc.searchEstateOptions track by $index">
              <span><a ng-href="{{sc.estateUrl + searchOption.estateId}}">{{searchOption.label}}</a></span>
            </li>
          </ul>
        </div>
      </div>`,
  };
}

DeSearchDirective.$inject = [
  '$rootScope',
  'DeEstates',
  'DeAssets',
  'DeLocations',
];

export default DeSearchDirective;
