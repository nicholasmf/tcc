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
        var instruction = null, result = null, lastResult = {};
        var decodeI, loadI, executeI, storeI; //var guarda a instrucao I na etapa n (nI)

        sim.cicle = function() {   
            //instruction = sim.fetchStep((BTB.predict(pc) ? BTB.predict(pc) : pc < instructions.length ? pc : -1), instructions);//pega 1 unica instrucao por vez da minha lista de instrucoes
			
			var btbResult = decodeI ? sim.BTB.predict(decodeI.address) : undefined;
			if(btbResult && decodeI.type === DATA_TYPES.CONTROL)
			{
				instruction = sim.fetchStep(btbResult, instructions)
				decodeI.btbResult = true;
				pc = btbResult;
				console.log("btbResult:" + btbResult);
			}
			else if(pc < instructions.length)
			{
				instruction = sim.fetchStep(pc, instructions);
			}
			else
			{
				instruction = sim.fetchStep(-1, instructions);
			}
			if(!btbResult && instruction && decodeI)
			{
				decodeI.btbResult = false;
			}
			console.log("T0: " + T0.get() + " T1:" + T1.get());
			
			sim.decode();
            sim.load(loadI);
            sim.store(storeI, lastResult);
            result = sim.execute(executeI);//result eh da instrucao que esta no execute e lastResult eh da instrucao q ta no store
            sim.end(execution, pc);
            console.log(executeI, result, sim.fillNoop);
            if (lastResult.pc != null && lastResult.pc != undefined) {
                pc = lastResult.pc;
            }
            else if (sim.fillNoop > 0) {
                sim.fillNoop--;
            }
            else {
                pc = ((pc < instructions.length) && (pc >= 0)) ? pc + 1 : -1;
            }
			if(executeI && executeI.type === DATA_TYPES.CONTROL){
				sim.BTB.update(executeI.address, executeI.params.branchTo, executeI.params.branchResult);
				//console.log(executeI.address);
			}
            lastResult = result;
            storeI = executeI;
            executeI = loadI;
            loadI = decodeI;
            decodeI = instruction;
        };

        if (sim.timeInterval) {
            execution = setInterval(sim.cicle , sim.timeInterval * 1000);
        }
    }

    this.flush = function(cicles) {
        sim.fillNoop = cicles;
    }

    /*************** Fetch *********************/
    this.fetchStep = function(pc, instructions) {//funcao q desenha as caixinhas a cada iteracao (1s)
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
                                    //<div class='formato cor posicao'></div>
            //var elem = instructionList.children(":eq(0)");
            //elem.addClass("out");
            setTimeout(function() {
                //elem.detach();
                pipeline.append(instructionElem);
            }, 100);//talvez nao precise de delay

            return instructions[pc];//retorna a instrucao na posicao pc
        }
        else { 
            return null;
        }
    }

    /***************** Decode *********************/
    this.decode = function() {//so parte grafica, por enquanto?
        var count = $(".fetch").length;
        var instruction = $(".fetch:eq(0)");
        if (count) {
            setTimeout(function() {
                instruction.removeClass("fetch");//muda as caracteristicas do html (abaixo) pra passar cada bloquinho para a proxima etapa
                instruction.addClass("decode");//"<div class='pipeline-item backgro     und-info fetch'>" + instruction.name + "</div>"
            }, 100)
        }
    }

    this.load = function() {
        var count = $(".decode").length;
        var instruction = $(".decode:eq(0)");
        if (count) {
            setTimeout(function() {
                instruction.removeClass("decode");//muda as caracteristicas do html pra passar cada bloquinho para a proxima etapa(idem ao anterior)
                instruction.addClass("load");
            }, 100);
        }
    }

    this.execute = function(instruction) {
        var result = {};

        var count = $(".load").length;
        var elem = $(".load:eq(0)");
        if (count) {
			var isFlushing = sim.fillNoop === 0;
			setTimeout(function() {
                elem.removeClass("load");
                elem.addClass("execute");

                if (elem.hasClass("background-info") && isFlushing) {//background info eh "azul"
                    elem.removeClass("background-info");//retira o azul do bloquinho e coloca verde
                    elem.addClass("background-success");//nota: essas cores estao no .css              
                }
            }, 100);
        }
		if(isFlushing)
		{
			
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
			
			if(instruction && instruction.type === DATA_TYPES.ARITHMETIC)
			{
				result.ula = instruction.executethis();
			}
			if (instruction && instruction.type === DATA_TYPES.CONTROL) {
				if (instruction.name === "BRANCH IF ZERO") {
					instruction.executethis();
				}
				console.log(instruction.params.branchResult, instruction.btbResult);
				if (instruction.params.branchResult !== instruction.btbResult) {
					this.flush(3);
					if(instruction.params.branchResult)
					{
						result.pc = instruction.getTargetAddr();
					}
					else
					{
						result.pc = instruction.address + 1;
					}
				}
			}	
		}

        return result;
    }

    this.store = function(instruction, result) {
        var count = $(".execute").length;
        var elem = $(".execute:eq(0)");
        if (count) {
            setTimeout(function() {
                elem.removeClass("execute");
                elem.addClass("store");
            }, 100);
        }
		
        if(result.ula != undefined && instruction && instruction.type === DATA_TYPES.ARITHMETIC)
        {
            instruction.params.op1.set(result.ula);
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
        else if (pc === -1 && interval) {
            clearInterval(interval);
        }
    }
}