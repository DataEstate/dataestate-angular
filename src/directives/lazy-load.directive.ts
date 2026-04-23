import * as angular from 'angular';
import {
  IAttributes,
  IAugmentedJQuery,
  IDirective,
  IPromise,
  IQService,
  IScope,
} from 'angular';

interface IDeScriptLoaderService {
  load: (scriptSrc: string) => IPromise<void>;
}

interface ILazyLoadScope extends IScope {
  onload?: () => void;
}

function createScriptElement(src: string): HTMLScriptElement {
  const script = document.createElement('script');
  script.src = src;
  document.getElementsByTagName('head')[0].appendChild(script);
  return script;
}

function DeScriptLoaderFactory($q: IQService): IDeScriptLoaderService {
  return {
    load: (scriptSrc: string): IPromise<void> => {
      return $q<void>((resolve) => {
        createScriptElement(scriptSrc).onload = () => {
          resolve();
        };
      });
    },
  };
}

DeScriptLoaderFactory.$inject = ['$q'];

function LazyLoadDirective(
  DeScriptLoader: IDeScriptLoaderService
): IDirective<ILazyLoadScope> {
  return {
    scope: {
      onload: '&?',
    },
    link: (
      scope: ILazyLoadScope,
      elem: IAugmentedJQuery,
      attr: IAttributes
    ) => {
      void DeScriptLoader;
      void elem;
      void attr;

      if (scope.onload !== undefined) {
        scope.onload();
      }
    },
  };
}

LazyLoadDirective.$inject = ['DeScriptLoader'];

const de = angular.module('dataEstateModule');
de.factory('DeScriptLoader', DeScriptLoaderFactory);
de.directive('lazyLoad', LazyLoadDirective);

export { DeScriptLoaderFactory, LazyLoadDirective };
