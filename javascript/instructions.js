const DATA_TYPES = {
    DATA_TRANSFER: "Data transfer",
    ARITHMETIC: "Arithmetic",
    CONTROL: "Logical and program control",
	DIVISIBLE: "Test uops division"
}

function InstructionSet() {
	
}

var TestInstructionSet = new InstructionSet();
TestInstructionSet.ADD = new Instruction("ADD", DATA_TYPES.ARITHMETIC, null);
TestInstructionSet.LOAD = new Instruction("LOAD", DATA_TYPES.DATA_TRANSFER, null);
TestInstructionSet.BRANCH_TRUE = new Instruction("BRANCH (true)", DATA_TYPES.CONTROL, null, { branchResult: true, branchTo: 6 });
TestInstructionSet.BRANCH_FALSE = new Instruction("BRANCH (false)", DATA_TYPES.CONTROL, null, { branchResult: false });
TestInstructionSet.DIVIDE = new Instruction("DIVISIBLE", DATA_TYPES.DIVISIBLE, [new MicroInstruction("ADD", DATA_TYPES.ARITHMETIC), new MicroInstruction("ADD", DATA_TYPES.ARITHMETIC)]);

function Instruction (name, type, MicroInstruction, params) {
    this.name = name;
    this.type = type;
	this.MicroInstruction = MicroInstruction;
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
