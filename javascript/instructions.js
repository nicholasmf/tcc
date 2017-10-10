const DATA_TYPES = {
    DATA_TRANSFER: "Data transfer",
    ARITHMETIC: "Arithmetic",
    CONTROL: "Logical and program control",
	DIVISIBLE: "Test uops division"
}

function InstructionSet() {
	
}

function Instruction (name, type, MicroInstruction, params, executethis) {
    this.name = name;
    this.type = type;
    this.MicroInstruction = MicroInstruction;
    this.params = params;
    this.executethis = executethis;
    if (params) {
        this.branchResult = params.branchResult;//veracidade do jump
        this.branchTo = params.branchTo;//endereco do jump
    }
    if(type === DATA_TYPES.CONTROL)
    {//se a instrucao for do tipo controle, ela tera um metodo especial que retorna o endereco de destino
        var instruction = this;
        this.getTargetAddr = function() 
        {
            return instruction.params.branchTo;
        }
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
