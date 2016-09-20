function moveTo(firstArg, secondArg, opts) {
    if (!this.my) {
        return C.ERR_NOT_OWNER;
    }
    if (this.spawning) {
        return C.ERR_BUSY;
    }
    if (data(this.id).fatigue > 0) {
        return C.ERR_TIRED;
    }
    if (this.getActiveBodyparts(C.MOVE) == 0) {
        return C.ERR_NO_BODYPART;
    }

    var _utils$fetchXYArgumen = utils.fetchXYArguments(firstArg, secondArg, globals);

    var _utils$fetchXYArgumen2 = _slicedToArray(_utils$fetchXYArgumen, 3);

    var x = _utils$fetchXYArgumen2[0];
    var y = _utils$fetchXYArgumen2[1];
    var roomName = _utils$fetchXYArgumen2[2];

    roomName = roomName || this.pos.roomName;
    if (_.isUndefined(x) || _.isUndefined(y)) {
        register.assertTargetObject(firstArg);
        return C.ERR_INVALID_TARGET;
    }

    var targetPos = new globals.RoomPosition(x, y, roomName);

    if (_.isObject(firstArg)) {
        opts = _.clone(secondArg);
    }
    opts = opts || {};

    if (_.isUndefined(opts.reusePath)) {
        opts.reusePath = 5;
    }
    if (_.isUndefined(opts.serializeMemory)) {
        opts.serializeMemory = true;
    }

    if (x == this.pos.x && y == this.pos.y && roomName == this.pos.roomName) {
        return C.OK;
    }

    if (opts.reusePath && this.memory && _.isObject(this.memory) && this.memory._move) {

        var _move = this.memory._move;

        if (runtimeData.time > _move.time + parseInt(opts.reusePath) || _move.room != this.pos.roomName) {
            delete this.memory._move;
        } else if (_move.dest.room == roomName && _move.dest.x == x && _move.dest.y == y) {

            var path = _.isString(_move.path) ? utils.deserializePath(_move.path) : _move.path;

            var idx = _.findIndex(path, { x: this.pos.x, y: this.pos.y });
            if (idx != -1) {
                var oldMove = _.cloneDeep(_move);
                path.splice(0, idx + 1);
                try {
                    _move.path = opts.serializeMemory ? utils.serializePath(path) : path;
                } catch (e) {
                    console.log('$ERR', this.pos, x, y, roomName, JSON.stringify(path), '-----', JSON.stringify(oldMove));
                    throw e;
                }
            }
            if (path.length == 0) {
                return this.pos.isNearTo(targetPos) ? C.OK : C.ERR_NO_PATH;
            }
            var result = this.moveByPath(path);

            if (result == C.OK) {
                return C.OK;
            }
        }
    }

    if (opts.noPathFinding) {
        return C.ERR_NOT_FOUND;
    }

    var path = this.pos.findPathTo(targetPos, opts);

    if (opts.reusePath && this.memory && _.isObject(this.memory)) {
        this.memory._move = {
            dest: { x, y, room: roomName },
            time: runtimeData.time,
            path: opts.serializeMemory ? utils.serializePath(path) : _.clone(path),
            room: this.pos.roomName
        };
    }

    if (path.length == 0) {
        return C.ERR_NO_PATH;
    }
    this.move(path[0].direction);
    return C.OK;
}