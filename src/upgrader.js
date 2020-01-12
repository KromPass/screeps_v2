var actions = require('actions')
var u = require('utils')
var linkLib = require('link')

var CreepState = {
  START: 0,
  BOOST: 2,
  UPGRADE: 3
};
var CS = CreepState;

var rU = {
    name: "Upgrader",
    type: "normal",
    target: () => 0,

    /** @param {Creep} creep **/
    run: function(creep) {
      var city = creep.memory.city;
      if(!creep.memory.state){
        creep.memory.state = CS.START
      }
      const boost = 'XGH2O'
      rU.checkBoost(creep, city, boost);
      rU.getBoosted(creep, city, boost);

      if (creep.memory.state == CS.UPGRADE){
        

        if(creep.memory.upgrading && creep.carry.energy == 0) {
          creep.memory.upgrading = false;
        } else if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
          creep.memory.upgrading = true;
        }

        creep.memory.upgrading ? actions.upgrade(creep) : rU.withdraw(creep, city)
      }
    },

    withdraw: function(creep, city) {
      var location = rU.getUpgradeLink(creep)

      var targets = u.getWithdrawLocations(creep)
      location = location || targets[creep.memory.target]
      location = location || Game.spawns[city]

      if (actions.withdraw(creep, location) == ERR_NOT_ENOUGH_RESOURCES) {
          creep.memory.target = u.getNextLocation(creep.memory.target, targets);
      }
    },

    getWithdrawLocations: function(creep, city) {
      let upgradeLink = rU.getUpgradeLink(creep)
      if (upgradeLink) return upgradeLink

      var targets = u.getWithdrawLocations(creep);
      var location = targets[creep.memory.target];
      if (!location){
        location = Game.spawns[city];  
      }
      return location
    },

    // Get the upgrade link. Check creep memory, then lib. May return null
    getUpgradeLink: function(creep) {
      var link = creep.memory.upgradeLink
      if (!link || !Game.getObjectById(link)) {
        link = linkLib.getUpgradeLink(creep.room)
        if (link) creep.memory.upgradeLink = link.id
      }
      return link
    },

    checkBoost: function(creep, city, boost){
      if(creep.memory.state != CS.START){
        return;
      }
      if(Game.spawns[city].room.controller.level < 6 || !creep.room.terminal){
          creep.memory.state = CS.UPGRADE
          return;
      }
      if(Game.spawns[city].room.controller.level < 8){
        let lab = _.find(Game.spawns[city].room.find(FIND_STRUCTURES), structure => structure.structureType === STRUCTURE_LAB)
        if(lab && lab.room.terminal){
          if(rU.checkMaterials(lab, creep, boost)){
            creep.memory.lab = lab.id
            creep.memory.state = CS.BOOST
            return;
          }
        }
        creep.memory.state = CS.UPGRADE
        return;
      }
      if(!Game.spawns[city].memory.ferryInfo || !Game.spawns[city].memory.ferryInfo.boosterInfo){
          creep.memory.state = CS.UPGRADE
          return;
      }
      let lab = Game.getObjectById(Game.spawns[city].memory.ferryInfo.boosterInfo[0][0])
      if(lab != null && rU.checkMaterials(lab, creep, boost)){
            creep.memory.lab = lab.id
            creep.memory.state = CS.BOOST
      } else {
        creep.memory.state = CS.UPGRADE
      }
    },

    checkMaterials: function(lab, creep, boost){
      let terminal = lab.room.terminal
      let work = creep.getActiveBodyparts(WORK)
      return (terminal.store[boost] > (LAB_BOOST_MINERAL * work) && lab.mineralAmount == 0)
    },


    getBoosted: function(creep, city, boost){
      if(creep.memory.state != 1){
        return;
      }
      let lab = Game.getObjectById(creep.memory.lab)
      if(_.sum(creep.carry) == 0 && !creep.pos.isNearTo(lab.pos)){
        if(Game.time % 50 == 0){
          creep.memory.state = CS.START
          return;
        }
        let work = creep.getActiveBodyparts(WORK)
        actions.withdraw(creep, creep.room.terminal, boost, LAB_BOOST_MINERAL * work)
        return;
      }
      if(_.sum(creep.carry) > 0){
        actions.charge(creep, lab)
        return;
      }
      if(creep.body[0].boost){
        creep.memory.state = CS.UPGRADE
        return;
      } else {
        lab.boostCreep(creep)
        creep.memory.state = CS.UPGRADE
        return;
      }
    }
};
module.exports = rU;