var actions = require('actions');
var t = require('types');
var rU = {
    main: "Upgrader",
    type: t.normal,
    target: 0,
    limit: Game.spawns['Home'].memory.Upgraders,

    /** @param {Creep} creep **/
    run: function(creep) {
      if(creep.memory.upgrading && creep.carry.energy == 0) {
        creep.memory.upgrading = false;
      }else if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
        creep.memory.upgrading = true;
      }
      var targets = creep.room.find(FIND_STRUCTURES);
      var location = targets[0];
      
      creep.memory.upgrading ? actions.upgrade(creep) : actions.withdraw(creep, location);
    }
};
module.exports = rU;