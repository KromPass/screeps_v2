"use strict";
const rMe = require("./medic");
const rDM = require("./depositMiner");
const rH = require("./harasser");
const rSB = require("./spawnBuilder");
const rC = require("./claimer");
const rUC = require("./unclaimer");
const rRo = require("./robber");
const rF = require("./ferry");
const rMM = require("./mineralMiner");
const rU = require("./upgrader");
const rB = require("./builder");
const rR = require("./runner");
const rBr = require("./breaker");
const rT = require("./transporter");
const rM = require("./remoteMiner");
const rD = require("./defender");
const rPM = require("./powerMiner");
const rQ = require("./quad");
const rS = require("./scout");
const rRe = require("./repairer");
const rQr = require("./qrCode");
const rRr = require("./reserver");
const rBk = require("./brick");
const rSk = require("./sKguard");
const rr = {
    // order roles for priority. TODO powercreep?
    getRoles: function () {
        return [rF, rD, rT, rM, rR, rU, rB, rQ, rMM, rC, rUC,
            rSB, rH, rMe, rBr, rPM,
            rRo, rDM, rS, rQr, rRe, rRr, rBk, rSk];
    },
    getCoreRoles: function () {
        return [rF, rD, rT, rM, rR, rU, rB];
    },
    getEmergencyRoles: function () {
        return [rF, rD, rT, rM, rR];
    }
};
module.exports = rr;
