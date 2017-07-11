window.onload = function() {
    var simulator = new Simulator();
    var iSet = TestInstructionSet;

    var code = [
        iSet.ADD,
        iSet.DIVIDE,
        iSet.BRANCH_TRUE,
        iSet.LOAD,
        iSet.ADD,
        iSet.LOAD,
        iSet.ADD,
        iSet.ADD,
        iSet.BRANCH_FALSE,
        iSet.ADD,
        iSet.LOAD
    ]
	
    simulator.run(TestInstructionSet, code);
};