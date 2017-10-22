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
	//retorna se devo dar flush no pipe e o endereco do branch, se houver
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


function DummyPipe(instructions) {
	
	const SimplePipe = this;
	
	var pc = 0;
	var cycle = 0;
	var flushControl = -4;
	var executionReturns = -1;
	
    this.name = "Dummy Pipeline";

	
	this.init = function(dataMemory) {
		SimplePipe.dataMemory = dataMemory;
    }
	
	////////////////////////////////////////////////////////////////////////////////////////////////
    this.fetch = new PipelineStep("fetch", fetchExecution);
	this.decode = new PipelineStep("decode", decodeExecution);
	this.load = new PipelineStep("load", loadExecution);
	this.execute = new PipelineStep("execute", executeExecution);
	this.store = new PipelineStep("store", storeExecution);
	
	do 
	{
		executionReturns = -1;
		
		this.store.setStepInstruction( this.execute.getStepInstruction() );//avanca as instrucoes nas etapas
		this.execute.setStepInstruction( this.load.getStepInstruction() );
		this.load.setStepInstruction( this.decode.getStepInstruction() );
		this.decode.setStepInstruction( this.fetch.getStepInstruction() );
		
		/////////////////// execucao das etapas /////////////////////////////
		this.fetch.execution(instructions, pc, cycle);
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
		}
		
		if(this.load.getStepInstruction())
		{
			if(this.load.getStepInstruction().cycle <= flushControl + 3)
			{}
			else
			{
				this.load.execution(pc);
				//console.log("executing load");
			}
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
		}	
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
			
	}while (this.fetch.getStepInstruction() || this.execute.getStepInstruction() || this.load.getStepInstruction() || this.decode.getStepInstruction() || this.store.getStepInstruction())
}