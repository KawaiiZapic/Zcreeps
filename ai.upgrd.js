 /*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('ai.upgrd');
 * mod.thing == 'a thing'; // true
 */
var helper = require('func.helper');
var upgrd = {
    "work": function(cp){
        if(cp.spawning){
            return false;
        }
        switch(cp.memory.status){
            case "upgrading":
                if(cp.store.getUsedCapacity <= 0){
                    cp.memory.status = "harvesting";
                    return false;
                }
                var result = cp.upgradeController(cp.room.controller);
                switch(result){
                    case OK:
                        break;
                    case ERR_NOT_IN_RANGE:
                        cp.moveTo(cp.room.controller,{visualizePathStyle: {stroke: '#f44336',opacity: 0.3}});
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        cp.memory.status = "harvesting";
                        var work = this.refreshTarget(cp);
                        if(!work){
                            cp.memory.status = "idle";
                            return false;
                        }
                        break;
                    case ERR_INVALID_TARGET:
                        break;
                    default:
                        console.log("Creep \""+cp.name+"\" has an error when working,code:"+result+",status:"+cp.memory.status+",targetID:"+cp.memory.targetid);
                        break;
                }
                break;
            case "harvesting":
                var target = Game.getObjectById(cp.memory.targetid);
                if(!target){
                    this.refreshTarget(cp);
                    return false;
                }
                var result = cp.withdraw(target,RESOURCE_ENERGY);
                switch(result){
                    case OK:
                        cp.memory.status = "upgrading";
                        break;
                    case ERR_FULL:
                        cp.memory.status = "upgrading";
                        break;
                    case ERR_NOT_IN_RANGE:
                        cp.moveTo(target,{visualizePathStyle: {stroke: '#f44336',opacity: 0.3}});
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        var work = this.refreshTarget(cp);
                        cp.move(1);
                        if(!work){
                            cp.memory.status = "upgrading";
                        }
                        break;
                    case ERR_INVALID_TARGET:
                        var work = this.refreshTarget(cp);
                        if(!work){
                            cp.memory.status = "upgrading";
                        }
                        break;
                    default:
                        console.log("Creep \""+cp.name+"\" has an error when working,code:"+result+",status:"+cp.memory.status+",targetID:"+cp.memory.targetid);
                        break;
                }
                break;
            case "idle":
                var work = this.refreshTarget(cp);
                if(!work){
                    return false;
                }else{
                    cp.memory.status = "harvesting";
                    return true;
                }
                break;
            default:
                cp.memory.status = "idle";
                return false;
                break;
        }
    },
    "refreshTarget": function(cp){
        switch(cp.memory.status){
            case "harvesting":
                var targets = cp.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE ||
                                structure.structureType == STRUCTURE_CONTAINER) && 
                                structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
                        }
                    }
                );
                if(targets.length > 0){
                    cp.memory.targetid = helper.getNearestPathByFind(cp,targets);
                    cp.say("Harvesting");
                    return true;
                }else{
                    return false;
                }
                break;
            case 'idle':
                if(Game.time % 10 == 0){
                    var targets = cp.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_STORAGE ||
                                structure.structureType == STRUCTURE_CONTAINER) && 
                                structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
                            }
                        }
                    );
                    if(targets.length > 0){
                        cp.memory.targetid = helper.getNearestPathByFind(cp,targets);
                        cp.say("Harvesting");
                        return true;
                    }else{
                        return false;
                    }
                }else{
                    return false;
                }
                break;
            default:
                cp.memory.status = "idle";
                break;
        }
        return false;
    }
}
module.exports = upgrd;