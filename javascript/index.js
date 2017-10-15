var simulator = new Simulator();
var iSet;

var code = [];

var architecture = new P5Pipe();

/**** Constants used ******/
const T0 = simulator.tempRegistersArray[0];
const T1 = simulator.tempRegistersArray[1];
const T2 = simulator.tempRegistersArray[2];

function start() {
	simulator.clear();
    simulator.run(iSet, code, architecture);
}

function resume() {
    simulator.resume();
}

function stop() {
    simulator.stop();
}

function nextStep() {
    simulator.nextStep();
}

function setInstructionset() {
    var select = $("#selectInstructionset");
    var value = select.val();

    if (value === "test") {
        iSet = TestInstructionSet;

        code = [
            iSet.SET(T0, 0),
            iSet.BRANCH_IF_ZERO(T0, 5),
            iSet.LOAD(),
            iSet.LOAD(),
			iSet.LOAD(),
			iSet.SET(T1, -4),
            iSet.ADD(T1, 1),
			iSet.BRANCH_IF_ZERO(T1, 9),
			iSet.BRANCH_IF_ZERO(T0, 6),
			iSet.SET(T0, 1),
			iSet.LOAD(),
			iSet.LOAD(),
			iSet.LOAD(),
			
        ];
    }
    else if (value === "test2") {
        iSet = Test2InstructionSet;
		
		code = [
            iSet.SET(T0, 0),
            iSet.BRANCH_IF_ZERO(T0, 5),
            iSet.LOAD(),
            iSet.LOAD(),
			iSet.LOAD(),
			iSet.SET(T1, -4),
            iSet.ADD(T1, 1),
			iSet.BRANCH_IF_ZERO(T1, 9),
			iSet.BRANCH_IF_ZERO(T0, 5),
			iSet.SET(T0, 1),
			iSet.BRANCH_IF_ZERO(T0, 5),
        ];
    }
    else {
        iSet = null;
        code = null;
    }
	
	if(code)
	{
		code.map(function(item, i) {
					item.address = i;
				}
		)
	}
}

function setTimeInterval() {
    var elem = $("#selectTimeInterval").val();
    simulator.setTimeInterval(elem);
}

