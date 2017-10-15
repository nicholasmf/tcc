function P5Pipe() {
    
	const pipeSim = this;
	
	this.name = "P5";
	
	var instruction = null, result = null, lastResult = {};
    var decodeI, loadI, executeI, storeI; //var guarda a instrucao I na etapa n (nI)
	var containerPipeline = $('<div class="container pipeline"></div>');
	
	this.p5cycle = function(BTB, instructions, pc, execution, fillNoop) {

		this.BTB = BTB;
		this.pc = pc;
		this.execution = execution;
		this.fillNoop = fillNoop;
	
	//instruction = sim.fetchStep((BTB.predict(pc) ? BTB.predict(pc) : pc < instructions.length ? pc : -1), instructions);//pega 1 unica instrucao por vez da minha lista de instrucoes		
		var btbResult = decodeI ? BTB.predict(decodeI.address) : undefined;
		if(btbResult && decodeI.type === DATA_TYPES.CONTROL)
		{
			instruction = pipeSim.fetchStep(btbResult, instructions)
			decodeI.btbResult = true;
			pc = btbResult;
			console.log("btbResult:" + btbResult);
		}
		else if(pc < instructions.length)
		{
			instruction = pipeSim.fetchStep(pc, instructions);
		}
		else
		{
			instruction = pipeSim.fetchStep(-1, instructions);
		}
		if(!btbResult && instruction && decodeI)
		{
			decodeI.btbResult = false;
		}
		console.log("T0: " + T0.get() + " T1:" + T1.get());
		
		pipeSim.decode();
		pipeSim.load(loadI);
		pipeSim.store(storeI, lastResult);
		result = pipeSim.execute(executeI);//result eh da instrucao que esta no execute e lastResult eh da instrucao q ta no store
		pipeSim.end(execution, pc);
		console.log(executeI, result, pipeSim.fillNoop);
		/*if (lastResult.pc != null && lastResult.pc != undefined) {
			pc = lastResult.pc;
		}
		else if (pipeSim.fillNoop > 0) {
			pipeSim.fillNoop--;
		}
		else {
			pc = ((pc < instructions.length) && (pc >= 0)) ? pc + 1 : -1;
		}*/
		if(executeI && executeI.type === DATA_TYPES.CONTROL){
			pipeSim.BTB.update(executeI.address, executeI.params.branchTo, executeI.params.branchResult);
			//console.log(executeI.address);
		}
		
		var lastResultReturn = lastResult;
		lastResult = result;
		storeI = executeI;
		executeI = loadI;
		loadI = decodeI;
		decodeI = instruction;
		
		return [result, pipeSim.fillNoop, btbResult];
	}
	
	/*************** Fetch *********************/
    this.fetchStep = function(pc, instructions) {//funcao q desenha as caixinhas a cada iteracao (1s)
		var midCol = $("#pipelineDivGoesBeneath");
		midCol.append(containerPipeline);
        //var pipeline = $('<div class="container pipeline">\n</div>');//$(".pipeline");	
        var instructionList = $("#instructions");
        instructionList.children('.active').removeClass('active');
        // if (pipeSim.fillNoop > 0) {
        //     var instructionElem = $("<div class='pipeline-item background-danger fetch'>NoOp</div>");
        //     setTimeout(function() {
        //         //elem.detach();
        //         pipeline.append(instructionElem);
        //     }, 100);
        //     return new Instruction("NoOp");
        // }
        // else 
        if (pc > -1) {
            var instruction = instructions[pc];
            var instructionElem = $("<div class='pipeline-item background-info fetch'>" + instruction.name + "</div>");
                                    //<div class='formato cor posicao'></div>
            //var elem = instructionList.children(":eq(0)");
            //elem.addClass("out");
            var elem = instructionList.children(`:eq(${pc})`);
            elem.addClass('active');
            $("#instructions").animate({
                scrollTop: 42*(pc-1) - 4
            }, 200);
            setTimeout(function() {
                //elem.detach();
                midCol.append(instructionElem);
            }, 100);//talvez nao precise de delay

            return instructions[pc];//retorna a instrucao na posicao pc
        }
        else { 
            return null;
        }
    }

    /***************** Decode *********************/
    this.decode = function() {//so parte grafica, por enquanto?
        containerPipeline.child = $(".fetch").length;
        var instruction = $(".fetch:eq(0)");
        if (containerPipeline.child) {
            setTimeout(function() {
                instruction.removeClass("fetch");//muda as caracteristicas do html (abaixo) pra passar cada bloquinho para a proxima etapa
                instruction.addClass("decode");//"<div class='pipeline-item background-info fetch'>" + instruction.name + "</div>"
            }, 100)
        }
		//if(decodeI2.executableInV) {
			//useVPipe = pairingCheck(decodeI1, decodeI2);
		//}
		
    }

    this.load = function() {
        containerPipeline.child = $(".decode").length;
        var instruction = $(".decode:eq(0)");
        if (containerPipeline.child) {
            setTimeout(function() {
                instruction.removeClass("decode");//muda as caracteristicas do html pra passar cada bloquinho para a proxima etapa(idem ao anterior)
                instruction.addClass("load");
            }, 100);
        }
    }

    this.execute = function(instruction) {
        var result = {};

        containerPipeline.child = $(".load").length;
        var elem = $(".load:eq(0)");
        var isFlushing = pipeSim.fillNoop === 0;
        if (containerPipeline.child) {
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
			if (instruction && instruction.name === "SET") {
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
					//console.log("gone flushing");
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
        containerPipeline.child = $(".execute").length;
        var elem = $(".execute:eq(0)");
        if (containerPipeline.child) {
            setTimeout(function() {
                elem.removeClass("execute");
                elem.addClass("store");
            }, 100);
        }
		
        if(result.ula != undefined && instruction && instruction.type === DATA_TYPES.ARITHMETIC)
        {
            instruction.params.dest.set(result.ula);
        }
    }

    this.end = function(interval, pc) {
        containerPipeline.child = $(".store").length;
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

        if (containerPipeline.child) {
            instruction.addClass("out");
            setTimeout(function() {
                instruction.detach();
                instructionList.append(instructionElem);
                instructionList.animate({
                    scrollTop: instructionList[0].scrollHeight
                }, 200);
            }, 100);
        }
        else if (pc === -1 && interval) {
            clearInterval(interval);
        }
    }
	
	this.flush = function(cicles) {
		pipeSim.fillNoop = cicles + 1;
		console.log("psfn: " + pipeSim.fillNoop);
    }
}