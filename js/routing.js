myapp.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home');

    $stateProvider

        // HOME STATES
        .state('home', {
            url: '/home',
            templateUrl: 'view/homepage.html',
            controller: "homeController",
            controllerAs: "myhome"
        })

        .state('matches', {
            url: '/matches',
            templateUrl: 'view/matches.html',
            controller: "matchesController",
            controllerAs : "myMatches"
        })

        .state('table', {
            url: '/table',
            templateUrl: 'view/table.html',
            controller: "tableController",
            controllerAs : "myTable"
        })

        .state('teams', {
            url: '/teams',
            templateUrl: 'view/teams.html',
            controller: "teamController",
            controllerAs : "myTeams"
        })

        .state('summary',{
            url: '/summary',
            templateUrl: 'view/summary.html',
            controller: 'summaryController',
            controllerAs: 'mySummary'

        })
}]);