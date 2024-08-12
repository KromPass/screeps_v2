"use strict";
const settings = require("../config/settings");
const u = require("./utils");
const rU = {
    // Delete Spawn memory for spawns that no longer exist
    removeOldRoomMemory: function () {
        for (const spawnName in Memory.spawns) {
            if (!Game.spawns[spawnName]) {
                delete Memory.spawns[spawnName];
            }
        }
    },
    isOnEdge: function (pos) {
        return pos.x == 0 || pos.x == 49 || pos.y == 0 || pos.y == 49;
    },
    isNearEdge: function (pos) {
        return pos.x <= 1 || pos.x >= 48 || pos.y <= 1 || pos.y >= 48;
    },
    getWithdrawLocations: function (creep) {
        const city = creep.memory.city;
        const spawn = Game.spawns[city];
        const structures = spawn.room.find(FIND_STRUCTURES);
        return _.filter(structures, structure => structure.structureType == STRUCTURE_CONTAINER ||
            structure.structureType == STRUCTURE_STORAGE ||
            structure.structureType == STRUCTURE_TERMINAL ||
            structure.structureType == STRUCTURE_SPAWN);
    },
    getTransferLocations: function (creep) {
        const city = creep.memory.city;
        const spawn = Game.spawns[city];
        const structures = spawn.room.find(FIND_STRUCTURES);
        return _.filter(structures, structure => structure.structureType == STRUCTURE_STORAGE ||
            //mineral miner error when in use                                        structure.structureType == STRUCTURE_SPAWN ||
            structure.structureType == STRUCTURE_CONTAINER);
    },
    getFactory: function (room) {
        if (room.controller.level < 7)
            return false;
        // check for existing
        const roomCache = u.getsetd(Cache, room.name, {});
        const factory = Game.getObjectById(roomCache.factory);
        if (factory)
            return factory;
        // look up uncached factory
        const factories = room.find(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_FACTORY }
        });
        if (factories.length) {
            roomCache.factory = factories[0].id;
            return factories[0];
        }
        return false;
    },
    // Get the room's storage location. Priority for storage:
    // 1. Storage 2. Container 3. Terminal 4. Spawn
    getStorage: function (room) {
        // 1. Storage
        if (room.storage)
            return room.storage;
        const roomCache = u.getsetd(Cache, room.name, {});
        // 2. Container
        const container = Game.getObjectById(roomCache.container);
        if (container)
            return container;
        const structures = room.find(FIND_STRUCTURES);
        const spawn = _.find(structures, struct => struct.structureType == STRUCTURE_SPAWN);
        const newContainer = spawn && _.find(structures, struct => struct.structureType == STRUCTURE_CONTAINER
            && struct.pos.inRangeTo(spawn, 3));
        if (newContainer) {
            roomCache.container = newContainer.id;
            return newContainer;
        }
        // 3. Terminal
        if (room.terminal)
            return room.terminal;
        // 4. Spawn   
        if (spawn)
            return spawn;
        return null;
    },
    getAvailableSpawn: function (spawns) {
        const validSpawns = _.filter(spawns, spawn => !spawn.spawning);
        if (validSpawns.length > 0) {
            return validSpawns[0];
        }
        else {
            return null;
        }
    },
    requestBoosterFill: function (spawn, boosts) {
        if (!spawn.memory.ferryInfo || !spawn.memory.ferryInfo.labInfo) {
            return;
        }
        const receivers = spawn.memory.ferryInfo.labInfo.receivers;
        for (const mineral of boosts) {
            let receiver = _.find(Object.keys(receivers), lab => receivers[lab].boost == mineral);
            if (!receiver) {
                receiver = _.find(Object.keys(receivers), lab => !receivers[lab].boost);
            }
            if (receiver) {
                receivers[receiver].boost = mineral;
                const lab = Game.getObjectById(receiver);
                if (lab) {
                    receivers[receiver].fill = Math.ceil((LAB_MINERAL_CAPACITY - (lab.store[mineral] || 0)) / 1000);
                }
            }
        }
    },
    isNukeRampart: function (roomPos) {
        const structures = roomPos.lookFor(LOOK_STRUCTURES);
        if (_.find(structures, struct => settings.nukeStructures.includes(struct.structureType))) {
            return true;
        }
        return false;
    },
    initializeSources: function (spawn) {
        const memory = spawn.memory;
        if (!memory.sources || Object.keys(memory.sources).length == 0) {
            memory.sources = {};
            const localSources = spawn.room.find(FIND_SOURCES);
            _.each(localSources, function (sourceInfo) {
                const sourceId = sourceInfo.id;
                const sourcePos = sourceInfo.pos;
                if (!(sourceId in memory.sources)) {
                    memory.sources[sourceId] = sourcePos;
                }
            });
        }
    },
    isPositionBlocked: function (roomPos) {
        const look = roomPos.look();
        for (const lookObject of look) {
            if ((lookObject.type == LOOK_TERRAIN
                && lookObject[LOOK_TERRAIN] == "wall") //no constant for wall atm
                || (lookObject.type == LOOK_STRUCTURES
                    && _.contains(OBSTACLE_OBJECT_TYPES, lookObject[LOOK_STRUCTURES].structureType))) {
                return true;
            }
        }
        return false;
    },
    countMiningSpots: function (pos) {
        let spots = 0;
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (!rU.isPositionBlocked(new RoomPosition(pos.x + x, pos.y + y, pos.roomName))) {
                    spots++;
                }
            }
        }
        return spots;
    },
    miningRoomType: {
        LOCAL: "local",
        REMOTE: "remote",
        SK: "sourceKeeper"
    },
    getMiningRoomType: function (roomNameOrSourceId) {
        let roomName = null;
        const source = Game.getObjectById(roomNameOrSourceId);
        if (source) {
            roomName = source.room.name;
        }
        else if (Game.rooms[roomNameOrSourceId] || Cache.roomData[roomNameOrSourceId]) {
            roomName = roomNameOrSourceId;
        }
        if (!roomName || u.isSKRoom(roomName)) {
            return rU.miningRoomType.SK;
        }
        else if (Game.rooms[roomName] && Game.rooms[roomName].controller && Game.rooms[roomName].controller.my) {
            return rU.miningRoomType.LOCAL;
        }
        else {
            return rU.miningRoomType.REMOTE;
        }
    }
};
module.exports = rU;
