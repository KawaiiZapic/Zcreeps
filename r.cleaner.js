/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('r.cleaner');
 * mod.thing == 'a thing'; // true
 */

var cleaner = {
    "work" : function(cp){
        if(cp.spawning){
            return false;
        }
        if(cp.memory.upgrading && cp.store[RESOURCE_ENERGY] == 0) {
            cp.memory.upgrading = false;
            cp.say('Harvest...('+cp.store.getUsedCapacity()+"/"+cp.store.getCapacity()+")");
	    }
	    if(!cp.memory.upgrading && cp.store.getFreeCapacity() == 0) {
	        cp.memory.upgrading = true;
	        cp.say('⚡ upgrade');
	    }
	    if(cp.memory.upgrading) {
            if(cp.upgradeController(cp.room.controller) == ERR_NOT_IN_RANGE) {
                cp.moveTo(cp.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            var s = cp.room.find(FIND_RUINS);
            var t = 0;
            while(s[t].store.getUsedCapacity()<=0){
                t++;
                if(t==s.length-1){
                    return false;
                }
            }
            var r = cp.withdraw(s[t],RESOURCE_ENERGY);
            if(r == ERR_NOT_IN_RANGE) {
                cp.moveTo(s[t], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
}
module.exports = cleaner;