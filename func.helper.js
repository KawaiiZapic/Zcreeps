/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('func.helper');
 * mod.thing == 'a thing'; // true
 */

var helper = {
    "clearMemory": function(){
        var clearCount = 0;
        var cleared = "";
        for(var cpname in Memory.creeps){
            if(!Game.creeps[cpname]){
                cleared += cpname +" "; 
                delete(Memory.creeps[cpname]);
                clearCount++;
            }
        }
        if(clearCount != 0){
            console.log("Clear "+clearCount+" out dated object(s) form memory("+cleared+").");
        }
    },
    "getRandomStructureByFind": function(cp,find,opt = {}){
        var targets = cp.room.find(find,opt);
        if(targets.length ==0){
            return false;
        }
	    var tg = Math.floor(Math.random()*targets.length);
	    return targets[tg].id;
    },
    "getRandomStructureByFliter": function(cp,fliters){
        
    },
    "getNearestPathByFind": function(cp,find,opt = {},autoignore = true){
        var target = cp.pos.findClosestByPath(find,opt);
        if(!target && autoignore){
            opt.ignoreCreeps = true;
            var target = cp.pos.findClosestByPath(find,opt);
            if(!target){
                return false;
            }
        }
        return target.id;
    },
    "leaveHarvestableTarget": function(cp,target){
        
    }
}
module.exports = helper;