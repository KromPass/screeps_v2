var a = require('actions');
var u = require('utils');

var rBr = {
    name: "breaker",
    type: "breaker",
    target: () => 0,
   

    /** @param {Creep} creep **/
    run: function(creep) {
        u.updateCheckpoints(creep);
        var breakerTarget = Game.getObjectById(creep.memory.target)
        let attacker = _.find(creep.room.find(FIND_HOSTILE_CREEPS), c => c.pos.isNearTo(creep.pos) && c.getActiveBodyparts(ATTACK) > 10)
        if(attacker){creep.memory.retreat = true}
		if (breakerTarget && creep.pos.isNearTo(breakerTarget.pos)){
            creep.dismantle(breakerTarget);
		} 
        if (!creep.memory.medic){
            creep.memory.medic = null;
        }
        var medic = Game.getObjectById(creep.memory.medic);
        if (medic){
            //console.log(!creep.pos.isNearTo(medic.pos) && !creep.memory.attack)
            if ((!creep.pos.isNearTo(medic.pos) && !(creep.pos.x <= 1 || creep.pos.x >= 48 || creep.pos.y <= 1 || creep.pos.y >= 48)) || (medic.fatigue > 0)){
                return;
            }
        } else {
            //look for medics
            var allCreeps = u.splitCreepsByCity();
            let status = creep.memory.role.substring(0, 3);
            var medicSearch = 0
            if (status == 'big'){
                medicSearch = _.find(allCreeps[creep.memory.city], localCreep => localCreep.memory.role === 'bigMedic' && localCreep.pos.isNearTo(creep.pos) 
                                                                                        && localCreep.memory.breaker == creep.id);
            } else {
                    medicSearch = _.find(allCreeps[creep.memory.city], localCreep => localCreep.memory.role === 'medic' && localCreep.pos.isNearTo(creep.pos) 
                                                                                        && localCreep.memory.breaker == creep.id);
            }                                               
            if (medicSearch){
                creep.memory.medic = medicSearch.id;
            }
            return;
        }
        var city = creep.memory.city;
        var flagName = 'break'
        let status = creep.memory.role.substring(0, 3);
        if(status === 'big'){
            flagName = city + 'bigBreak'
        } else {
            flagName = city + 'break'
        }
        if(creep.hits < creep.hitsMax * 0.85){
            creep.memory.retreat = true
        }
        if(creep.memory.retreat) {
            return a.retreat(creep);
        }
        var targetFlag = creep.memory.city + 'breakTarget';
        if(Game.flags[targetFlag] && creep.pos.roomName === Game.flags[targetFlag].pos.roomName){
            var found = Game.flags[targetFlag].pos.lookFor(LOOK_STRUCTURES)
            if(found.length){
                a.dismantle(creep, found[0])
                return;
            }
        }

        let ignore = Game.spawns[creep.memory.city].memory.ignoreRooms
        if(ignore != null && ignore.includes(creep.pos.roomName)){
            //attempt to move through room
        } else {
            const badStuff = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                filter: function(object) {
                    return (object.structureType !== STRUCTURE_CONTROLLER 
                        && object.owner.username !== 'Invader' && object.owner.username !== 'Source Keeper' 
                        && object.owner.username !== 'Public'
                        && object.owner.username !== 'Power Bank'
                        && object.hits )
                }
            })
            if(badStuff != null) { // TODO ignore target room
                a.dismantle(creep, badStuff)
                creep.memory.target = badStuff.id
                return
            }
        }
        var rallyFlag = creep.memory.city + 'breakerRally1'
        if (Game.flags[rallyFlag] && !creep.memory.rally1){
            creep.moveTo(Game.flags[rallyFlag], {reusePath: 50})
            if (Game.flags[rallyFlag].pos.x == creep.pos.x && Game.flags[rallyFlag].pos.y == creep.pos.y && Game.flags[rallyFlag].pos.roomName == creep.pos.roomName){
                creep.memory.rally1 = true
            }
            return;
        }
        var rallyFlag2 = creep.memory.city + 'breakerRally2'
        if (Game.flags[rallyFlag2] && !creep.memory.rally2){
            creep.moveTo(Game.flags[rallyFlag2], {reusePath: 50})
            if (Game.flags[rallyFlag2].pos.x == creep.pos.x && Game.flags[rallyFlag2].pos.y == creep.pos.y && Game.flags[rallyFlag2].pos.roomName == creep.pos.roomName){
                creep.memory.rally2 = true
            }
            return;
        }
        if(Game.flags[targetFlag]){
            creep.moveTo(Game.flags[targetFlag], {reusePath: 50})
            return;
        }
        var target = Game.getObjectById(creep.memory.target);
        //console.log(target)
        if (target){
            if (Game.time % 10 === 0 && creep.pos.getRangeTo(target) > 1){
                var rampart = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES)
                if (rampart) {
                    creep.memory.target = rampart.id
                    a.dismantle(creep, rampart);
                    return;
                }
            }
            //console.log(a.dismantle(creep, target))
        }
        if(Game.flags[flagName]){
            if(creep.pos.roomName === Game.flags[flagName].pos.roomName){
                a.breakStuff(creep);
            } else {
                creep.moveTo(Game.flags[flagName].pos, {reusePath: 50});
            }
        } else {
            a.breakStuff(creep);
        }
    }
   
};
module.exports = rBr;