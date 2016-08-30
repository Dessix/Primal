"use strict";
var processRegistry_1 = require("./processRegistry");
(function (ProcessStatus) {
    ProcessStatus[ProcessStatus["TERM"] = -2] = "TERM";
    ProcessStatus[ProcessStatus["EXIT"] = -1] = "EXIT";
    ProcessStatus[ProcessStatus["RUN"] = 0] = "RUN";
})(exports.ProcessStatus || (exports.ProcessStatus = {}));
var ProcessStatus = exports.ProcessStatus;
var Process = (function () {
    function Process(pid, parentPid) {
        this.frequency = 1;
        this.status = ProcessStatus.RUN;
        this.pid = pid;
        this.parentPid = parentPid;
    }
    Object.defineProperty(Process.prototype, "kernelOrThrow", {
        get: function () {
            if (this.kernel === null) {
                throw new Error("Kernel not available!");
            }
            return this.kernel;
        },
        enumerable: true,
        configurable: true
    });
    Process.prototype.spawnChildProcess = function (processCtor) {
        var childPid = this.kernelOrThrow.spawnProcessLive(processCtor, this.pid);
        if (this.spawnedChildren === undefined) {
            this.spawnedChildren = [];
        }
        this.spawnedChildren.push(childPid);
        return childPid;
    };
    Process.Register = function (className, processCtor) {
        processRegistry_1.ProcessRegistry.register(className, processCtor);
    };
    Process.prototype.reloadFromMemory = function (processMemory) {
    };
    ;
    return Process;
}());
exports.Process = Process;
