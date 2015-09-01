var RevenueForecastHelper = (function () {
    function RevenueForecastHelper() { }

    function ProbabilityCategory(from, to, caption, order) {
        this.from = from;
        this.to = to;
        this.caption = caption;
    }

    RevenueForecastHelper.prototype.metrics = ko.observableArray([
        new RevenueForecastMetric("demand", "Demand FTE"),
        new RevenueForecastMetric("supply", "Supply FTE"),
        new RevenueForecastMetric("gap", "Gap FTE")
    ]);

    RevenueForecastHelper.prototype.probabilityCategories = [
        new ProbabilityCategory(100, 100, "100%"),
        new ProbabilityCategory(90, 99, "90...99%"),
        new ProbabilityCategory(80, 89, "80...89%"),
        new ProbabilityCategory(70, 79, "70...79%"),
        new ProbabilityCategory(60, 69, "60...69%"),
        new ProbabilityCategory(50, 59, "50...59%")
    ];

    RevenueForecastHelper.prototype.getProbabilityCategoryCaption = function (probability) {
        for (var i = 0; i < this.probabilityCategories.length; i++) {
            var category = this.probabilityCategories[i];
            if (probability >= category.from && probability <= category.to) {
                return category.caption;
            }
        }
        return undefined;
    }

    RevenueForecastHelper.prototype.treeFromFlat = function (flatData) {
        var self = this;
        var nodeRoot = new RevenueForecastNode("Total", 0, []);
        var grouppedByProbCategory = _.groupBy(flatData, function (item) {
            return self.getProbabilityCategoryCaption(item.opportunity.probability);
        });

        for (var keyProbability in grouppedByProbCategory) {

            if (grouppedByProbCategory.hasOwnProperty(keyProbability)) {
                // skip rows with probability value which fall
                // in probability categories we are not interested in
                if (keyProbability === "undefined") {
                    continue;
                }

                var nodeProbability = new RevenueForecastNode(keyProbability, 1, []);
                nodeRoot.children().push(nodeProbability);
                var groupProbability = grouppedByProbCategory[keyProbability];
                var grouppedByAccount = _.groupBy(groupProbability, function (item) {
                    return item.account.name;
                });

                for (var keyAccount in grouppedByAccount) {
                    if (grouppedByAccount.hasOwnProperty(keyAccount)) {
                        var nodeAccount = new RevenueForecastNode(keyAccount, 2, []);
                        nodeProbability.children().push(nodeAccount);

                        var groupAccount = grouppedByAccount[keyAccount];
                        for (var i = 0; i < groupAccount.length; i++) {
                            var opportunity = groupAccount[i];
                            var nodeOpportunity =
                                new RevenueForecastNode(
                                    opportunity.opportunity.name,
                                    3,
                                    [],
                                    opportunity.data.demand,
                                    opportunity.data.supply,
                                    opportunity.opportunity.id,
                                    opportunity.opportunity.probability
                                );
                            nodeAccount.children().push(nodeOpportunity);
                        }
                        nodeAccount.children(nodeAccount.children().sort(function (left, right) { return left.name() > right.name() }));
                    }
                }
                nodeProbability.children(nodeProbability.children().sort(function (left, right) {
                    return left.name() > right.name();
                }));
            }
            nodeRoot.children(nodeRoot.children().sort(function (left, right) {
                return left.name() < right.name();
            }));
        }
        return [nodeRoot];
    }

    RevenueForecastHelper.prototype.valueByPath = function (obj, path) {
        for (var i = 0, path = path.split("."), len = path.length; i < len; i++) {
            if ($.isArray(obj[path[i]])) {
                obj = obj[path[i]][path[i + 1]];
                i++;

            } else {
                obj = obj[path[i]];
            }
        };
        return obj;
    };

    return RevenueForecastHelper;
}).call();