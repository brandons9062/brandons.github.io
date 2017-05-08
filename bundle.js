'use strict';

angular.module('myApp', ['ui.router']).config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {

    $stateProvider.state('home', {
        url: '/',
        templateUrl: './app/routes/home/homeTmpl.html',
        controller: 'findAndFightCtrl'
    }).state('seePrey', {
        url: '/seePrey',
        templateUrl: './app/routes/seePrey/seePreyTmpl.html',
        controller: 'seePreyCtrl'
    }).state('hunt', {
        url: '/hunt',
        templateUrl: './app/routes/hunt/huntTmpl.html',
        controller: 'huntCtrl'
    });

    $urlRouterProvider.otherwise('/');
}]);
'use strict';

angular.module('myApp').service('pokemonService', ["$http", function ($http) {

    this.getPokemonInfo = function (id) {
        return $http({
            method: 'GET',
            url: "https://pokeapi.co/api/v2/pokemon/" + id
        });
    };
    var service = this;
    this.pokemonInfo = [];
    this.pokemonToFight;
    service.canHunt = false;

    this.getPokemon = function (level) {
        service.pokemonInfo = [];
        service.fighter.won = false;
        if (!level) {
            var fighterLevel = 1;
            var lowPokeLevel = 1;
            var highPokeLevel = 5;
        } else if (level < 10) {
            fighterLevel = level;
            lowPokeLevel = fighterLevel - (fighterLevel - 1);
            highPokeLevel = fighterLevel + 5;
        } else {
            fighterLevel = level;
            lowPokeLevel = fighterLevel - 5;
            highPokeLevel = fighterLevel + 5;
        };
        for (var i = 0; i < 10; i++) {
            service.getPokemonInfo(Math.floor(Math.random() * 600 + 1)).then(function (response) {

                response.data.level = Math.floor(Math.random() * highPokeLevel + lowPokeLevel);

                response.data.attackPower = 10 + Math.ceil(10 * (response.data.level / 5 + 1));

                response.data.health = Math.ceil(response.data.stats[5].base_stat * (response.data.level / 10) + 1);
                response.data.fullHealth = response.data.health;

                response.data.index = i;

                service.pokemonInfo.push(response.data);

                service.pokemonToFight = service.pokemonInfo[Math.floor(Math.random() * service.pokemonInfo.length + 1)];
                console.log(service.pokemonToFight);
                console.log(service.pokemonInfo.length);

                if (service.pokemonInfo.length == 10) {
                    service.canHunt = true;
                }
            });
        }
    };

    var Fighter = function Fighter(name) {
        this.name = name;
        this.level = 1;
        this.experience = 0;
        this.experienceNeeded = 500;
        this.fullHealth = 40;
        this.health = 40;
        this.won = false;
        this.lost = false;
        this.attackPower = 10;
        this.takeDamage = function () {
            var damage = service.pokemonToFight.attackPower;
            if (this.health - damage <= 0) {
                this.health = 0;
                this.lost = true;
            } else {
                this.health -= damage;
            }
        };
        this.gainExperience = function () {
            if (this.won) {
                this.experience = this.experience + service.pokemonToFight.level * 200;
                for (var i = 0; i < 1; i++) {
                    if (this.experience >= this.experienceNeeded) {
                        this.level += 1;
                        this.experience = this.experience - this.experienceNeeded;
                        this.experienceNeeded *= 2;
                        this.fullHealth = Math.ceil(this.fullHealth * (this.level / 5 + 1));
                        this.health = this.fullHealth;
                        i = 0;
                        this.attackPower += Math.ceil(this.attackPower * (this.level / 5 + 1));
                    }
                }
                this.won = false;
            }
        };
    };
    this.createFighter = function (name) {
        if (name) {
            service.fighter = new Fighter(name);
            service.getPokemon(service.fighter.level);
        } else {
            alert("GIVE YOUR HUNTER A NAME YA SLOWPOKE!");
        }
    };

    this.attack = function () {
        var criticalChance = Math.floor(Math.random() * 10 + 1);
        var critical = 1;

        var pokemonHealthAfterDamage = service.pokemonToFight.health - service.fighter.attackPower * critical;

        if (criticalChance == 10) {
            critical = 2;
        }
        var dodge = Math.floor(Math.random() * 20 + 1);
        var fighterHealthAfterDamage = service.pokemonToFight.health - service.fighter.attackPower;

        if (pokemonHealthAfterDamage > 0) {
            service.pokemonToFight.health = pokemonHealthAfterDamage;
            console.log(service.pokemonToFight.health);
            service.fighter.takeDamage();
            if (service.fighter.lost === true) {
                alert("You underestimated your prey and now you're dead. Don't make the same mistake next time!");
                service.fighter.lost = false;
            }
        } else {
            service.pokemonToFight.health = 0;
            service.fighter.won = true;
            service.fighter.gainExperience(service.pokemonToFight.index);
        }
    };
}]);
'use strict';

angular.module('myApp').directive('deadPokemon', function () {
    return {
        restrict: 'A',
        template: template
    };
});
'use strict';

angular.module('myApp').directive('navBar', function () {
    return {
        restrict: 'E',
        templateUrl: './app/routes/home/navBar.html',
        controller: ["$scope", "pokemonService", function ($scope, pokemonService) {

            var checkHunt = setInterval(function () {
                if (pokemonService.canHunt === true) {
                    $scope.canHunt = true;
                    $scope.$apply();
                    clearInterval(checkHunt);
                    console.log($scope.canHunt);
                } else {
                    $scope.canHunt = false;
                }
            }, 500);
        }]
    };
});
'use strict';

angular.module('myApp').controller('huntCtrl', ["$scope", "pokemonService", function ($scope, pokemonService) {

    $scope.pokemonInfo = pokemonService.pokemonInfo;
    $scope.fighter = pokemonService.fighter;

    $scope.pokemonToFight = pokemonService.pokemonToFight;
    $scope.attack = pokemonService.attack;

    $scope.getPokemon = pokemonService.getPokemon;
}]);
'use strict';

angular.module('myApp').controller('findAndFightCtrl', ["$scope", "pokemonService", function ($scope, pokemonService) {

    $scope.pokemonInfo = pokemonService.pokemonInfo;

    $scope.goToSeePrey = 'hunt';
    $scope.createFighter = function (name) {
        var name = name;
        pokemonService.createFighter(name);
    };
}]);
'use strict';

angular.module('myApp').controller('seePreyCtrl', ["$scope", "pokemonService", function ($scope, pokemonService) {

    $scope.pokemonInfo = pokemonService.pokemonInfo;
}]);