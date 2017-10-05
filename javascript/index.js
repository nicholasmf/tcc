var simulator = new Simulator();
var iSet;

var code = [];

/**** Constants used ******/
const T0 = simulator.tempRegistersArray[0];
const T1 = simulator.tempRegistersArray[1];
const T2 = simulator.tempRegistersArray[2];

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
            iSet.SET(T0, -1),
            iSet.ADD(T0, 1),
            iSet.BRANCH_IF_ZERO(T0, 1),
            iSet.LOAD(),
            iSet.ADD(),
            iSet.LOAD(),
            iSet.ADD(),
            iSet.ADD(),
            iSet.BRANCH_FALSE(),
            iSet.ADD(),
            iSet.LOAD()
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
    }
    else {
        iSet = null;
        code = null;
    }
}

TestInstructionSet.ADD(T0, 2).executethis();
TestInstructionSet.ADD(T1, 6).executethis();
TestInstructionSet.ADD(T0, T1).executethis();
