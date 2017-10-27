function fetchExecution(instructions, pc, cycle) {
    let retArray = [];
    let missing = this.missingInstructions();
    for (let i = 0; i < missing; i++) {
        if(instructions[pc + i])
        {
            let newInst = instructions[pc + i].copy();
            newInst.entryOrder = this.count++;
            this.setStepInstruction(newInst);
            if(instructions[pc + i].type === DATA_TYPES.CONTROL)
            {
                newInst.alreadyPredicted = false;//para verificar se ja previ o branch, e evita prever de novo se ocorrerem stalls
            }
        }
        // else {
        //     this.setStepInstruction(undefined);
        // }
    }
    this.setStepInstructionsCycle(cycle);
}

function decodeExecution(dh, branchPredictor) {
    let retArr = [[], []];
    let instructions = this.getStepInstructions();

    instructions.map(instruction => {
        if (!instruction.executeMe) { retArr[0].push(undefined); retArr[1].push(true); return; }
        if (instruction && dh) {
            retArr[1].push(dh.insert(instruction));
        }
        else {
            retArr[1].push(true);
        }
        var btbResult;
        
        if(instruction && instruction.type === DATA_TYPES.CONTROL && !instruction.alreadyPredicted)//para verificar se ja previ o branch se ele ficar parado
        {//preciso executar se eu tiver um preditor ativo e se a instrucao for de branch
            branchPredictorResult = branchPredictor.predict(instruction.address);//branchPredictorResult recebe endereco de previsao se houver
    //		console.log("predictor result is: " + branchPredictorResult);
            instruction.btbResult = branchPredictorResult !== undefined;
            instruction.alreadyPredicted = true;
        }
        else
        {
    //		console.log("predictor result is: dont see branch");
            branchPredictorResult = undefined;
        }
        retArr[0].push(branchPredictorResult);
    });
    return retArr;
}

function loadExecution() {

}

function executeExecution(branchPredictor) {
	
    let instructions = this.getStepInstructions();
    instructions.map(instruction => {
        if (!instruction.executeMe) { return; }
        instruction.executedCycles++;
        
        if(instruction && instruction.type === DATA_TYPES.ARITHMETIC)
        {
            instruction.result = instruction.executethis();
            //console.log("T0: ", instruction.params.dest);
        }
        
        if (instruction && instruction.type === DATA_TYPES.CONTROL) {
            if (instruction.name === "BRANCH IF ZERO") {
                instruction.executethis();
                branchPredictor.update(instruction.address, instruction.params.branchTo, instruction.params.branchResult);
            }
        }
    });
}

function storeExecution(dataMemory, dh) {
	
	let instructions = this.getStepInstructions();

    instructions.map(instruction => {
        if (!instruction.executeMe) { return; }
        if(instruction && instruction.result != undefined && instruction.type === DATA_TYPES.ARITHMETIC)
        {
            instruction.params.dest.set(instruction.result);
        }
        // Load and Store
        if(instruction && instruction.type === DATA_TYPES.DATA_TRANSFER) 
        {
            instruction.executethis(dataMemory);
        }
        if (instruction && dh) {
            dh.wb(instruction);
        }
    });
}

function P6Pipe() {
	
	const SimplePipe = this;
	
	
    const fetch = new P6PipelineStep("fetch", fetchExecution);
	const decode = new P6PipelineStep("decode", decodeExecution);
	const load = new P6PipelineStep("load", loadExecution);
	const execute = new P6PipelineStep("execute", executeExecution);
    const store = new P6PipelineStep("store", storeExecution);
	
	
	var startedFlushingThisCycle;
	var pc = 0;
	var cycle = 0;
	var flushControl = -5;
	var stopFlushControl = -5;
	//var executionReturns = -1;
	var fetchI = [], decodeI = [], loadI = [], executeI = [], storeI = [];
    var dhResult = [];
    var pcOffset;
	
    this.name = "P6 Pipeline";
	var containerPipeline = $('<div class="container pipeline p6"></div>');
	$("#pipelineDivGoesBeneath").append(containerPipeline);
	
	this.init = function(dataMemory) {
		SimplePipe.dataMemory = dataMemory;
    }
	

	this.pipeLoop = function(instructions, loopControl, branchPredictor, dependencyHandler)
	{
//		console.log("/////////////////////////////////////////");
 
        store.getNInstructions(3);
        store.setStepInstruction( execute.getNInstructions(store.missingInstructions()) );
        execute.setStepInstruction( load.getNInstructions(execute.missingInstructions()) );
        let nextLoadIns = undefined;
        if (dependencyHandler) {
            nextLoadIns = dependencyHandler.getExecutables( load.missingInstructions() ).filter(item => { return item !== null });
            decode.getNInstructions(3, function(item) {
                return nextLoadIns.indexOf(item) > -1;
            });
        }
        else {
            decode.getNInstructions( load.missingInstructions() );
        }
        load.setStepInstruction( nextLoadIns );
		decode.setStepInstruction( fetch.getNInstructions( decode.missingInstructions() ) );
		pcOffset = fetch.missingInstructions();
        /////////////////// execucao das etapas /////////////////////////////
        // var predictionAddr = fetch.execution(instructions, pc, cycle, branchPredictor);
        // fetch.render(pc);
        // cycle++;
        var predictionAddr = [];
        fetch.execution(instructions, pc, cycle)
        fetch.render();
        this.removeHTMLInstruction(1200);

		fetchI = fetch.getStepInstructions();
		decodeI = decode.getStepInstructions();
		loadI = load.getStepInstructions();
		executeI = execute.getStepInstructions();
		storeI = store.getStepInstructions();		
        
        console.log(fetchI, decodeI, loadI, executeI, storeI);

        //executo fetch, pois ele apenas pega a proxima instrucao da memoria
		if(!decode.isEmpty())
		{	
//                console.log("executing decode");
            [predictionAddr, dhResult] = decode.execution(dependencyHandler, branchPredictor);
		}
        decode.render("fetch", containerPipeline);
		
		if(!load.isEmpty())
		{
            load.execution(pc);
//				console.log("executing load");
			
        }
        load.render("decode", containerPipeline);
		
		if(!execute.isEmpty())
		{
            execute.execution(branchPredictor);
//				console.log("executing execute");
        }
        execute.render("load", containerPipeline);
				
		if(!store.isEmpty())
		{
            store.execution(SimplePipe.dataMemory, dependencyHandler);
//				console.log("executing store");
			// else
			// {
			// 	if (dependencyHandler) dependencyHandler.wb(storeI);
			// }
		}	
        store.render("execute", containerPipeline);
				
		/////////////////// fim da execucao das etapas /////////////////////////////
		
		//  console.log(fetch.getStepInstruction());
		//  console.log(decode.getStepInstruction());
		//  console.log(load.getStepInstruction());
		//  console.log(execute.getStepInstruction());
		//  console.log(store.getStepInstruction());
		
		//debugger;
		
		//////pipeline flushing control //////////////////////
		if(!decode.isEmpty())
		{
            decode.getStepInstructions().map((instruction, i) => {
                if(instruction.type === DATA_TYPES.CONTROL && predictionAddr[i] && instruction.executeMe)
                {
                    fetch.disableInstructions();
                    decode.disableInstructions(instruction.entryOrder);
                }
            });
		}
//		if(executeI && executeI.type === DATA_TYPES.CONTROL &&  executeI.executeMe/*!(executeI.cycle <= flushControl + 2)*/ )//deve existir uma instrucao em execute
        if (!execute.isEmpty())
        {//se houver um branch que errei a previsao, devo dar flush
            execute.getStepInstructions().map((instruction, i) => {
                if(instruction.type === DATA_TYPES.CONTROL && instruction.executeMe && instruction.params.branchResult !== instruction.btbResult)//e esses enderecos nao forem iguais, errei munha previsao
                {
                    //console.log("mistakes were made, flushing pipe");
//                    flushControl = executeI.cycle;//flush control recebe o ciclo da instrucao de branch q causou o flush
//                    stopFlushControl = cycle;//recebe o ciclo onde o flush foi iniciado
                    fetch.disableInstructions();
                    decode.disableInstructions();
                    load.disableInstructions();
                    if (dependencyHandler) {
                        decode.removeFromDH(dependencyHandler);
                        load.removeFromDH(dependencyHandler);
                    }
                    execute.disableInstructions(instruction.entryOrder);
                }
            });
		}
		
		// if(cycle === stopFlushControl + 4)//passaram-se 4 ciclos desde o inicio do flush, posso parar
		// {
		// 	flushControl = -5;
		// 	stopFlushControl = -5;
		// }
		
		//////end of pipeline flushing control //////////////////////
//		console.log("flushControl: " + flushControl + " cycle: " + cycle + " stopFlushControl: " + stopFlushControl);
        //////branch & sequential pc control //////////////////////
        (function() {
            var decodeInstructions = decode.getStepInstructions();
            var executeInstructions = execute.getStepInstructions();
            var firstPredict = predictionAddr.find((item, i) => { return item !== undefined && decodeInstructions[i].executeMe; });
            var firstMissBranch = executeInstructions.find(instruction => {
                return instruction.type === DATA_TYPES.CONTROL && 
                        instruction.params.branchResult !== instruction.btbResult && 
                        instruction.executeMe;
            });
            if (firstMissBranch) {
                if (firstMissBranch.params.branchResult) {
                    pc = firstMissBranch.getTargetAddr();
                }
                else {
                    pc = firstMissBranch.address + 1;
                }
            }
            else if (firstPredict) {
                pc = firstPredict;
            }
            else {
                pc = pc + pcOffset;
            }
        })();

// 		if(executeI && executeI.type === DATA_TYPES.CONTROL && executeI.executeMe/*(executeI.cycle === flushControl + 3 || flushControl === -5 || executeI.cycle === flushControl)*/ )
// 		{//execute tem uma instrucao de branch
// //			console.log("1: was: " + executeI.params.branchResult + " predicted: " + executeI.btbResult);
// 			if(executeI.params.branchResult === executeI.btbResult)//eu acertei
//             {
// 				if(predictionAddr)
// 				{// se houver um novo branch em "decode" ele devera ser executado e tento prevejo seu destino
// 					pc = predictionAddr;
// 				}
// 				else
// 				{//se nao houver especulacoes, procedo sequencialmente
// 					if (!stallDecode) pc++;
// 				}
// 			}
// 			else
// 			{//eu errei a previsao
// 				if(executeI.params.branchResult)//se eu errei pq houve pulo, previ q nao
// 				{//pula o pc para a instrucao alvo
// 					pc = executeI.getTargetAddr();
// 				}
// 				else
// 				{//senao pula o pc para + 1
// 					pc = executeI.address + 1;
// 				}
// 			}
// 		}
// 		else
// 		{
//             if(executeI && executeI.type === DATA_TYPES.CONTROL)
// 			{
// //				console.log("2: was: " + executeI.params.branchResult + " predicted: " + executeI.btbResult);	
// 			}
// 			if(predictionAddr)
//             {
//                 pc = predictionAddr;
//             }
//             else
//             {
//                 if (!stallDecode) pc++;
//             }
// 		}
		//////end of branch & sequential pc control //////////////////////
		
//		if(!stallDecode)
			cycle++;
		
//		console.log("pc: " + pc);
		
		if (fetch.isEmpty() && execute.isEmpty() && load.isEmpty() && decode.isEmpty() && store.isEmpty())
		{
//			console.log("no u");
			clearInterval(loopControl);
		}	
	}
	
	
	
	
	
	
	////////////////end of class declaration ///////////////////////////////////////////////////////////////
    
    // Overwrite fetch render
    fetch.render = function() {
        		//var midCol = $("#pipelineDivGoesBeneath");
		//midCol.append(containerPipeline);
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
        const pipeStep = this;
        var instructions = this.getStepInstructions();
        var scrollTo = (instructions[0] || {}).address;
        //console.log(instruction);
        instructions.map(instruction => {
            if (instruction.cycle !== cycle) { return; }
            var instructionElem = $(`<div class='pipeline-item background-info fetch ${instruction.cycle}-${instruction.address}'>${instruction.name}</div>`);
            var elem = instructionList.children(`:eq(${instruction.address})`);
            elem.addClass('active');
            setTimeout(function() {
                containerPipeline.append(instructionElem);
            }, 0);//talvez nao precise de delay
        });
        setTimeout(function() {
            pipeStep.offsetRender("fetch", containerPipeline);            
        }, 60);
        if(scrollTo) {
            $("#instructions").animate({
                scrollTop: 42*scrollTo - 4
            }, 200);
        }
    }

    // Override execute render - change color to success if executed
    execute.render = function(prevStep, containerPipeline) {
        var self = this;
        let instructions = this.getStepInstructions();
        instructions.map(instruction => {
            //var count =  containerPipeline.children(`#${prevStep}`).length;
            var elem;
            if (instruction.name === "NoOp") {
                elem = containerPipeline.children(`.noop-${instruction.cycle}`);
            }
            else {
                elem = containerPipeline.children(`.${instruction.cycle}-${instruction.address}`);
            }
            setTimeout(function() {
                elem.removeClass(prevStep);//muda as caracteristicas do html (abaixo) pra passar cada bloquinho para a proxima etapa
                elem.addClass(self.getStepName());//"<div class='pipeline-item background-info fetch'>" + instruction.name + "</div>"
                if (!instruction.executeMe) {
                    elem.removeClass('background-info');
                    elem.addClass('background-disabled');
                }
                else if (elem.hasClass("background-info") /*&& !isFlushing*/) {//background info eh "azul"
                    elem.removeClass("background-info");//retira o azul do bloquinho e coloca verde
                    elem.addClass("background-success");//nota: essas cores estao no .css              
                }
            }, 80);
        });
        setTimeout(() => { self.offsetRender("decode", containerPipeline); }, 80);
    }

    // Remove First element on store step
    this.removeHTMLInstruction = function(delay) {
        let instructions = store.getStepInstructions();
        instructions.map(instruction => {
            var elem;
            if (instruction.name === "NoOp") {
                elem = containerPipeline.children(`.noop-${instruction.cycle}`);
            }
            else {
                elem = containerPipeline.children(`.${instruction.cycle}-${instruction.address}`);
            }

            if (!elem ) { return; }
            var instructionList = $("#finalList");
            var instructionElem = $("<li class='list-group-item'>" + elem.text() + "</li>");

            if (elem.hasClass("background-success")) {
                instructionElem.addClass("list-group-item-success");
            }
            if (elem.hasClass("background-danger")) {
                instructionElem.addClass("list-group-item-danger");
            }
            if (elem.hasClass("background-disabled")) {
                instructionElem.addClass("disabled");
            }

            setTimeout(function() {
                elem.detach();
                instructionList.append(instructionElem);
                instructionList.animate({
                    scrollTop: instructionList[0].scrollHeight
                }, 200);
            }, delay);
            setTimeout(function() {
                elem.addClass("out");            
            }, delay - 200);
        });
        setTimeout(() => { store.offsetRender("store", containerPipeline); }, 80);
    }

    this.insertNoOp = function(step) {
        let noop = $(`<div class='pipeline-item ${step} background-danger noop-${cycle}'>NoOp</div>`);
        containerPipeline.append(noop);
    }

    // this.disableInstruction = function(step) {
    //     let elem = containerPipeline.find(`.${step}`);
    //     elem.removeClass("background-info");
    //     elem.addClass("background-disabled");
    // }
}