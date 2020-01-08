/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('ai.repairer');
 * mod.thing == 'a thing'; // true
 */
var helper = require('func.helper');
var builder = {
    "work": function(cp){
        if(cp.spawning){
            return false;
        }
        switch(cp.memory.status){
            case "building":
                var target = Game.getObjectById(cp.memory.targetid);
                if(target == null){
                    var work = this.refreshTarget(cp);
                    if(!work){
                        cp.memory.status = "idle";
                    }
                    return false;
                }
                var result = cp.build(target);
                switch(result){
                    case OK:
                        break;
                    case ERR_NOT_IN_RANGE:
                        cp.moveTo(target,{visualizePathStyle: {stroke: '#3388ff',opacity: 0.3}});
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        cp.memory.status = "harvesting";
                        var work = this.refreshTarget(cp);
                        if(!work){
                            cp.memory.status = "idle";
                        }
                        break;
                    case ERR_INVALID_TARGET:
                        cp.memory.status = "building";
                        var work = this.refreshTarget(cp);
                        if(!work){
                            cp.memory.status = "idle";
                        }
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
                        cp.memory.status = "building";
                        var work = this.refreshTarget(cp);
                        if(!work){
                            cp.memory.status = "idle";
                        }
                        break;
                    case ERR_FULL:
                        cp.memory.status = "building";
                        cp.move(1);
                        var work = this.refreshTarget(cp);
                        if(!work){
                            cp.memory.status = "idle";
                        }
                        break;
                    case ERR_NOT_IN_RANGE:
                        cp.moveTo(target,{visualizePathStyle: {stroke: '#3388ff',opacity: 0.3}});
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        var work = this.refreshTarget(cp);
                        cp.move(1);
                        if(!work){
                            cp.memory.status = "building";
                        }
                        break;
                    case ERR_INVALID_TARGET:
                        var work = this.refreshTarget(cp);
                        if(!work){
                            cp.memory.status = "building";
                        }
                        break;
                    default:
                        console.log("Creep \""+cp.name+"\" has an error when working,code:"+result+",status:"+cp.memory.status+",targetID:"+cp.memory.targetid);
                        break;
                }
                break;
            case "idle":
                var work = this.refreshTarget(cp);
                if(work){
                    if(cp.store.getUsedCapacity() > 0){
                        cp.memory.status = "building";
                        return true;
                    }else{
                        cp.memory.status = "harvesting";
                        return true;
                    }
                }else{
                    cp.moveTo(Game.flags["rest"],{visualizePathStyle: {stroke: '#3388ff',opacity: 0.3}});
                    return false;
                }
                break;
            default:
                cp.memory.status = "idle"
                this.refreshTarget(cp);
                break;
        }
        return true;
    },
    "refreshTarget": function(cp){
        switch(cp.memory.status){
            case "building":
                var targets = cp.room.find(FIND_MY_CONSTRUCTION_SITES);
                if(targets.length > 0){
                    cp.memory.targetid = helper.getNearestPathByFind(cp,targets);
                    cp.say("Building");
                    return true;
                }else{
                    return false;
                }
                break;
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
            case "idle":
                if(Game.time % 10 == 0){
                    if(cp.store.getUsedCapacity() > 0){
                        var targets = cp.room.find(FIND_MY_CONSTRUCTION_SITES);
                        if(targets.length > 0){
                            cp.memory.targetid = helper.getNearestPathByFind(cp,targets);
                            cp.say("Building");
                            return true;
                        }else{
                            cp.say("Idle");
                            return false;
                        }
                    }else{
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
                            cp.say("Idle");
                            return false;
                        }
                    }
                }else{
                    return false;
                }
                break;
            default:
                cp.memory.status = "idle";
                return false;
        }
    }
}

module.exports = builder;