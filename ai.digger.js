/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('ai.digger');
 * mod.thing == 'a thing'; // true
 */
var helper = require('func.helper');
var digger = {
    "work": function(cp){
        if(cp.spawning){
            return false;
        }
        switch(cp.memory.status){
            case "digging":
                if(cp.store.getFreeCapacity() <= 2){
                    cp.memory.status = "transfer";
                    this.refreshTarget(cp);
                    return false;
                }
                var target = Game.getObjectById(cp.memory.digTargetid);
                if(!target){
                    this.refreshTarget(cp);
                    return false;
                }
                var result = cp.harvest(target);
                switch(result){
                    case OK:
                        break;
                    case ERR_NOT_IN_RANGE:
                        cp.moveTo(target,{visualizePathStyle: {stroke: '#00bcd4',opacity: 0.3}});
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        cp.memory.status = "idle";
                        break;
                    case ERR_INVALID_TARGET:
                        this.refreshTarget(cp);
                        break;
                    default:
                        console.log("Creep \""+cp.name+"\" has an error when working,code:"+result+",status:"+cp.memory.status+",targetID:"+cp.memory.digTargetid);
                        break;
                }
                break;
            case "transfer":
                var target = Game.getObjectById(cp.memory.transferTargetid);
                if(!target){
                    this.refreshTarget(cp);
                    return false;
                }
                var result = cp.transfer(target,RESOURCE_ENERGY);
                switch(result){
                    case OK:
                        cp.memory.status = "digging";
                        cp.say('Digging');
                        break;
                    case ERR_NOT_IN_RANGE:
                        cp.moveTo(target,{visualizePathStyle: {stroke: '#00bcd4',opacity: 0.3},ignoreCreeps: true});
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        cp.memory.status = "digging";
                        break;
                    case ERR_FULL:
                        cp.memory.status = "idle";
                        break;
                    case ERR_INVALID_TARGET:
                        this.refreshTarget(cp);
                        break;
                    default:
                        console.log("Creep \""+cp.name+"\" has an error when working,code:"+result+",status:"+cp.memory.status+",targetID:"+cp.memory.digTargetid);
                        break;
                }
                break;
            case "idle":
                var work = this.refreshTarget(cp);
                if(work){
                    cp.memory.status = "digging";
                }
                break;
            default:
                cp.memory.status = "idle";
                break;
        }
    },
    "refreshTarget": function(cp){
        switch(cp.memory.status){
            case "digging":
                if(!cp.memory.digTargetid||!Game.getObjectById(cp.memory.digTargetid)){
                    var targets = cp.room.find(FIND_SOURCES);
                    if(targets.length == 0){
                        return false;
                    }
                    var target = false;
                    for(var t in targets){
                        if(t.pos.findInRange(FIND_CREEPS,Game.creeps,1,{filter :(cp) => {return cp.memory.role == "digger"}}).length < 3){
                            target = t.id;
                        }
                    }
                    if(!target){
                        return false;
                    }
                    cp.memory.digTargetid = target;
                }
                cp.say("Digging");
                return true;
                break;
            case "transfer":
                if(!cp.memory.transferTargetid||!Game.getObjectById(cp.memory.transferTargetid)){
                    var source = Game.getObjectById(cp.memory.digTargetid);
                    if(!source){
                        cp.memory.status = "idle";
                        return false;
                    }
                    var targets = cp.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return structure.structureType == STRUCTURE_CONTAINER;
                            }
                        }
                    );
                    var target = helper.getNearestPathByFind(source,targets,{ignoreCreeps:true});
                    if(!target){
                        return false;
                    }
                    cp.memory.transferTargetid = target;
                }
                cp.say("Transfer");
                return true;
                break;
            case "idle":
                if(Game.time % 10 == 0){
                    if(!cp.memory.digTargetid||!Game.getObjectById(cp.memory.digTargetid)){
                        var targets = cp.room.find(FIND_SOURCES);
                        if(targets.length == 0){
                            return false;
                        }
                        var target = helper.getNearestPathByFind(cp,targets,{},false);
                        if(!target){
                            return false;
                        }
                        cp.memory.digTargetid = target;
                    }
                    if(!cp.memory.transferTargetid||!Game.getObjectById(cp.memory.transferTargetid)){
                        var source = Game.getObjectById(cp.memory.digTargetid);
                        var targets = cp.room.find(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    return structure.structureType == STRUCTURE_CONTAINER;
                                }
                            }
                        );
                        var target = helper.getNearestPathByFind(source,targets,{ignoreCreeps:true});
                        if(!target){
                            return false;
                        }
                        cp.memory.transferTargetid = target;
                    }
                    var source = Game.getObjectById(cp.memory.digTargetid);
                    var container = Game.getObjectById(cp.memory.transferTargetid);
                    if(source.energy > 0 && container.store.getFreeCapacity() > 0){
                        cp.say('Digging');
                        return true;
                    }else{
                        cp.say('Idle');
                        return false;
                    }
                }
            default:
                cp.memory.status = "idle";
                break;
        }
    }
}
module.exports = digger;