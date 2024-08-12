"use strict";
const motion = require("../lib/motion");
const a = require("../lib/actions");
const rBk = {
    name: "brick" /* BRICK_NAME */,
    type: 0 /* brick */,
    run: function (creep) {
        if (creep.memory.target) {
            const target = Game.getObjectById(creep.memory.target);
            if (target) {
                a.attack(creep, target);
                return;
            }
        }
        const targetRoom = creep.memory.flag;
        if (Game.rooms[targetRoom] && creep.room.name == targetRoom) {
            const hostileStructures = Game.rooms[targetRoom].find(FIND_HOSTILE_STRUCTURES);
            if (hostileStructures.length) {
                const newTarget = creep.pos.findClosestByPath(hostileStructures);
                a.attack(creep, newTarget);
                creep.memory.target = newTarget.id;
            }
        }
        else {
            motion.newMove(creep, new RoomPosition(25, 25, targetRoom), 24);
        }
    }
};
module.exports = rBk;
