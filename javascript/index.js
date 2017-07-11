var simulator = new Simulator();
var iSet;

var code = [];

function start() {
	simulator.clear();
    simulator.run(iSet, code);
}

function setInstructionset() {
    var select = $("#selectInstructionset");
    var value = select.val();

    if (value === "test") {
        iSet = TestInstructionSet;

        code = [
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
        ];
    }
    else if (value === "test2") {
        iSet = Test2InstructionSet;
		
		code = [
            iSet.ADD,
            iSet.SUB,
            iSet.BRANCH_TRUE,
            iSet.LOAD,
            iSet.ADD,
            iSet.LOAD,
            iSet.ADD,
            iSet.ADD,
            iSet.BRANCH_FALSE,
            iSet.ADD,
            iSet.LOAD
        ];
		console.log(code);
    }
    else {
        iSet = null;
        code = null;
    }
}