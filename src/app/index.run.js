(function() {
  'use strict';

  angular
    .module('tescoControlWeb')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
