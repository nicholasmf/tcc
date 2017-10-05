"use strict";

/******** Pipeline steps *********
 * Fetch
 * Decode
 * Register allocation and renaming
 * microop reordering
 * execution
 * retirement
 */

 // check if a var is an object
function isObject(elem) {
    return (elem !== null && typeof elem === 'object');
}

function Register() {
    const register = this;
    this.value = 0;
    this.get = function() {
        return register.value;
    }
    this.set = function(value) {
        register.value = value;
    }
}

function Simulator() {
    const sim = this;
    var execution;
    
    this.registers = 64;
    this.tempRegisters = 256;

    this.registersArray = [];
    this.tempRegistersArray = [];
    for (let i = 0; i < this.tempRegisters; i++) {
        this.tempRegistersArray[i] = new Register();
    }
    
    this.fillNoop = 0;

    /********* Simulator params
     * registers: number of registers available
     * tempRegisters: number of temporary registers available
     */
    this.init = function(params) {
        this.registers = params.registers || 64;
        this.tempRegisters = params.registers || 256;

        this.registersArray = new Array(this.registers);
        this.tempRegistersArray = new Array(this.tempRegisters);

        this.renderRegistersBank();
    }

    /******************** Clear lists, pipeline and memory *****************/
    this.clear = function() {
		var pipeline = document.getElementsByClassName("pipeline")[0];
		var instructions = document.getElementById("instructions");
		var finalList = document.getElementById("finalList");
		if(execution) {
			clearInterval(execution);
			pipeline.innerHTML = "";
			instructions.innerHTML = "";
			finalList.innerHTML = "";
			//$(pipeline).html("");
			//$(".pipeline").html("");
		}
    }

    this.run = function(instructionSet, instructions) {
        var p1 = new P1();
        console.log(p1.name);
        if (!instructionSet || !instructions) { return; }

        sim.instructionSet = instructionSet;
        sim.instructions = instructions;

        // Render
        var instructionsList = document.getElementById("instructions");
        instructions.map((instruction) => {
            var newItem = document.createElement('li');
            newItem.textContent = instruction.name;
            newItem.className = 'list-group-item';
            instructionsList.appendChild(newItem);
        });

        // Execute
        var pc = 0, lastPc = -1;
        execution = setInterval(function() {
            var instruction = sim.fetchStep((pc < instructions.length ? pc : -1), instructions);
            sim.decode();
            sim.load(instruction);
            var result = sim.execute(instruction);
            sim.store();
            sim.end(execution, pc);
            if (result.pc) {
                pc = result.pc;
            }
            else if (sim.fillNoop > 0) {
                sim.fillNoop--;
            }
            else {
                pc++;
            }
        }, 1000);
    }

    this.flush = function(cicles) {
        console.log(cicles);
        sim.fillNoop = cicles;
    }

    /*************** Fetch *********************/
    this.fetchStep = function(pc, instructions) {
        var pipeline = $(".pipeline");
        if (this.fillNoop > 0) {
            var instructionElem = $("<div class='pipeline-item background-danger fetch'>NoOp</div>");
            setTimeout(function() {
                //elem.detach();
                pipeline.append(instructionElem);
            }, 100);
            return new Instruction("NoOp");
        }
        else if (pc > -1) {
            var instruction = sim.instructions[pc];
            var instructionList = $("#instructions");
            var instructionElem = $("<div class='pipeline-item background-info fetch'>" + instruction.name + "</div>");

            //var elem = instructionList.children(":eq(0)");
            //elem.addClass("out");
            setTimeout(function() {
                //elem.detach();
                pipeline.append(instructionElem);
            }, 100);

            if (instruction.name === "SET") {
                var source = instruction.params.source;
                var dest = instruction.params.dest;
    
                source = isObject(source) ? source.get() : source;
    
                if (!isNaN(source)) {
                    dest.set(source);
                }
                else {
                    dest.set(0);
                }
            }

            return instructions[pc];
        }
        else { 
            return null;
        }
    }

    /***************** Decode *********************/
    this.decode = function() {
        var count = $(".fetch").length;
        var instruction = $(".fetch:eq(0)");
        if (count) {
            setTimeout(function() {
                instruction.removeClass("fetch");
                instruction.addClass("decode");
            }, 100)
        }
    }

    this.load = function() {
        var count = $(".decode").length;
        var instruction = $(".decode:eq(0)");
        if (count) {
            setTimeout(function() {
                instruction.removeClass("decode");
                instruction.addClass("load");
            }, 100);
        }
    }

    this.execute = function(instruction) {
        var result = {};

        var count = $(".load").length;
        var elem = $(".load:eq(0)");
        if (count) {
            setTimeout(function() {
                elem.removeClass("load");
                elem.addClass("execute");

                if (elem.hasClass("background-info")) {
                    elem.removeClass("background-info");
                    elem.addClass("background-success");                    
                }
            }, 100);
        }

        if (instruction && instruction.type === DATA_TYPES.CONTROL) {
            if (instruction.name === "BRANCH IF ZERO") {
                var source = instruction.params.source;
                source = isObject(source) ? source.get() : source;
                instruction.branchResult = source === 0;
            }
            if (instruction.branchResult) {
                result.pc = instruction.branchTo;
                this.flush(3);
            }
        }

        return result;
    }

    this.store = function() {
        var count = $(".execute").length;
        var instruction = $(".execute:eq(0)");
        if (count) {
            setTimeout(function() {
                instruction.removeClass("execute");
                instruction.addClass("store");
            }, 100);
        }
    }

    this.end = function(interval, pc) {
        var count = $(".store").length;
        var instruction = $(".store:eq(0)");
        var pipeline = $(".pipeline");
        var instructionList = $("#finalList");
        var instructionElem = $("<li class='list-group-item'>" + instruction.text() + "</li>");

        if (instruction.hasClass("background-success")) {
            instructionElem.addClass("list-group-item-success");
        }
        if (instruction.hasClass("background-danger")) {
            instructionElem.addClass("list-group-item-danger");
        }

        if (count) {
            instruction.addClass("out");
            setTimeout(function() {
                instruction.detach();
                instructionList.append(instructionElem);
            }, 100);
        }
        else if (pc === -1) {
            clearInterval(interval);
        }
    }
}