"use strict";
const actions = require("../lib/actions");
const linkLib = require("../buildings/link");
const motion = require("../lib/motion");
const creepUtils_1 = require("../lib/creepUtils");
const roomU = require("../lib/roomUtils");
const u = require("../lib/utils");
const rU = {
    name: "upgrader" /* UPGRADER_NAME */,
    type: 6 /* normal */,
    target: 0,
    boosts: [RESOURCE_CATALYZED_GHODIUM_ACID],
    actions: ["upgradeController" /* UPGRADE */],
    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.needBoost && !creep.memory.boosted) {
            rU.getBoosted(creep, rU.boosts[0]);
            return;
        }
        creepUtils_1.cU.setMoveStatus(creep);
        rU.setUpgradingLocation(creep);
        const creepCache = u.getCreepCache(creep.id);
        if (!creepCache.works) {
            creepCache.works = creep.getActiveBodyparts(WORK);
        }
        if (creep.store.energy <= creepCache.works * 2)
            rU.getEnergy(creep);
        if (creep.store.energy > 0)
            actions.upgrade(creep);
        if (Game.time % 50 == 49)
            rU.checkConstruction(creep);
    },
    checkConstruction: function (creep) {
        if (!creep.memory.boosted && creep.memory.moveStatus != "static" /* STATIC */) {
            const extensionSite = _.find(creep.room.find(FIND_MY_CONSTRUCTION_SITES), c => c.structureType == STRUCTURE_EXTENSION
                || c.structureType == STRUCTURE_CONTAINER
                || c.structureType == STRUCTURE_STORAGE);
            if (extensionSite && creep.room.controller.ticksToDowngrade > CONTROLLER_DOWNGRADE[creep.room.controller.level] * 0.8) {
                creep.memory.role = "builder" /* BUILDER_NAME */;
            }
        }
    },
    setUpgradingLocation: function (creep) {
        if (creep.memory.destination || creep.memory.moveStatus != "static" /* STATIC */) {
            return;
        }
        const linkPos = linkLib.getUpgradeLinkPos(creep.room);
        let location;
        if (linkPos) {
            location = rU.findFreeSpot(creep, linkPos);
        }
        if (!location) {
            Log.error(`No free spot for upgrader at ${creep.pos}`);
        }
        creep.memory.destination = location;
    },
    findFreeSpot: function (creep, pos) {
        const otherUpgraders = _.filter(u.splitCreepsByCity()[creep.memory.city], c => c.memory.role == "upgrader" /* UPGRADER_NAME */ && c.id != creep.id);
        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                const newPos = new RoomPosition(pos.x + x, pos.y + y, pos.roomName);
                if (!roomU.isPositionBlocked(newPos)
                    && newPos.inRangeTo(creep.room.controller.pos, 3)
                    && !_.find(otherUpgraders, c => c.memory.destination && newPos.isEqualTo(c.memory.destination.x, c.memory.destination.y))) {
                    return newPos;
                }
            }
        }
        return null;
    },
    getEnergy: function (creep) {
        const link = rU.getUpgradeLink(creep);
        if (link) {
            actions.withdraw(creep, link);
            if (link && link.structureType == STRUCTURE_CONTAINER && link.pos.isNearTo(creep.pos) && link.pos.inRangeTo(link.room.controller.pos, 3)) {
                creep.move(creep.pos.getDirectionTo(link.pos));
            }
            return;
        }
        creepUtils_1.cU.getEnergy(creep);
    },
    // Get the upgrade link. Check creep memory, then lib. May return null
    getUpgradeLink: function (creep) {
        let link = Game.getObjectById(creep.memory.upgradeLink);
        link = link || linkLib.getUpgradeLink(creep.room);
        if (link) {
            creep.memory.upgradeLink = link.id;
            return link;
        }
        else {
            return null;
        }
    },
    getBoosted: function (creep, boost) {
        if (creep.spawning) {
            return;
        }
        if (!Game.spawns[creep.memory.city].memory.ferryInfo.labInfo) {
            creep.memory.boosted = true;
            return;
        }
        const labs = Object.keys(Game.spawns[creep.memory.city].memory.ferryInfo.labInfo.receivers);
        for (const labId of labs) {
            const lab = Game.getObjectById(labId);
            if (!lab) {
                continue;
            }
            if (lab.mineralType == boost) {
                //boost self
                if (lab.boostCreep(creep) === ERR_NOT_IN_RANGE) {
                    motion.newMove(creep, lab.pos, 1);
                }
                else {
                    creep.memory.boosted = true;
                }
                return;
            }
        }
        creep.memory.boosted = true;
    }
};
module.exports = rU;
