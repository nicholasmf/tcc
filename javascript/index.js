var simulator = new Simulator();
var iSet;

var code = [];

var architecture = new P5Pipe();

/**** Constants used ******/
const T0 = simulator.registersArray[0];
const T1 = simulator.registersArray[1];
const T2 = simulator.registersArray[2];
const T3 = simulator.registersArray[3];
const T4 = simulator.registersArray[4];

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

/********** Out of order execution *******/
// let code = [
//     iSet.SET(T0, 0),
//     iSet.BRANCH_IF_ZERO(T0, 5),
//     iSet.LOAD(),
//     iSet.LOAD(),
//     iSet.LOAD(),
//     iSet.SET(T1, -4),
//     iSet.ADD(T1, 1),
//     iSet.BRANCH_IF_ZERO(T1, 9),
//     iSet.BRANCH_IF_ZERO(T0, 6),
//     iSet.SET(T0, 1),
//     iSet.LOAD(),
//     iSet.LOAD(),
//     iSet.LOAD(),
    
// ];

// // Returns if two instructions are true dependent (RaW)
// function checkRaW(i1, i2) {
//     if (i1.type === DATA_TYPES.ARITHMETIC && i2.type === DATA_TYPES.ARITHMETIC) {
//         if (i2.params.dest.name && i1.params.dest.name === i2.params.dest.name) {
//             return true;
//         }
//         if (i2.params.source.name && i1.params.source.name === i2.params.source.name) {
//             return true;
//         }
//     }
//     return false;
// }

// // Returns if two instructions has anti-dependence (WaR)
// function checkWaR(i1, i2) {
//     if (i1.type === DATA_TYPES.ARITHMETIC && i2.type === DATA_TYPES.ARITHMETIC) {
//         if (i2.params.dest.name && i1.params.dest === i2.params.dest) {
//             return true;
//         }
//         if (i2.params.source.name && i1.params.source.name === i2.params.source.name) {
//             return true;
//         }
//     }
// }

// iSet = TestInstructionSet;
// let i1 = iSet.ADD(T0, 1);
// let i2 = iSet.ADD(T1, T0);
// let i3 = iSet.ADD(T1, 2);
// let i4 = iSet.ADD(T2, 2);
// let res = checkRaW(i1, i2);
// console.log(res);
// res = checkRaW(i2, i3);
// console.log(res);
// res = checkRaW(i3, i4);
// console.log(res);
