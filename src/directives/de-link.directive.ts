import { IScope } from 'angular';

interface IDeLinkScope extends IScope {
  deLink?: {
    type?: string;
    endpoints?: any;
    params?: any;
    link?: string;
  };
  apiAction?: (args: {
    $elem: angular.IAugmentedJQuery;
    endpoints: any;
    params: any;
  }) => void;
  internalAction?: (args: {
    $elem: angular.IAugmentedJQuery;
    link: string;
  }) => void;
  linkOptions?: {
    targets?: { [key: string]: string };
  };
}

function DeLinkDirective(): angular.IDirective {
  return {
    restrict: 'A',
    scope: {
      deLink: '=?deLink',
      apiAction: '&?deApiAction',
      internalAction: '&?deInternalAction',
      linkOptions: '=?deLinkOptions',
    },
    transclude: 'element',
    link: (
      scope: IDeLinkScope,
      element: angular.IAugmentedJQuery,
      attrs: angular.IAttributes
    ) => {
      const boundScope = scope.deLink;
      if (scope.deLink && scope.deLink.type !== undefined) {
        if (scope.deLink.type === 'api') {
          element.on('click', () => {
            if (scope.apiAction) {
              scope.apiAction({
                $elem: element,
                endpoints: scope.deLink!.endpoints,
                params: scope.deLink!.params,
              });
            }
          });
        } else if (scope.deLink.type === 'internal') {
          element.on('click', () => {
            if (scope.internalAction) {
              scope.internalAction({
                $elem: element,
                link: scope.deLink!.link,
              });
            }
          });
        } else {
          if (scope.linkOptions && scope.linkOptions.targets) {
            const target = scope.linkOptions.targets[scope.deLink.type];
            if (target) {
              element.attr('target', target);
            }
          }
          if (scope.deLink.link) {
            element.attr('href', scope.deLink.link);
          }
        }
      }
    },
  };
}

export default DeLinkDirective;
