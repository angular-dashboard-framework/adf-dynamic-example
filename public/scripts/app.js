/*
 * The MIT License
 *
 * Copyright (c) 2014, Sebastian Sdorra
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

angular.module('adfDynamicSample', [
    'adf', 'ngRoute', 'adf.structures.base',
    'adf.widget.clock', 'adf.widget.github', 'adf.widget.iframe',
    'adf.widget.linklist', 'adf.widget.markdown', 'adf.widget.news',
    'adf.widget.randommsg', 'adf.widget.version', 'adf.widget.weather'
  ])
  .config(function($routeProvider){
    $routeProvider
      .when('/boards', {
        templateUrl: 'partials/default.html'
      })
      .when('/boards/:id', {
        controller: 'dashboardCtrl',
        controllerAs: 'dashboard',
        templateUrl: 'partials/dashboard.html',
        resolve: {
          data: function($route, storeService){
            return storeService.get($route.current.params.id);
          }
        }
      })
      .otherwise({
        redirectTo: '/boards'
      });
  })
  .service('storeService', function($http, $q){
    return {
      getAll: function(){
        var deferred = $q.defer();
        $http.get('/v1/store')
          .success(function(data){
            deferred.resolve(data.dashboards);
          })
          .error(function(){
            deferred.reject();
          });
        return deferred.promise;
      },
      get: function(id){
        var deferred = $q.defer();
        $http.get('/v1/store/' + id)
          .success(function(data){
            deferred.resolve(data);
          })
          .error(function(){
            deferred.reject();
          });
        return deferred.promise;
      },
      set: function(id, data){
        var deferred = $q.defer();
        $http.post('/v1/store/' + id, data)
          .success(function(data){
            deferred.resolve();
          })
          .error(function(){
            deferred.reject();
          });
        return deferred.promise;
      },
      delete: function(id){
        var deferred = $q.defer();
        $http.delete('/v1/store/' + id)
          .success(function(data){
            deferred.resolve(data);
          })
          .error(function(){
            deferred.reject();
          });
        return deferred.promise;
      }
    };
  })
  .controller('navigationCtrl', function($scope, $q, $location, storeService){
    var nav = this;
    nav.navCollapsed = true;

    this.toggleNav = function(){
      nav.navCollapsed = ! nav.navCollapsed;
    };

    this.navClass = function(page) {
      var currentRoute = $location.path().substring(1);
      return page === currentRoute || new RegExp(page).test(currentRoute) ? 'active' : '';
    };

    this.create = function(){
      var id = '_' + new Date().getTime();
      var q = storeService.set(id, {
        "title": "New Sample",
        "structure": "4-8",
        "rows": [{
          "columns": [{
            "styleClass": "col-md-4",
            "widgets": []
          },{
            "styleClass": "col-md-8",
            "widgets": []
          }]
        }]
      });

      $q.all([q, storeService.getAll()]).then(function(values){
        nav.items = values[1];
      });
    };

    storeService.getAll().then(function(data){
      nav.items = data;
    });

    $scope.$on('navChanged', function(){
      storeService.getAll().then(function(data){
        nav.items = data;
      });
    });
  })
  .controller('dashboardCtrl', function($location, $rootScope, $scope, $routeParams, storeService, data){
    this.name = $routeParams.id;
    this.model = data;

    this.delete = function(id){
      storeService.delete(id);
      $location.path('/');
      $rootScope.$broadcast('navChanged');
    };

    $scope.$on('adfDashboardChanged', function(event, name, model) {
      storeService.set(name, model);
    });
  });
