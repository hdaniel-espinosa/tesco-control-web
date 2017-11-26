(function() {
  'use strict';

  angular
    .module('tescoControlWeb')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main'
      })
      .state('index', {
        abstract: true,
        url: "/index",
        templateUrl: "app/components/common/content.html"
      })
      .state('index.usuario-sistema', {
        url: '/usuario-sistema',
        templateUrl: 'app/usuario-sistema/usuario-sistema.html'
      });

    $urlRouterProvider.otherwise('/');
  }

})();
