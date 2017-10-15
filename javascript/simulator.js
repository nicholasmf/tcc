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

function Register(name, index) {
    const register = this;
    this.value = 0;
    this.name = name;
    this.index = index;
    this.get = function() {
        return register.value;
    }
    this.set = function(value) {
        register.value = value;

        /****** Update render *****/
        const container = $("#registersContainer .row");
        let elem = container.children().eq(register.index);
        $(elem).find('.panel-body').text(value);
        let panel = elem.children()[0];
        $(panel).removeClass('panel-default');
        $(panel).addClass('panel-info');

        $("#registersContainer").animate({
            scrollTop: (113 * Math.floor(register.index / 12))
        }, 200);

        setTimeout(function() {
            $(panel).removeClass('panel-info');
            $(panel).addClass('panel-default');                
        }, 800);
    }
}

function Simulator() {
    const sim = this;
    var execution;
    
    this.registers = 64;
    this.tempRegisters = 256;

    this.registersArray = [];
    this.tempRegistersArray = [];
    for (let i = 0; i < this.registers; i++) {
        var name = "";
        if (i < 16) {
            name = `T${i}`;
        }
        this.registersArray[i] = new Register(name, i);
    }
    for (let i = 0; i < this.tempRegisters; i++) {
        this.tempRegistersArray[i] = new Register();
    }
	
    this.fillNoop = 0;

	this.BTB = new BTB();
    /********* Simulator params
     * registers: number of registers available
     * tempRegisters: number of temporary registers available
     */
    // this.init = function(params) {
    //     this.registers = params.registers || 64;
    //     this.tempRegisters = params.registers || 256;

    //     this.registersArray = new Array(this.registers);
    //     this.tempRegistersArray = new Array(this.tempRegisters);

    //     this.renderRegistersBank();
    // }

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
        
        sim.renderRegistersBank();
        sim.BTB.render($("#cacheContainer"));
        
        // Execute
       

        sim.cicle = function() {   
			
			var cycleReturns = architecture.p5cycle(sim.BTB, instructions, pc, execution, sim.fillNoop);
            sim.fillNoop = cycleReturns[1];
            if (cycleReturns[2]) {
                pc = cycleReturns[2];
            }
			if (cycleReturns[0].pc != null && cycleReturns[0].pc != undefined) {
				pc = cycleReturns[0].pc;
			}
			// else if (sim.fillNoop > 0) {
			// 	sim.fillNoop--;
			// }
			else {
				pc = ((pc < instructions.length) && (pc >= 0)) ? pc + 1 : -1;
			}
			if (sim.fillNoop > 0) {
                sim.fillNoop--;
			}
			console.log("pc: " + pc + " LR: " + sim.fillNoop);
        };
		if (sim.timeInterval) {
			execution = setInterval(sim.cicle , sim.timeInterval * 1000);
        }
    }

    this.renderRegistersBank = function() {
        const container = $("#registersContainer");
        const row = $("<div class='row'></div>");
        const col = $("<div class='col-xs-1'></div>");
    
        container.empty();

        for (let i = 0; i < sim.registers; i++) {
            let register = sim.registersArray[i];
            let newCol = col.clone();
            let name = register.name ? ("$" + register.name) : i;
            let panel = $(`<div class='panel panel-default'><div class='panel-heading'>${name}</div><div class='panel-body'>${register.get()}</div></div>`)
            newCol.append(panel);
            row.append(newCol);
        }
        container.append(row);
    }
}