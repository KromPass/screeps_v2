var actions = {
    interact: function(creep, location, fnToTry) {
        var result = fnToTry();
        switch (result) {
            case ERR_NOT_IN_RANGE:
                return actions.move(creep, location);
                //return creep.moveTo(location, {reusePath: 10});
            case OK:
            case ERR_BUSY:
            case ERR_FULL:
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.memory.path = null;
                return result;
            default:
                console.log(creep.memory.role + " at " + creep.pos.x + "," + creep.pos.y + ": " + result.toString());
                return result;
      }
    },

    move: function(creep, location) {
        // check if there's a path. try moving along it
        var plannedPath = creep.memory.path;
        if (plannedPath) {
            var result = creep.moveByPath(plannedPath);
            switch (result) {
                case OK:
                case ERR_TIRED: // tired is fine
                    return result;
                case ERR_NOT_FOUND:
                    break; // let's get a new path
                default:
                    console.log(creep.memory.role + " at " + creep.pos.x + "," + creep.pos.y + ": " + result.toString());
                    break;
            }
        }

        // Get here if there's no planned path or plan failed
        var newPath = creep.pos.findPathTo(location);
        creep.memory.path = newPath;
        return creep.moveByPath(plannedPath);
    },
    
    reserve: function(creep, target){
        return actions.interact(creep, target, () => creep.reserveController(target));
    },

    dismantle: function(creep, target){
        return actions.interact(creep, target, () => creep.dismantle(target));
    },
    
    attack: function(creep, target){
        return actions.interact(creep, target, () => creep.attack(target));
    },
    
    withdraw: function(creep, location) {
      return actions.interact(creep, location, () => creep.withdraw(location, RESOURCE_ENERGY));
    },

    harvest: function(creep, target) {
      return actions.interact(creep, target, () => creep.harvest(target));
    },
    
    pickup: function(creep) {
        //if (Game.time % 10 === 0){
        var rooms = Game.rooms;
        var drops = _.flatten(_.map(rooms, room => room.find(FIND_DROPPED_RESOURCES)));
        targets = _.sortBy(drops, drop => -1*drop.amount + 28*PathFinder.search(creep.pos, drop.pos).cost);
        creep.memory.target = targets[0]
        //console.log(_.map(targets, t => -1*t.amount + 20*PathFinder.search(creep.pos, t.pos).cost));
        //}
        //console.log(creep.memory.target);
        // target = '[resource (energy) ' + creep.memory.target.id + ']';
         //console.log(target);
        if(creep.memory.target) {
            //room1 = 
            return actions.interact(creep, creep.memory.target, () => creep.pickup(creep.memory.target));
        }
    },

    upgrade: function(creep) {
      location = creep.room.controller;
      return actions.interact(creep, location, () => creep.upgradeController(location));
    },

    charge: function(creep, location) {
      return actions.interact(creep, location, () => creep.transfer(location, RESOURCE_ENERGY));
    },

    build: function(creep) {
      var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if(targets.length) {
        return actions.interact(creep, targets[0], () => creep.build(targets[0]));
      }
    }
};

module.exports = actions;