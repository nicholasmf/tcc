const DATA_TYPES = {
    DATA_TRANSFER: "Data transfer",
    ARITHMETIC: "Arithmetic",
    CONTROL: "Logical and program control",
	DIVISIBLE: "Test uops division"
}

function InstructionSet() {
	
}

function Instruction (name, type, MicroInstruction, params) {
    this.name = name;
    this.type = type;
    this.MicroInstruction = MicroInstruction;
    this.params = params;
    if (params) {
        this.branchResult = params.branchResult;
        this.branchTo = params.branchTo;
    }
}

function MicroInstruction (name, type, params) {
    this.name = name;
    this.type = type;
    if (params) {
        this.branchResult = params.branchResult;
        this.branchTo = params.branchTo;
    }
}
