var Test2InstructionSet = new InstructionSet();
Test2InstructionSet.ADD = new Instruction("ADD", DATA_TYPES.ARITHMETIC, null);
Test2InstructionSet.SUB = new Instruction("SUB", DATA_TYPES.ARITHMETIC, null);
Test2InstructionSet.LOAD = new Instruction("LOAD", DATA_TYPES.DATA_TRANSFER, null);
Test2InstructionSet.BRANCH_TRUE = new Instruction("BRANCH (true)", DATA_TYPES.CONTROL, null, { branchResult: true, branchTo: 6 });
Test2InstructionSet.BRANCH_FALSE = new Instruction("BRANCH (false)", DATA_TYPES.CONTROL, null, { branchResult: false });
Test2InstructionSet.DIVIDE = new Instruction("DIVISIBLE", DATA_TYPES.DIVISIBLE, [new MicroInstruction("ADD", DATA_TYPES.ARITHMETIC), new MicroInstruction("ADD", DATA_TYPES.ARITHMETIC)]);