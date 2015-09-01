var RevenueForecastNode = (function () {

    function RevenueForecastNode(name, level, children, demand, supply, id, probability) {
        var self = this;

        self.name = ko.observable(name);
        self.level = ko.observable(level);
        self.children = ko.observableArray(children || []);
        self.demand = ko.observableArray(demand || []);
        self.supply = ko.observableArray(supply || []);
        self.id = id;
        self.probability = probability;

        self.gap = ko.computed(function () {
            var gapValues = [];
            _.forEach(self.demand(), function (item, index) {
                gapValues.push(item - self.supply()[index]);
            });
            return gapValues;
        });
        
        self.table = ko.computed(function () {
            var resultMetrics = [];
            _.each(self.metrics()(), function(metric) {
                var metricComptutedValues = self.SumRootChidlrenArrays(self, [0, 0, 0, 0, 0, 0], metric.name);
                resultMetrics.push(new RevenueForecastComputedMetric(metric.name, metric.caption, metricComptutedValues));
            });
            return resultMetrics;
        });

        self.isExpanded = ko.observable(true);

        self.isCollapsed = ko.computed(function () {
            return !self.isExpanded();
        });

        self.isRoot = ko.pureComputed(function () {
            return self.level() === 0;
        });

        self.isLeaf = ko.pureComputed(function () {
            return !self.children().length;
        });

        self.toggleImage = ko.pureComputed(function () {
            return self.isExpanded() ?
                "glyphicon glyphicon-triangle-bottom" :
                "glyphicon glyphicon-triangle-right";
        });

        self.includedInTotals = ko.observable(true);
        self.toggleIncludedInTotals = function (item, event, state) {
            var newState = state || !self.includedInTotals();
            self.includedInTotals(newState);
            _.each(self.children(), function(child) {
                child.toggleIncludedInTotals(item, event, newState);
            });
        };

        self.includedInTotalsText = ko.pureComputed(function() {
            return self.includedInTotals() ?
                "exclude from totals" :
                "include in totals";
        });
    }

    RevenueForecastNode.prototype.SumRootChidlrenArrays = function (tree, resultArray, propertyName) {
        if (tree.children().length === 0) {
            return tree[propertyName]();
        }

        for (var i = 0; i < tree.children().length; i++) {
            var child = tree.children()[i];
            if (!child.includedInTotals()) continue;
            for (var j = 0; j < child[propertyName]().length; j++) {
                var demandValue = child[propertyName]()[j];
                resultArray[j] += demandValue;
            }
            this.SumRootChidlrenArrays(child, resultArray, propertyName);
        }
        return resultArray;
    }

    RevenueForecastNode.prototype.expandChildren = function () {
        this.isExpanded(true);
        _.each(this.children(), function(item) {
            item.expandChildren();
        });
    };

    RevenueForecastNode.prototype.collapseChildren = function () {
        this.isExpanded(false);
        _.each(this.children(), function (item) {
            item.collapseChildren();
        });
    };

    RevenueForecastNode.prototype.groupCaptionIndention = function() {
        return this.level() + "em";
    };

    RevenueForecastNode.prototype.toggleOpen = function () {
        this.isExpanded(!this.isExpanded());
    }

    RevenueForecastNode.prototype.metrics = ko.computed(function() {
        return new RevenueForecastHelper().metrics;
    });

    return RevenueForecastNode;
}).call();