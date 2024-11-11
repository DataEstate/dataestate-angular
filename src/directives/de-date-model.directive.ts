import { IAttributes, IAugmentedJQuery, IDirective, IScope } from 'angular';

interface IDeDateModelScope extends IScope {
  dateObj: Date | string | undefined;
}

function DeDateModelDirective(): IDirective<IDeDateModelScope> {
  return {
    restrict: 'A',
    scope: {
      dateObj: '=deDateModel',
    },
    link: (
      scope: IDeDateModelScope,
      element: IAugmentedJQuery,
      attrs: IAttributes
    ) => {
      if (scope.dateObj !== undefined) {
        if (typeof scope.dateObj === 'string') {
          const dateValue = new Date(scope.dateObj);
          if (!isNaN(dateValue.getTime())) {
            scope.dateObj = dateValue;
            element.val(scope.dateObj.toISOString().split('Z')[0]);
          } else {
            element.val(scope.dateObj);
          }
        } else if (scope.dateObj instanceof Date) {
          element.val(scope.dateObj.toISOString().split('Z')[0]);
        } else {
          element.val('');
        }
      }

      const changeHandler = (ev: Event) => {
        scope.$apply(() => {
          const value = element.val() as string;
          if (value !== '') {
            const dateValue = new Date(value);
            if (!isNaN(dateValue.getTime())) {
              scope.dateObj = dateValue;
            } else {
              alert('Invalid date format. Changes not saved.');
            }
          }
        });
      };

      element.on('change', changeHandler);

      scope.$on('$destroy', () => {
        element.off('change', changeHandler);
      });
    },
  };
}

export default DeDateModelDirective;
