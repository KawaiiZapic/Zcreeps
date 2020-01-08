var harst = require("ai.harst");
var repairer = require("ai.repairer");
var keeper = require("func.keepcreeps");
var upgrd = require("ai.upgrd");
var builder = require('ai.builder');
var helper = require('func.helper');
var cleaner = require('r.cleaner');
var digger = require('ai.digger');

module.exports.loop = function () {
    var creepscount = [];
    for(var cp in Game.creeps){
        switch(Game.creeps[cp].memory.role){
            case "upgrader":
                upgrd.work(Game.creeps[cp]);
                break;
            case "harvseter":
                harst.work(Game.creeps[cp]);
                break;
            case "builder":
                builder.work(Game.creeps[cp]);
                break;
            case "cleaner":
                cleaner.work(Game.creeps[cp]);
                break;
            case "repairer":
                repairer.work(Game.creeps[cp]);
                break;
            case "digger":
                digger.work(Game.creeps[cp]);
                break;
            deafult:
                Game.creeps[cp].say("NMSL");
                break;
        }
        
    }
    if(Game.time % 10 == 0){
        helper.clearMemory();
        keeper.keep();
    }
}