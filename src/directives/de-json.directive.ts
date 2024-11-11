import { IDirective, IScope } from 'angular';

interface IDeJsonScope extends IScope {
  jsonValue: any;
}

function DeJsonDirective(): IDirective<IDeJsonScope> {
  return {
    restrict: 'A',
    scope: {
      jsonValue: '=deJson',
    },
    link: (
      scope: IDeJsonScope,
      element: angular.IAugmentedJQuery,
      attrs: angular.IAttributes
    ) => {
      if (scope.jsonValue !== undefined) {
        const jsonText = JSON.stringify(scope.jsonValue);
        element.val(jsonText);
      }
      element.on('change', (ev: Event) => {
        scope.$apply(() => {
          const value = element.val() as string;
          try {
            scope.jsonValue = JSON.parse(value);
          } catch (e) {
            alert(`${value} is not a valid JSON string. Changes not saved.`);
          }
        });
      });
    },
  };
}

export default DeJsonDirective;
