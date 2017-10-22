function fetchExecution(instructions, pc, cycle) {
	this.setStepInstruction(instructions[pc]);
	this.setStepInstructionCycle(cycle);
}

function decodeExecution() {
	
}

function loadExecution() {
	
}

function executeExecution(pc) {
	
	var branchDestination = -1;
	instruction = this.getStepInstruction();
	
	if(instruction && instruction.type === DATA_TYPES.ARITHMETIC)
	{
		instruction.result = instruction.executethis();
		//console.log("T0: ", instruction.params.dest);
	}
	
	if (instruction && instruction.type === DATA_TYPES.CONTROL) {
		if (instruction.name === "BRANCH IF ZERO") {
			instruction.executethis();
		}
		//console.log(instruction.params.branchResult);
		if (instruction.params.branchResult && instruction.params.branchTo !== pc + 1)
		{
			branchDestination = instruction.params.branchTo;
			flushCycleControl = instruction.cycle
			//comeco a dar flush se a previsao foi errada
			//console.log("gone flushing");
		}
	}
	
	//retorna o endereco do branch, se houver
	return [branchDestination];
}

function storeExecution(dataMemory) {
	
	instruction = this.getStepInstruction();
	
	if(instruction && instruction.result != undefined && instruction.type === DATA_TYPES.ARITHMETIC)
	{
		instruction.params.dest.set(instruction.result);
	}
	// Load and Store
	if(instruction && instruction.type === DATA_TYPES.DATA_TRANSFER) 
	{
		instruction.executethis(dataMemory);
	}
}

function DummyPipe() {
	
	const SimplePipe = this;
	
	var pc = 0;
	var cycle = 0;
	var flushControl = -4;
	var executionReturns = -1;
	
    this.name = "Dummy Pipeline";
	var containerPipeline = $('<div class="container pipeline"></div>');
	$("#pipelineDivGoesBeneath").append(containerPipeline);
	
	this.init = function(dataMemory) {
		SimplePipe.dataMemory = dataMemory;
    }
	

	this.pipeLoop = function(instructions, loopControl)
	{
		executionReturns = -1;
		
		this.store.setStepInstruction( this.execute.getStepInstruction() );//avanca as instrucoes nas etapas
		this.execute.setStepInstruction( this.load.getStepInstruction() );
		this.load.setStepInstruction( this.decode.getStepInstruction() );
		this.decode.setStepInstruction( this.fetch.getStepInstruction() );
		
		/////////////////// execucao das etapas /////////////////////////////
        this.fetch.execution(instructions, pc, cycle);
        this.fetch.render(pc);
		cycle++;

		//executo fetch, pois ele apenas pega a proxima instrucao da memoria
		if(this.decode.getStepInstruction())
		{
			if(this.decode.getStepInstruction().cycle <= flushControl + 3)
			{}
			else
			{
				this.decode.execution();
				//console.log("executing decode");
			}
			this.decode.render("fetch", containerPipeline);
		}
		
		
		if(this.load.getStepInstruction())
		{
			if(this.load.getStepInstruction().cycle <= flushControl + 3)
			{}
			else
			{
				this.load.execution(pc);
				console.log("executing load");
			}
			this.load.render("decode", containerPipeline);
		}
		
		if(this.execute.getStepInstruction())
		{
			if(this.execute.getStepInstruction().cycle <= flushControl + 3)
			{}
			else
			{
				executionReturns = this.execute.execution();//execution returns retorna o destino do branch tomado, -1 se nao houverem branchs
				//console.log("executing execute");
			}
			this.execute.render("load", containerPipeline);
		}
		
		if(this.store.getStepInstruction())
		{
			if(this.store.getStepInstruction().cycle <= flushControl + 3 && this.store.getStepInstruction().cycle != flushControl)
			{}
			else
			{
				this.store.execution(SimplePipe.dataMemory);
				//console.log("executing store");
			}
			this.store.render("execute", containerPipeline);
		}	
		
		this.removeHTMLInstruction(800);
		
		/////////////////// fim da execucao das etapas /////////////////////////////
		/*
		console.log(this.fetch.getStepInstruction());
		console.log(this.decode.getStepInstruction());
		console.log(this.load.getStepInstruction());
		console.log(this.execute.getStepInstruction());
		console.log(this.store.getStepInstruction());
		console.log("/////////////////////////////////////////");
		debugger;
		*/
		//////pipeline flushing control //////////////////////
		if(executionReturns != -1)
		{
			flushControl = this.execute.getStepInstruction().cycle;//flush control recebe o ciclo da instrucao de branch q causou o flush
		}
		if(this.store.getStepInstruction())
		{
			if(cycle === flushControl + 3)
				flushControl = -4;
		}
		//////end of pipeline flushing control //////////////////////
		
		//////branch & sequential pc control //////////////////////
		if(executionReturns != -1)
		{
			pc = executionReturns;
		}
		else
		{
			pc++;
		}
		//////end of branch & sequential pc control //////////////////////
		
		if (!(this.fetch.getStepInstruction() || this.execute.getStepInstruction() || this.load.getStepInstruction() || this.decode.getStepInstruction() || this.store.getStepInstruction()))
		{
			console.log("no u");
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
            console.log(instruction);
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
                console.log(containerPipeline);
                containerPipeline.append(instructionElem);
            }, 60);//talvez nao precise de delay
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
}