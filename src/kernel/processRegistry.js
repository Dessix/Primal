"use strict";
var ProcessRegistry = (function () {
    function ProcessRegistry() {
    }
    ProcessRegistry.register = function (className, constructor) {
        ProcessRegistry.registry.set(className, constructor);
        ProcessRegistry.inverseRegistry.set(constructor, className);
    };
    ProcessRegistry.fetch = function (className) {
        return ProcessRegistry.registry.get(className);
    };
    ProcessRegistry.fetchClassNameFor = function (constructor) {
        return ProcessRegistry.inverseRegistry.get(constructor);
    };
    ProcessRegistry.registry = new Map();
    ProcessRegistry.inverseRegistry = new Map();
    return ProcessRegistry;
}());
exports.ProcessRegistry = ProcessRegistry;
