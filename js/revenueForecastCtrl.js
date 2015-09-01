var RevenueForecastCtrl = (function () {
    function RevenueForecastCtrl() { }

    RevenueForecastCtrl.prototype.getJsonMockup = function (monthCount) {
        var accounts = ["Skype", "Allocine", "HP"];
        var opportunities = ["Front End", "Back End", "Automation"];
        var accountIdPrefix = "AccId";
        var opportunityIdPrefix = "OppId";
        monthCount = monthCount || 6;
        var models = [];

        for (var i = 0; i < accounts.length * opportunities.length; i++) {
            var model = {};
            var accountIndex = Math.floor(i / accounts.length);
            var opportunityIndex = i % opportunities.length;
            model.account = {
                id: accountIdPrefix + i,
                name: accounts[accountIndex]
            };
            model.opportunity = {
                id: model.account.id + opportunityIdPrefix + opportunityIndex,
                name: model.account.name + " " + opportunities[opportunityIndex],
                probability: i % 3 ? 85 : 91
            };

            model.data = {
                demand: [],
                supply: []
            };

            for (var j = 0; j < monthCount; j++) {
                model.data.demand[j] = Math.floor((Math.random() * 10) + 1);
                model.data.supply[j] = Math.floor((Math.random() * 10) + 1);
            }
            models.push(model);
        }
        return JSON.stringify(models);
    };

    return RevenueForecastCtrl;
}).call();