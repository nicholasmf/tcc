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


function P5Arq ()
{
	
	const simArq = this;
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
	
	this.p5Arq = function(){
		
		var p5CycleReturns = p5cycle(simArq.BTB, instructions, pc, execution, simArq.fillNoop);
		simArq.fillNoop = cycleReturns[1];
		if (cycleReturns[0].pc != null && cycleReturns[0].pc != undefined) {
			pc = cycleReturns[0].pc;
		}
		else if (simArq.fillNoop > 0) {
			simArq.fillNoop--;
		}
		else {
			pc = ((pc < instructions.length) && (pc >= 0)) ? pc + 1 : -1;
		}
	}
	
	
	
	
	
	/*	sim.cicle = function() {   
		
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
		
	};*/
	
	
	
}