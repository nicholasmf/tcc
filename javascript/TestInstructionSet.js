var TestInstructionSet = new InstructionSet();
TestInstructionSet.ADD = new Instruction("ADD", DATA_TYPES.ARITHMETIC, null);
TestInstructionSet.LOAD = new Instruction("LOAD", DATA_TYPES.DATA_TRANSFER, null);
TestInstructionSet.BRANCH_TRUE = new Instruction("BRANCH (true)", DATA_TYPES.CONTROL, null, { branchResult: true, branchTo: 6 });
TestInstructionSet.BRANCH_FALSE = new Instruction("BRANCH (false)", DATA_TYPES.CONTROL, null, { branchResult: false });
TestInstructionSet.BRANCH_IF_ZERO = function (source, dest) { return new Instruction("BRANCH IF ZERO", DATA_TYPES.CONTROL, null, { source: source, branchTo: dest }); };
TestInstructionSet.DIVIDE = new Instruction("DIVISIBLE", DATA_TYPES.DIVISIBLE, [new MicroInstruction("ADD", DATA_TYPES.ARITHMETIC), new MicroInstruction("ADD", DATA_TYPES.ARITHMETIC)]);
TestInstructionSet.SET =  function (register, value) { return new Instruction("SET", DATA_TYPES.DATA_TRANSFER, null, { source: value, dest: register }); };