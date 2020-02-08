var actions = require('./actions');

var rDM = {
    name: "depositMiner",
    type: "depositMiner",
    target: () => 0,

    // Keep track of how much is mined for stats. Stat object will clear this when it's recorded
    mined: 0,

    /** @param {Creep} creep **/
    run: function(creep) {
        if (_.sum(creep.store) === 0 && creep.ticksToLive < 500){//if old and no store, suicide
            creep.suicide()
            return;
        }
        if(creep.memory.target === 0){
            if(_.sum(creep.store) === creep.store.getCapacity()){
                creep.memory.target = 1
            }
        }
        switch(creep.memory.target){
            case 0: {
                //newly spawned or empty store
                const flagName = creep.memory.city + 'deposit';
                if(!Game.flags[flagName]){//if there is no flag, change city.memory.depositMiner to 0, and suicide
                    Game.spawns[creep.memory.city].memory.depositMiner = 0;
                    creep.suicide();
                    return;
                }
                if(creep.body.length === 3){
                    Game.flags[flagName].remove();
                }
                if (Game.flags[flagName].pos.roomName !== creep.pos.roomName){//move to flag until it is visible
                    creep.moveTo(Game.flags[flagName], {reusePath: 50}, {range: 1, maxOps: 5000, swampCost: 8})
                    return;
                }
                const deposit = Game.flags[flagName].room.lookForAt(LOOK_DEPOSITS, Game.flags[flagName].pos);//if flag is visible, check for deposit, if no deposit, remove flag
                if(!deposit.length){
                    Game.flags[flagName].remove();
                    return;
                }
                if(_.sum(creep.store) === 0 && (deposit[0].lastCooldown > 25 && Game.cpu.bucket < 3000)){
                    Game.flags[flagName].remove();
                    return;
                }
                //check for enemies. if there is an enemy, call in harasser
                if(creep.pos.roomName == Game.flags[flagName].pos.roomName){
                    rDM.checkEnemies(creep, deposit[0])
                }
                //move towards and mine deposit (actions.harvest)
                if(actions.harvest(creep, deposit[0]) === 1){
                    //record amount harvested
                    const works = _.filter(creep.body, part => part.type == WORK).length
                    // record personal work for stats
                    if (!creep.memory.mined) {
                        creep.memory.mined = 0
                    }
                    creep.memory.mined += works
                    // update city level tracker for planning purposes
                    if(!Game.spawns[creep.memory.city].memory.deposit){
                        Game.spawns[creep.memory.city].memory.deposit = 0;
                    }
                    Game.spawns[creep.memory.city].memory.deposit = Game.spawns[creep.memory.city].memory.deposit + works;
                }
                break;
            }
            case 1:
                //store is full
                if(_.sum(creep.store) === 0){
                    creep.memory.target = 0;
                    return;
                }
                actions.charge(creep, Game.spawns[creep.memory.city].room.storage)

        }
    },

    checkEnemies: function(creep, deposit){
        if(Game.time % 50 == 0 || creep.hits < creep.hitsMax){
            //scan room for hostiles
            const hostiles = creep.room.find(FIND_HOSTILE_CREEPS)
            const dangerous = _.find(hostiles, h => h.getActiveBodyparts(ATTACK) > 0 || h.getActiveBodyparts(RANGED_ATTACK) > 0)
            
            //check for tampering with deposit
            const cooldown = deposit.lastCooldown
            const expected = Math.ceil(0.001*Math.pow(Game.spawns[creep.memory.city].memory.deposit,1.2))

            if(cooldown > expected){
                Game.spawns[creep.memory.city].memory.deposit = Math.floor(Math.pow((deposit.lastCooldown / 0.001), 1/1.2))
            }
            if(cooldown > expected || dangerous){
                //call in harasser
                const flagName = creep.memory.city + 'harass'
                if(!Game.flags[flagName]){
                    creep.room.createFlag(25, 25, flagName)
                }
            }
        }
    }

};
module.exports = rDM;