var myapp = angular.module("eplApp",['ui.router']);

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
  var header = true;
  var singleMatch;




  // public API
  return {
  	getsingleMatch : function() {
  		return singleMatch;
  	},
  	setsingleMatch : function(value) {
  		singleMatch = value;
  	},
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

	self.saveData = function(index) {
		var value = self.matchWeeks[(self.weekSelect-1)].matches[index];
		dataService.setsingleMatch(value);
	}
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

myapp.controller('summaryController',["$rootScope","dataService", function($rootScope,dataService){
	var self = this;
	self.imgsrc = "img/2016summary.jpg";
	self.heading = "Chelsea won their fifth Premier League title, and sixth English title, with two matches to spare following a 1–0 away win over West Bromwich Albion on 12 May."
	self.details = ["The 2016/17 season marks the 25th of the Premier League after its formation in 1992. After numerous discussions with football authorities, players and television broadcasters, the First Division clubs resigned from the Football League in May 1992 and the Premier League was formed with the inaugural campaign starting on Saturday 15 August of that year. Below, each of the 24 seasons has been charted with the story of how the titles were won and the players who starred. From 2011/12's incredible finale, to Arsenal's Invincibles, as well as each of Manchester United's record 13 triumphs, find out more about the rich history of the Premier League. ", "In the opening season of 1992/93, 22 clubs competed in the competition, with Brian Deane of Sheffield United scoring the first goal in what was known at the time as the FA Premier League. The inaugural members of the Premier League were: Arsenal, Aston Villa, Blackburn Rovers, Chelsea, Coventry City, Crystal Palace, Everton, Ipswich Town, Leeds United, Liverpool, Manchester City, Manchester United, Middlesbrough, Norwich City, Nottingham Forest, Oldham Athletic, Queens Park Rangers, Sheffield Utd, Sheffield Wednesday, Southampton, Tottenham Hotspur, and Wimbledon.","A total of 47 clubs have played in the Premier League since its inception, with Arsenal, Chelsea, Everton, Liverpool, Man Utd, and Spurs participating in every campaign to date. Brighton & Hove Albion and Huddersfield Town will make that figure 49 when the 2017/18 campaign gets under way in August.","At the end of each season, the bottom three clubs are relegated, with three promoted clubs from the Football League's Championship replacing them. The only exception to this was in the 1994/95 season when the League decided to reduce the number of clubs to 20. As a result, Crystal Palace joined Norwich, Leicester City and Ipswich in being relegated from the Premier League at the end of the 1994/95 season, with only two clubs replacing them from Division One, as the Championship was known then.", "Apart from the opening campaign in 1992/93, every season of the Premier League has had a title sponsor. From the 1993/94 season, England’s top flight was known as the FA Carling Premiership, before the sponsorship changed in 2001 to Barclaycard until 2004.", "There has been an increase in English representation in Europe since the start of the Premier League, when, in the opening season, only the champions qualified for the UEFA Champions League, with the second and third-placed clubs entering the UEFA Cup, as the UEFA Europa League was then known."]; 

	dataService.changeheader(false);
	$rootScope.$broadcast("Callchangeheader", {});

	$rootScope.$on("CallLoadAllData", function(){
		var year = dataService.getyear();
		if (year === "2016/17") {
			self.imgSrc = "img/2016summary.jpg";
			self.heading = "Chelsea won their fifth Premier League title, and sixth English title, with two matches to spare following a 1–0 away win over West Bromwich Albion on 12 May."
			self.details = ["The 2016/17 season marks the 25th of the Premier League after its formation in 1992. After numerous discussions with football authorities, players and television broadcasters, the First Division clubs resigned from the Football League in May 1992 and the Premier League was formed with the inaugural campaign starting on Saturday 15 August of that year. Below, each of the 24 seasons has been charted with the story of how the titles were won and the players who starred. From 2011/12's incredible finale, to Arsenal's Invincibles, as well as each of Manchester United's record 13 triumphs, find out more about the rich history of the Premier League. ", "In the opening season of 1992/93, 22 clubs competed in the competition, with Brian Deane of Sheffield United scoring the first goal in what was known at the time as the FA Premier League. The inaugural members of the Premier League were: Arsenal, Aston Villa, Blackburn Rovers, Chelsea, Coventry City, Crystal Palace, Everton, Ipswich Town, Leeds United, Liverpool, Manchester City, Manchester United, Middlesbrough, Norwich City, Nottingham Forest, Oldham Athletic, Queens Park Rangers, Sheffield Utd, Sheffield Wednesday, Southampton, Tottenham Hotspur, and Wimbledon.","A total of 47 clubs have played in the Premier League since its inception, with Arsenal, Chelsea, Everton, Liverpool, Man Utd, and Spurs participating in every campaign to date. Brighton & Hove Albion and Huddersfield Town will make that figure 49 when the 2017/18 campaign gets under way in August.","At the end of each season, the bottom three clubs are relegated, with three promoted clubs from the Football League's Championship replacing them. The only exception to this was in the 1994/95 season when the League decided to reduce the number of clubs to 20. As a result, Crystal Palace joined Norwich, Leicester City and Ipswich in being relegated from the Premier League at the end of the 1994/95 season, with only two clubs replacing them from Division One, as the Championship was known then.", "Apart from the opening campaign in 1992/93, every season of the Premier League has had a title sponsor. From the 1993/94 season, England’s top flight was known as the FA Carling Premiership, before the sponsorship changed in 2001 to Barclaycard until 2004.", "There has been an increase in English representation in Europe since the start of the Premier League, when, in the opening season, only the champions qualified for the UEFA Champions League, with the second and third-placed clubs entering the UEFA Cup, as the UEFA Europa League was then known."];
		}else {
			self.imgsrc = 'img/2015summary.jpg';
			self.heading = "Foxes go from relegation candidates to champions in 2015/16's fairytale story"
			self.details = ["The 2015/16 Premier League season will surely go down as the most unpredictable and extraordinary in the competition’s history, with Leicester City going from 5,000-1 outsiders to top-flight champions for the first time.", "Nobody expected such an underdog story in the summer when Claudio Ranieri replaced Nigel Pearson as manager of a Leicester team that had been on the brink of relegation before an incredible end-of-season run in 2014/15.", "Ranieris arrival and the additions of N’Golo Kante and Christian Fuchs began to shape what was to follow. They started with a 4-2 victory over Sunderland on the opening day.", "There was much more expectation at reigning champions Chelsea, who had brought in Radamel Falcao and Pedro to bolster their attacking options, while goalkeeper Petr Cech left Stamford Bridge for Arsenal and Raheem Sterling joined Kevin De Bruyne at Manchester City.", "Man City got off to a blistering start, winning 3-0 at West Bromwich Albion in the first of five straight victories to start the campaign.", "Chelseas fortunes were a stark contrast, as defeats to Man City, Everton and Crystal Palace left Jose Mourinho’s side hovering above the relegation zone in September.", "Summer signings continued to make a big impact as Anthony Martial blew Liverpool away with a solo goal in a 2-1 win on his Manchester United debut at Old Trafford and Dimitri Payet helped West Ham United to an opening-day win at Arsenal and similarly impressive away triumphs at Liverpool and Man City.", "Manuel Pellegrinis Man City began to falter and a 4-1 defeat at Tottenham Hotspur, which put Mauricio Pochettinos Spurs into top-four contention at the end of September. Arsenal ended Leicester’s unbeaten start with a 5-2 victory at the King Power Stadium on the same day. But Leicester recovered, inspired by the form of Jamie Vardy and Riyad Mahrez. Vardy set a record of scoring in 11 successive PL matches when he beat former Man Utd striker Ruud van Nistelrooy’s 10-match run in a 1-1 draw against the Red Devils. A 2-1 victory over Chelsea, sealed by a superb effort from Mahrez, put the Foxes top after 16 matches and left the Blues in 16th. That result and home defeats to Southampton and top-flight debutants AFC Bournemouth, as well as a 3-1 loss that was Jurgen Klopp’s first win since replacing Brendan Rodgers as Liverpool manager, meant Mourinho was relieved of his duties.","But the season belonged to Leicester, with manager Ranieri and his players given a guard of honour as they finished the season with a draw at Chelsea, the Italian's former club and the previous champions."];
		}
	});
}])

myapp.controller('singleMatchController', ["dataService", function(dataService){
	var self = this;
	self.match = dataService.getsingleMatch();
	
}])
