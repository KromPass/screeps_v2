"use strict";
const actions = require("../lib/actions");
const rMe = {
    name: "medic" /* MEDIC_NAME */,
    type: 16 /* medic */,
    boosts: [RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
        RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE],
    actions: ["damage" /* TOUGH */, "heal" /* HEAL */, "fatigue" /* MOVE */],
    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.boostTier > 0 && !creep.memory.boosted) {
            return actions.getBoosted(creep, rMe.actions, creep.memory.boostTier);
        }
        rMe.init(creep);
        const partner = Game.getObjectById(creep.memory.partner);
        if (!partner) {
            //if partner is dead, suicide
            if (rMe.endLife(creep)) {
                return;
            }
            //if creep not matched, wait to be picked up
        }
    },
    init: function (creep) {
        if (!creep.memory.partner) {
            creep.memory.partner = null;
        }
    },
    endLife: function (creep) {
        if (creep.memory.partner == null) {
            return false;
        }
        else {
            creep.suicide();
            return true;
        }
    }
};
module.exports = rMe;
