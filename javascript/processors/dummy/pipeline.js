function fetchExecution(instructions, pc, cycle) {
	if(instructions[pc])
	{
		this.setStepInstruction(instructions[pc].copy());
		this.setStepInstructionCycle(cycle);
		if(instructions[pc].type === DATA_TYPES.CONTROL)
			this.setBranchAlreadyPredicted(false);//para verificar se ja previ o branch, e evita prever de novo se ocorrerem stalls
	}
	else
		this.setStepInstruction(undefined);
}

function decodeExecution(dh, branchPredictor) {
    let instruction = this.getStepInstruction();
    if (instruction && dh) {
        dh.insert(instruction);
    }
	var btbResult;	
	
	if(instruction && instruction.type === DATA_TYPES.CONTROL && !instruction.alreadyPredicted)//para verificar se ja previ o branch se ele ficar parado
	{//preciso executar se eu tiver um preditor ativo e se a instrucao for de branch
		branchPredictorResult = branchPredictor.predict(instruction);//branchPredictorResult recebe endereco de previsao se houver
		console.log("predictor result is: " + branchPredictorResult);
        instruction.btbResult = branchPredictorResult !== undefined;
		this.setBranchAlreadyPredicted(true);
    }
	else
	{
		console.log("predictor result is: dont see branch");
		branchPredictorResult = undefined;
	}
	return branchPredictorResult;
}

function loadExecution() {

}

function executeExecution(branchPredictor) {
	
    let instruction = this.getStepInstruction();
    instruction.executedCycles++;
	
	if(instruction && instruction.type === DATA_TYPES.ARITHMETIC)
	{
		instruction.result = instruction.executethis();
		//console.log("T0: ", instruction.params.dest);
	}
	
	if (instruction && instruction.type === DATA_TYPES.CONTROL) {
		if (instruction.name === "BRANCH IF ZERO") {
			instruction.executethis();
			branchPredictor.update(instruction, instruction.params.branchResult);
		}
    }
}

function storeExecution(dataMemory, dh) {
	
	let instruction = this.getStepInstruction();
	
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
}

function DummyPipe() {
	
	const SimplePipe = this;
	
	var startedFlushingThisCycle;
	var pc = 0;
	var cycle = 0;
	var flushControl = -5;
	var stopFlushControl = -5;
	//var executionReturns = -1;
	var fetchI, decodeI, loadI, executeI, storeI;
	
	
    this.name = "Dummy Pipeline";
	var containerPipeline = $('<div class="container pipeline"></div>');
	$("#pipelineDivGoesBeneath").append(containerPipeline);
	
	this.init = function(dataMemory) {
		SimplePipe.dataMemory = dataMemory;
    }
	

	this.pipeLoop = function(instructions, loopControl, branchPredictor, dependencyHandler)
	{
		console.log("/////////////////////////////////////////");
        let dhRet = dependencyHandler ? dependencyHandler.getExecutables()[0] : null;
        let nextLoadIns = dependencyHandler && decodeI ? ( dhRet === undefined ? new Instruction("NoOp") : dhRet === null ? decodeI : dhRet) : decodeI;
        let stallDecode = nextLoadIns && nextLoadIns.name === "NoOp" && decodeI;
        
        this.store.setStepInstruction( this.load.getStepInstruction() );
		this.load.setStepInstruction( this.execute.getStepInstruction() );
		this.execute.setStepInstruction( this.decode.getStepInstruction() );
		if (!stallDecode) this.decode.setStepInstruction( this.fetch.getStepInstruction() );
		
        /////////////////// execucao das etapas /////////////////////////////
        // var predictionAddr = this.fetch.execution(instructions, pc, cycle, branchPredictor);
        // this.fetch.render(pc);
        // cycle++;
        var predictionAddr;
        if (stallDecode) { SimplePipe.insertNoOp("execute"); }
        else {
            this.fetch.execution(instructions, pc, cycle)
            this.fetch.render(pc);
        }

		fetchI = this.fetch.getStepInstruction();
		decodeI = this.decode.getStepInstruction();
		loadI = this.load.getStepInstruction();
		executeI = this.execute.getStepInstruction();
		storeI = this.store.getStepInstruction();		
        
       //console.log(fetchI, decodeI, loadI, executeI, storeI);

        //executo fetch, pois ele apenas pega a proxima instrucao da memoria
		if(decodeI && !stallDecode)
		{	
			if(decodeI.executeMe)
			{
				console.log("executing decode");
				predictionAddr = this.decode.execution(dependencyHandler, branchPredictor);
			}
			this.decode.render("fetch", containerPipeline);
		}
		
		if(executeI)
		{

			if(executeI.executeMe)
			{
				this.execute.execution(branchPredictor);
				console.log("executing execute");
			}
			if (!stallDecode) this.execute.render("load", containerPipeline);
		}
		
		
		if(loadI)
		{
			
			
			if(loadI.executeMe)
			{
				this.load.execution(pc);
				console.log("executing load");
			}
			
			this.load.render("decode", containerPipeline);
		}
		
		if(storeI)
		{
			if(storeI.executeMe)
			{
				this.store.execution(SimplePipe.dataMemory, dependencyHandler);
				console.log("executing store");
			}
			else
			{
				if (dependencyHandler) dependencyHandler.wb(storeI);
			}
			this.store.render("execute", containerPipeline);
		}	
		
		this.removeHTMLInstruction(600);
		
		/////////////////// fim da execucao das etapas /////////////////////////////
		
		 console.log(this.fetch.getStepInstruction());
		 console.log(this.decode.getStepInstruction());
		 console.log(this.execute.getStepInstruction());
		 console.log(this.load.getStepInstruction());
		 console.log(this.store.getStepInstruction());
		
		//debugger;
		
		//////pipeline flushing control //////////////////////
		if(decodeI && decodeI.type === DATA_TYPES.CONTROL)
		{
			if(predictionAddr)
			{
				if(fetchI)
				{
					fetchI.executeMe = false;
				}
			}
		}
		if(executeI && executeI.type === DATA_TYPES.CONTROL &&  executeI.executeMe/*!(executeI.cycle <= flushControl + 2)*/ )//deve existir uma instrucao em execute
		{//se houver um branch que errei a previsao, devo dar flush
			if(executeI.params.branchResult !== executeI.btbResult)//e esses enderecos nao forem iguais, errei munha previsao
			{
				//console.log("mistakes were made, flushing pipe");
				flushControl = executeI.cycle;//flush control recebe o ciclo da instrucao de branch q causou o flush
				stopFlushControl = cycle;//recebe o ciclo onde o flush foi iniciado
				if(fetchI)
					fetchI.executeMe = false;
				if(decodeI)
					decodeI.executeMe = false;
			}
		}
		
		if(cycle === stopFlushControl + 4)//passaram-se 4 ciclos desde o inicio do flush, posso parar
		{
			flushControl = -5;
			stopFlushControl = -5;
		}
		
		//////end of pipeline flushing control //////////////////////
		console.log(/*"flushControl: " + flushControl +*/ " cycle: " + cycle /*+ " stopFlushControl: " + stopFlushControl*/);
		//////branch & sequential pc control //////////////////////
		if(executeI && executeI.type === DATA_TYPES.CONTROL && executeI.executeMe/*(executeI.cycle === flushControl + 3 || flushControl === -5 || executeI.cycle === flushControl)*/ )
		{//execute tem uma instrucao de branch
			console.log("1: was: " + executeI.params.branchResult + " predicted: " + executeI.btbResult);
			if(executeI.params.branchResult === executeI.btbResult)//eu acertei
            {
				if(predictionAddr)
				{// se houver um novo branch em "decode" ele devera ser executado e tento prevejo seu destino
					pc = predictionAddr;
				}
				else
				{//se nao houver especulacoes, procedo sequencialmente
					if (!stallDecode) pc++;
				}
			}
			else
			{//eu errei a previsao
				if(executeI.params.branchResult)//se eu errei pq houve pulo, previ q nao
				{//pula o pc para a instrucao alvo
					pc = executeI.getTargetAddr();
				}
				else
				{//senao pula o pc para + 1
					pc = executeI.address + 1;
				}
			}
		}
		else
		{
            if(executeI && executeI.type === DATA_TYPES.CONTROL)
			{
				console.log("2: was: " + executeI.params.branchResult + " predicted: " + executeI.btbResult);	
			}
			if(predictionAddr)
            {
                pc = predictionAddr;
            }
            else
            {
                if (!stallDecode) pc++;
            }
		}
		//////end of branch & sequential pc control //////////////////////
		
		if(!stallDecode)
			cycle++;
		
		console.log("pc: " + pc);
		
		if (!(fetchI || executeI || loadI || decodeI || storeI))
		{
//			console.log("no u");
			clearInterval(loopControl);
		}	
	}
	
	
	
	
	
	
	////////////////end of class declaration ///////////////////////////////////////////////////////////////
    this.fetch = new PipelineStep("fetch", fetchExecution);
	this.decode = new PipelineStep("decode", decodeExecution);
	this.load = new PipelineStep("load", loadExecution);
	this.execute = new PipelineStep("execute", executeExecution);
    this.store = new PipelineStep("store", storeExecution);
    
    // Overwrite fetch render
    this.fetch.render = function(pc) {
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
        if (pc > -1) {
            var instruction = this.getStepInstruction();
            //console.log(instruction);
            if (!instruction) { return; }
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
                //console.log(containerPipeline);
                containerPipeline.append(instructionElem);
            }, 60);//talvez nao precise de delay
        }
    }

    // Override execute render - change color to success if executed
    this.execute.render = function(prevStep, containerPipeline) {
        var self = this;
        var count =  containerPipeline.children(`.${prevStep}`).length;
        var instruction = containerPipeline.children(`.${prevStep}:eq(0)`);
        var isFlushing = this.getStepInstruction().cycle - flushControl <= 2;
        if (count) {
            setTimeout(function() {
                instruction.removeClass(prevStep);//muda as caracteristicas do html (abaixo) pra passar cada bloquinho para a proxima etapa
                instruction.addClass(self.getStepName());//"<div class='pipeline-item background-info fetch'>" + instruction.name + "</div>"
                if (instruction.hasClass("background-info") && !isFlushing) {//background info eh "azul"
                    instruction.removeClass("background-info");//retira o azul do bloquinho e coloca verde
                    instruction.addClass("background-success");//nota: essas cores estao no .css              
                }
                else if (instruction.hasClass('background-info') && isFlushing) {
                    instruction.removeClass("background-info");//retira o azul do bloquinho e coloca verde
                    instruction.addClass("background-disabled");//nota: essas cores estao no .css                                  
                }
            }, 80)
        }
    }

    // Remove First element on store step
    this.removeHTMLInstruction = function(delay) {
        var count =  containerPipeline.children(".store").length;
        var instruction = containerPipeline.children(".store:eq(0)");
        var pipeline = $(".pipeline");
        var instructionList = $("#finalList");
        var instructionElem = $("<li class='list-group-item'>" + instruction.text() + "</li>");

        if (instruction.hasClass("background-success")) {
            instructionElem.addClass("list-group-item-success");
        }
        if (instruction.hasClass("background-danger")) {
            instructionElem.addClass("list-group-item-danger");
        }
        if (instruction.hasClass("background-disabled")) {
            instructionElem.addClass("disabled");
        }

        if (count) {
            instruction.addClass("out");
            setTimeout(function() {
                instruction.detach();
                instructionList.append(instructionElem);
                instructionList.animate({
                    scrollTop: instructionList[0].scrollHeight
                }, 200);
            }, delay);
        }
    }

    this.insertNoOp = function(step) {
        let noop = $(`<div class='pipeline-item ${step} background-danger'>NoOp</div>`);
        containerPipeline.append(noop);
    }
}