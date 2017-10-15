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

	this.BTB = new BTB();
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

    this.resume = function() {
        if (sim.timeInterval) {
            execution = setInterval(sim.cicle , sim.timeInterval * 1000);
        }
    }

    this.stop = function() {
        if (execution) {
            clearInterval(execution);
        }
    }

    this.nextStep = function() {
        sim.cicle();
    }

    this.setTimeInterval = function(value) {
        sim.timeInterval = value;
    }

    this.run = function(instructionSet, instructions, architecture) {
        if (!instructionSet || !instructions) { return; }

        sim.instructionSet = instructionSet;
        sim.instructions = instructions;
		sim.architecture = architecture;
		
		var pc = 0;
		
        // Render
        var instructionsList = document.getElementById("instructions");
        instructions.map((instruction) => {
            var newItem = document.createElement('li');
            newItem.textContent = instruction.name;
            newItem.className = 'list-group-item';
            instructionsList.appendChild(newItem);
        });

        // Execute
       

        sim.cicle = function() {   
			
			var cycleReturns = architecture.p5cycle(sim.BTB, instructions, pc, execution, sim.fillNoop);
			sim.fillNoop = cycleReturns[1];
			if (cycleReturns[0].pc != null && cycleReturns[0].pc != undefined) {
				pc = cycleReturns[0].pc;
			}
			else if (sim.fillNoop > 0) {
				sim.fillNoop--;
			}
			else {
				pc = ((pc < instructions.length) && (pc >= 0)) ? pc + 1 : -1;
			}
			console.log("pc: " + pc + " LR: " + sim.fillNoop);
			
        };
		if (sim.timeInterval) {
			execution = setInterval(sim.cicle , sim.timeInterval * 1000);
        }
    }
}