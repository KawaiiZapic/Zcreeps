/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('func.keepcreeps');
 * mod.thing == 'a thing'; // true
 */
var keep = {
    "keep" : function(){
        var creeps = Game.creeps;
        var spawn = Game.spawns["Sp"];
        var harvsts = _.filter(creeps, (creep) => creep.memory.role == 'harvester');
        var builders = _.filter(creeps, (creep) => creep.memory.role == 'builder');
        for(var role of this.conf.roles){
            var count = _.filter(creeps, (creep) => creep.memory.role == role).length;
            if(count < this.conf.strus[role].keep){
                if(spawn.spawnCreep(this.conf.strus[role].stru,role+"_"+Game.time,{"memory":this.conf.strus[role].mem})==OK){
                    console.log("Start to spawning a "+role+'...('+(count+1)+'/'+this.conf.strus[role].keep+')');
                }
                break;
            }
        }
    },
    "conf" : {
        "roles": ["digger","harvseter","upgrader","builder","cleaner","repairer"],
        "strus":{
            "harvseter":{
                "keep": (function(){return 7})(),
                "stru": [CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],
                "mem": {"role":"harvseter"}
            },
            "builder":{
                "keep": (function(){
                            var spawn = Game.spawns["Sp"];
                            var l = (spawn.room.find(FIND_MY_CONSTRUCTION_SITES).length) * 2;
                            if(l > 20){
                                l = 20;
                            }
                            return l;
                        })(),
                "stru": [WORK,CARRY,CARRY,MOVE,MOVE],
                "mem": {"role":"builder"}
            },
            "upgrader":{
                "keep": 5,
                "stru": [WORK,CARRY,CARRY,MOVE,MOVE],
                "mem": {"role":"upgrader"}
            },
            "cleaner":{
                "keep": 0,
                "stru": [WORK,CARRY,MOVE],
                "mem": {"role":"cleaner"}
            },
            "repairer":{
                "keep": 10,
                "stru": [WORK,CARRY,CARRY,MOVE,MOVE],
                "mem": {"role":"repairer"}
            },
            "digger":{
                "keep": (()=>{if(_.filter(Game.creeps,(cp)=>{return cp.memory.role == "harvester";}).length <= 0){
                                var l = 1;
                            }else{
                                var l = 6;
                            }
                            return l;
                        }),
                "stru": (()=>{if(_.filter(Game.creeps,(cp)=>{return cp.memory.role == "harvester";}).length <= 0){
                                var s = [WORK,CARRY,MOVE];
                            }else{
                                var s = [WORK,WORK,WORK,CARRY,MOVE];
                            }
                            return s;
                        }),
                "mem": {"role":"digger"}
            }
        }
    }
}
module.exports = keep;