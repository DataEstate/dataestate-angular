import { IScope, IDirective, IAttributes, IAugmentedJQuery } from 'angular';
import { IDeChangeRegisterService } from '../factories/de-change-register.factory';

interface IDeTrackChangesScope extends IScope {
  trackModel: any;
  trackName: any;
  trackId?: string | number;
  DeChangeReset?: () => void;
}

function DeTrackChangesDirective(
  DeChangeRegister: IDeChangeRegisterService
): IDirective<IDeTrackChangesScope> {
  return {
    scope: {
      trackModel: '=deTrackChanges',
      trackName: '=deTrackName',
      trackId: '=?deTrackId',
    },
    link: (
      scope: IDeTrackChangesScope,
      elem: IAugmentedJQuery,
      attrs: IAttributes
    ) => {
      const trackId = scope.trackId !== undefined ? scope.trackId : scope.$id;

      // Register tracking with DeChangeRegister
      DeChangeRegister.registerTracking(
        scope.trackName,
        trackId,
        scope.trackModel,
        scope
      );

      // Watch for changes on trackModel
      scope.$watch(
        'trackModel',
        (newVal: any, oldVal: any) => {
          if (DeChangeRegister.trackChanges(scope.trackName, trackId, newVal)) {
            elem.addClass('data-changed');
          } else {
            elem.removeClass('data-changed');
          }
        },
        true
      );

      // Add DeChangeReset method to scope
      scope.DeChangeReset = () => {
        elem.removeClass('data-changed');
      };
    },
  };
}

DeTrackChangesDirective.$inject = ['DeChangeRegister'];

export default DeTrackChangesDirective;
