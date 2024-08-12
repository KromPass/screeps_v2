"use strict";
const username = getUsername();
function getUsername() {
    const roomObject = Object.values(Game.structures).concat(Object.values(Game.creeps), Object.values(Game.powerCreeps), Object.values(Game.constructionSites))[0];
    const ownableObject = roomObject;
    return ownableObject.my ? ownableObject.owner.username : "";
}
const settings = {
    username: username,
    allies: ["Atanner", "slowmotionghost", "Timendainum", "FeTiD", "SBense", "6g3y", username],
    nukeStructures: [STRUCTURE_SPAWN, STRUCTURE_LAB, STRUCTURE_STORAGE, STRUCTURE_FACTORY,
        STRUCTURE_TERMINAL, STRUCTURE_POWER_SPAWN, STRUCTURE_NUKER],
    militaryBoosts: ["XKHO2", "XGHO2", "XZHO2", "XLHO2", "XZH2O", "G"],
    civBoosts: ["XLH2O", "XUHO2", "XKH2O", "XUH2O", "XGH2O"],
    roomplanTime: 500,
    roomplanOffset: 155,
    cMTime: 400,
    cMOffset: 39,
    // market
    creditMin: 1000000,
    powerPrice: 8,
    upgradeBoostPrice: 500,
    powerBuyVolume: 5000,
    processPower: false,
    rcl8upgrade: true,
    miningDisabled: [],
    mineralAmount: 50000,
    ghodiumAmount: 7000,
    boostsNeeded: 6000,
    boostAmount: 5000,
    wallHeight: [0, 0, 0, 30000, 100000, 500000, 2000000, 5000000],
    wallHeightGCL: 3,
    flagCleanup: 2000,
    depositFlagRemoveTime: 100000,
    addRemote: 0.7,
    removeRemote: 0.9,
    spawnFreeTime: 0.08,
    spawnFreeTimeBuffer: 0.05,
    bucket: {
        resourceMining: 1000,
        repair: 1500,
        processPower: 2200,
        colony: 2000,
        upgrade: 7000,
        energyMining: 4000,
        powerMining: 5000,
        mineralMining: 8000,
        // other constants we use with these
        range: 3000,
        //If range + range/2 > 10000, there may be times where a mining flag is not placed even though the bucket is full
        rclMultiplier: 200,
        growthLimit: 5, // average bucket growth limit over 100+ ticks
    },
    energy: {
        repair: 60000,
        rcl8upgrade: 450000,
        processPower: 400000,
        powerMine: 350000
    },
    max: {
        runners: 15,
        builders: 3,
        transporters: 2,
        miners: 1, // TODO: this shouldn't be in use anymore
    },
    motion: {
        backRoadPenalty: 1.5,
        pathFailThreshold: 3,
        pathFailRetry: 53 // number of ticks to wait before trying to find a path again after hitting the threshold
    },
    scouting: {
        assessTime: 500,
        controllerRoom: [20000, 5000, 5000, 10000, 15000, 20000, 40000, 60000, 100000],
        sk: 100000,
        highway: 10000000
    },
    minerUpdateTime: 50,
    powerMiningRange: 2,
    miningRange: 7,
    observerFrequency: 20,
    // Profiling
    profileFrequency: 19,
    profileLength: 1,
    profileResultsLength: 50,
    // Stats
    statTime: 19,
    resourceStatTime: 19 * 50,
    //Data
    backupTime: 52 //backupTime * statTime = backup interval
};
if (!Game.shard.name.includes("shard") || Game.shard.name == "shardSeason") {
    //botarena, swc and seasonal custom settings
    settings.allies = [username];
    settings.processPower = false;
    settings.rcl8upgrade = false;
    settings.powerMiningRange = 0; //manhattan distance that we can powermine (in rooms)
    settings.militaryBoosts = ["XZHO2", "XZH2O", "XLHO2", "XKHO2", "XGHO2"];
    settings.civBoosts = ["XLH2O", "XGH2O"];
}
if (!Memory.settings) {
    Memory.settings = {
        allies: settings.allies
    };
}
module.exports = settings;
