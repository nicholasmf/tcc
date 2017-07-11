var TestInstructionSet = new InstructionSet();
TestInstructionSet.ADD = new Instruction("ADD", DATA_TYPES.ARITHMETIC, null);
TestInstructionSet.LOAD = new Instruction("LOAD", DATA_TYPES.DATA_TRANSFER, null);
TestInstructionSet.BRANCH_TRUE = new Instruction("BRANCH (true)", DATA_TYPES.CONTROL, null, { branchResult: true, branchTo: 6 });
TestInstructionSet.BRANCH_FALSE = new Instruction("BRANCH (false)", DATA_TYPES.CONTROL, null, { branchResult: false });
TestInstructionSet.DIVIDE = new Instruction("DIVISIBLE", DATA_TYPES.DIVISIBLE, [new MicroInstruction("ADD", DATA_TYPES.ARITHMETIC), new MicroInstruction("ADD", DATA_TYPES.ARITHMETIC)]);