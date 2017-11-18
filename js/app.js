var myapp = angular.module("eplApp",['ui.router','bootstrap']);

myapp.filter('range', function() {
	return function(input, min, max) {
    min = parseInt(min); //Make string input int
    max = parseInt(max);
    for (var i=min; i<max; i++)
    	input.push(i);
    return input;
};
});

myapp.service('dataService', function() {

  // private variable
  var year = "2016/17";
  var self = this;
  var header = true;



  // public API
  return {
  	changeheader : function(newvalue) {
  		header = newvalue;
  	},
  	getchangeheader : function(){
  		return header;
  	},
  	getyear: function (){
  		return year;
  	},
  	setyear: function(value) {
  		year = value;
  	}
  };
});



myapp.service('ArrayManipulationForTable', function() {

	var tableData;
	this.manipulation= function(matchWeeks, untillWeek){

		tableData = [];

		var loopBreak = 0;
		
		matchWeeks[0].matches.forEach(function(match){
			tableData.push({"name" : match.team1.name, "MP" : 0, "W" : 0, "D" : 0, "L" : 0, "F" : 0, "A" : 0, "GD" : 0, "P" : 0});
			tableData.push({"name" : match.team2.name, "MP" : 0, "W" : 0, "D" : 0, "L" : 0, "F" : 0, "A" : 0, "GD" : 0, "P" : 0});
		});

		matchWeeks.forEach(function(week) {
			loopBreak += 1;
			if (loopBreak > untillWeek){ return 0;};

			week.matches.forEach(function(match){
				if (match.score1 > match.score2) {
					for(team in tableData){
						if (tableData[team].name === match.team1.name){ 
							tableData[team].MP += 1;
							tableData[team].W += 1;
							tableData[team].F += match.score1;
							tableData[team].A += match.score2;
							tableData[team].GD = (tableData[team].F - tableData[team].A);
							tableData[team].P += 3;
						}
						if (tableData[team].name === match.team2.name){ 
							tableData[team].MP += 1;
							tableData[team].L += 1;
							tableData[team].F += match.score2;
							tableData[team].A += match.score1;
							tableData[team].GD = (tableData[team].F - tableData[team].A);
						}
					};
				}else if (match.score1 < match.score2){
					for(team in tableData){
						if (tableData[team].name === match.team2.name){ 
							tableData[team].MP += 1;
							tableData[team].W += 1;
							tableData[team].F += match.score2;
							tableData[team].A += match.score1;
							tableData[team].GD = (tableData[team].F - tableData[team].A);
							tableData[team].P += 3;
						}
						if (tableData[team].name === match.team1.name){ 
							tableData[team].MP += 1;
							tableData[team].L += 1;
							tableData[team].F += match.score1;
							tableData[team].A += match.score2;
							tableData[team].GD = (tableData[team].F - tableData[team].A);
						}
					};
				}else if (match.score1 == match.score2){
					for(team in tableData){
						if (tableData[team].name === match.team2.name){ 
							tableData[team].MP += 1;
							tableData[team].D += 1;
							tableData[team].F += match.score2;
							tableData[team].A += match.score1;
							tableData[team].GD = (tableData[team].F - tableData[team].A);
							tableData[team].P += 1;
						}
						if (tableData[team].name === match.team1.name){ 
							tableData[team].MP += 1;
							tableData[team].D += 1;
							tableData[team].F += match.score1;
							tableData[team].A += match.score2;
							tableData[team].GD = (tableData[team].F - tableData[team].A);
							tableData[team].P += 1;
						}
					};
				}
			});
		});

		return tableData;

	}
});

myapp.controller("yearController",["dataService","$rootScope", function(dataService, $rootScope){
	var self = this;
	self.year = "2016/17";
	self.change = function(){
		dataService.setyear(self.year);
		$rootScope.$broadcast("CallLoadAllData", {});
	}
	
	self.header = dataService.getchangeheader();
	self.headerYear = dataService.getyear();

	$rootScope.$on("CallLoadAllData", function(){
		self.headerYear = dataService.getyear();
	});
	
	$rootScope.$on("Callchangeheader", function(){
		self.header = dataService.getchangeheader();
	});
}]);

myapp.directive("tooltips"[function(){
	return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.tooltip();
        }
    };
}])

myapp.directive("carousels"[function(){
	return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.carousel();
        }
    };
}])

myapp.controller("homeController",["dataService", "$rootScope", function(dataService,$rootScope){
	dataService.changeheader(true);
	$rootScope.$broadcast("Callchangeheader", {});
}]);

myapp.controller("matchesController",["$http", "dataService", "$rootScope", function($http,dataService,$rootScope){
	var self = this;
	self.matchWeeks = [];
	self.weekSelect = 38;
	self.year = dataService.getyear;

	dataService.changeheader(false);
	$rootScope.$broadcast("Callchangeheader", {});

	self.loadAllData = function(){

		if (self.year()==="2015/16") {
			self.baseurl="https://raw.githubusercontent.com/openfootball/football.json/master/2015-16/en.1.json";
		}else{
			self.baseurl = "https://raw.githubusercontent.com/openfootball/football.json/master/2016-17/en.1.json";
		}

		$http({
			method:"GET",
			url: self.baseurl
		}).then(function successCallback(response){
          // this callback will be called asynchronously
          // when the response is available
          self.matchWeeks = response.data.rounds;
      }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          alert("some error occurred. Check the console.");
          console.log(response);

      });
	}

	$rootScope.$on("CallLoadAllData", function(){
		self.loadAllData();
	});
}]);


myapp.controller("tableController",["$http", "dataService", "$rootScope", "ArrayManipulationForTable", function($http,dataService,$rootScope,ArrayManipulationForTable){
	var self = this;
	self.matchWeeks = [];
	self.weekSelect = 38;
	self.year = dataService.getyear;
	self.teamArray= [];

	dataService.changeheader(false);
	$rootScope.$broadcast("Callchangeheader", {});
	self.loadAllData = function(){

		if (self.year()==="2015/16") {
			self.baseurl="https://raw.githubusercontent.com/openfootball/football.json/master/2015-16/en.1.json";
		}else{
			self.baseurl = "https://raw.githubusercontent.com/openfootball/football.json/master/2016-17/en.1.json";
		}
		$http({
			method:"GET",
			url: self.baseurl
		}).then(function successCallback(response){
          // this callback will be called asynchronously
          // when the response is available
          self.matchWeeks = response.data.rounds;
          self.teamArray = ArrayManipulationForTable.manipulation(self.matchWeeks,self.weekSelect);
      }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          alert("some error occurred. Check the console.");
          console.log(response);

      });
	}

	self.callManipulation = function () {
		self.teamArray = ArrayManipulationForTable.manipulation(self.matchWeeks,self.weekSelect);
		return 0;
	}

	$rootScope.$on("CallLoadAllData", function(){
		self.loadAllData();
	});
}]);

myapp.controller('teamController',["dataService","$rootScope", function(dataService,$rootScope){
	var self = this;

	dataService.changeheader(false);
	$rootScope.$broadcast("Callchangeheader", {});
	self.teams = [
	{
		name : "Manchester United",
		imgSrc : "img/teamLogo/manchester-united.png"
	},
	{
		name : "Tottenham Hotspur",
		imgSrc : "img/teamLogo/tottenham-hotspur.png"
	},
	{
		name : "Bournemouth",
		imgSrc : "img/teamLogo/afc-bournemouth.png"
	},
	{
		name : "Aston Villa",
		imgSrc : "img/teamLogo/aston-villa.png"
	},
	{
		name : "Everton",
		imgSrc : "img/teamLogo/everton-fc-logo1.png"
	},
	{
		name : "Watford",
		imgSrc : "img/teamLogo/watford-fc.png"
	},
	{
		name : "Leicester City",
		imgSrc : "img/teamLogo/leicester-city-fc-hd-logo.png"
	},
	{
		name : "Sunderland",
		imgSrc : "img/teamLogo/sunderland.png"
	},
	{
		name : "Norwich",
		imgSrc : "img/teamLogo/norwich-city.png"
	},
	{
		name : "Crystal Palace",
		imgSrc : "img/teamLogo/crystal-palace-fc.png"
	},
	{
		name : "Chelsea",
		imgSrc : "img/teamLogo/chelsea.png"
	},
	{
		name : "Swansea",
		imgSrc : "img/teamLogo/swansea-city-afc.png"
	},
	{
		name : "Arsenal",
		imgSrc : "img/teamLogo/arsenal.png"
	},
	{
		name : "West Ham United",
		imgSrc : "img/teamLogo/west-ham.png"
	},
	{
		name : "Newcastle United",
		imgSrc : "img/teamLogo/newcastle-united.png"
	},
	{
		name : "Southampton",
		imgSrc : "img/teamLogo/southampton-fc.png"
	},
	{
		name: "Stoke City",
		imgSrc : "img/teamLogo/stoke-city.png"
	},
	{
		name : "West Bromwich Albion",
		imgSrc : "img/teamLogo/west-bromwich-albion-hd-logo.png"
	},
	{
		name : "Liverpool",
		imgSrc : "img/teamLogo/liverpool.png"
	},
	{
		name : "Manchester City",
		imgSrc : "img/teamLogo/manchester-city-new-hd-logo1.png"
	}
	];
}])

