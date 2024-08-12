"use strict";
// https://github.com/screepers/simpleAllies/blob/main/src/ts/simpleAllies.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleAllies = exports.maxSegmentsOpen = void 0;
const settings = require("../config/settings");
// This isn't in the docs for some reason, so we need to add it
exports.maxSegmentsOpen = 10;
const requestsSekelton = {
    resource: [],
    defense: [],
    attack: [],
    player: [],
    work: [],
    funnel: [],
    room: [],
};
class SimpleAllies {
    constructor() {
        this.myRequests = Object.assign({}, requestsSekelton);
        // Partial since we can't trust others to not omit fields
        // we want to make sure we check their existence
        this.allySegmentData = {};
        this.allyRequestMap = {};
        this.currentAllyIndex = 0;
    }
    /**
     * To call before any requests are made or responded to. Configures some required values and gets ally requests
     */
    initRun() {
        // Reset the data of myRequests
        this.myRequests = {
            resource: [],
            defense: [],
            attack: [],
            player: [],
            work: [],
            funnel: [],
            room: [],
        };
    }
    /**
     * Try to get segment data from our current ally. If successful, assign to the instane
     */
    readAllySegment() {
        const allies = _.without(Memory.settings.allies, settings.username);
        if (!allies.length) {
            if (Game.time % 1000 === 0)
                Log.warning("Failed to find an ally for simpleAllies, you probably have none :(");
            return;
        }
        if (!Memory.settings.allySegmentID) {
            Log.warning("Failed to find an ally segment ID for simpleAllies, set one using 'SetAllySegment(int segmentID)'");
            return;
        }
        this.currentAlly = allies[this.currentAllyIndex];
        this.currentAllyIndex = (this.currentAllyIndex + 1) % allies.length;
        // Make a request to read the data of the next ally in the list, for next tick
        const nextAllyName = allies[this.currentAllyIndex];
        RawMemory.setActiveForeignSegment(nextAllyName, Memory.settings.allySegmentID);
        // Maybe the code didn't run last tick, so we didn't set a new read segment
        if (!RawMemory.foreignSegment)
            return;
        if (RawMemory.foreignSegment.username !== this.currentAlly)
            return;
        // Protect from errors as we try to get ally segment data
        try {
            this.allySegmentData = JSON.parse(RawMemory.foreignSegment.data);
            this.allyRequestMap[this.currentAlly] = this.allySegmentData.requests;
        }
        catch (err) {
            Log.error(`Error in getting requests for simpleAllies ${this.currentAlly}`);
        }
    }
    /**
     * To call after requests have been made, to assign requests to the next ally
     */
    endRun() {
        if (!Memory.settings.allySegmentID) {
            return;
        }
        // Make sure we don't have too many segments open
        if (Object.keys(RawMemory.segments).length >= exports.maxSegmentsOpen) {
            Log.error("Too many segments open: simpleAllies");
            return;
        }
        const newSegmentData = {
            requests: this.myRequests
        };
        RawMemory.segments[Memory.settings.allySegmentID] = JSON.stringify(newSegmentData);
        RawMemory.setPublicSegments([Memory.settings.allySegmentID]);
    }
    // Request methods
    requestResource(args) {
        this.myRequests.resource.push(args);
    }
    requestDefense(args) {
        this.myRequests.defense.push(args);
    }
    requestAttack(args) {
        this.myRequests.attack.push(args);
    }
    requestPlayer(args) {
        this.myRequests.player.push(args);
    }
    requestWork(args) {
        this.myRequests.work.push(args);
    }
    requestFunnel(args) {
        this.myRequests.funnel.push(args);
    }
    requestEcon(args) {
        this.myRequests.econ = args;
    }
    requestRoom(args) {
        this.myRequests.room.push(args);
    }
}
exports.simpleAllies = new SimpleAllies();
