var simulator = new Simulator();
var iSet = TestInstructionSet, pipe;

var code = [];

/**** Constants used ******/
const T0 = simulator.registersArray[0];
const T1 = simulator.registersArray[1];
const T2 = simulator.registersArray[2];
const T3 = simulator.registersArray[3];
const T4 = simulator.registersArray[4];

const V0 = simulator.registersArray[50];

function start() {
	//var architecture = new P5Pipe("");
    //var architecture = new P5Arq();
    setPipe();
    setTimeInterval();
    if(code)
	{
		code.map(function(item, i) {
					item.address = i;
				}
		)
	}
	simulator.clear();
    simulator.run(iSet, code, pipe);
	//simulator.run(iSet, code, architecture1);
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

// function setInstructionset() {
//     var select = $("#selectInstructionset");
//     var value = select.val();
	
	
	
// 	if (value === "test") {
//         iSet = TestInstructionSet;
//         code = [
//             iSet.LOADI(T0, 0),
//             iSet.BRANCH_IF_ZERO(T0, 5),
//             iSet.DUMMY(),
//             iSet.DUMMY(),
//             iSet.DUMMY(),
//             iSet.LOADI(T1, -4),
//             iSet.DUMMY(),
//             iSet.ADD(T1, 1),
//             iSet.BRANCH_IF_ZERO(T1, 9),
//             iSet.BRANCH_IF_ZERO(T0, 6),
//             iSet.LOADI(T0, 1),
//             iSet.DUMMY(),
//             iSet.DUMMY(),
//             iSet.DUMMY(),
        
//         ];
//     }
//     else if (value === "test2") {
//         iSet = Test2InstructionSet;
		
// 		code = [
//             iSet.SET(T0, 0),
//             iSet.BRANCH_IF_ZERO(T0, 5),
//             iSet.LOAD(),
//             iSet.LOAD(),
// 			iSet.LOAD(),
// 			iSet.SET(T1, -4),
//             iSet.ADD(T1, 1),
// 			iSet.BRANCH_IF_ZERO(T1, 9),
// 			iSet.BRANCH_IF_ZERO(T0, 5),
// 			iSet.SET(T0, 1),
// 			iSet.BRANCH_IF_ZERO(T0, 5),
//         ];
//     }
//     else {
//         iSet = null;
//         code = null;
//     }
	
// 	if(code)
// 	{
// 		code.map(function(item, i) {
// 					item.address = i;
// 				}
// 		)
// 	}
// }

function setTimeInterval() {
    var elem = $("#selectTimeInterval").val();
    simulator.setTimeInterval(elem);
}

function setBP() {
    var val = $("#selectBP").val();
    var bp;
    if (val === "btb") bp = new BTB();
    else if (val === "apbtb") bp = new AdaptivePredictorBTB();
    simulator.setBP(bp);
}

function setPipe() {
    var val = $("#selectPipe").val();
    if (val === "dummy") pipe = new DummyPipe();
    if (val === "netburst") pipe = new NetburstPipe();
    if (val === "p5") pipe = new P5Arq();
}

function setDH() {
    var val = $("#selectDH").val();
    if (val === "ignore");
    if (val === "stall");
    if (val === "OoO");
    if (val === "OoOrenaming") {
        simulator.setRename(true);
        simulator.setOoO(true);
    }
}

function setCode() {
    var val = $("#selectCode").val();
    if (val === code1) {
        code = [
            iSet.LOADI(T0, 0),
            iSet.BRANCH_IF_ZERO(T0, 5),
            iSet.DUMMY(),
            iSet.DUMMY(),
            iSet.DUMMY(),
            iSet.LOADI(T1, -4),
            iSet.DUMMY(),
            iSet.ADD(T1, 1),
            iSet.BRANCH_IF_ZERO(T1, 9),
            iSet.BRANCH_IF_ZERO(T0, 6),
            iSet.LOADI(T0, 1),
            iSet.DUMMY(),
            iSet.DUMMY(),
            iSet.DUMMY(),
       
       ];
    }
}

/********** Out of order execution *******/
// let code = [
//     iSet.SET(T0, 0),
//     iSet.BRANCH_IF_ZERO(T0, 5),
//     iSet.DUMMY(),
//     iSet.DUMMY(),
//     iSet.DUMMY(),
//     iSet.SET(T1, -4),
//     iSet.ADD(T1, 1),
//     iSet.BRANCH_IF_ZERO(T1, 9),
//     iSet.BRANCH_IF_ZERO(T0, 6),
//     iSet.SET(T0, 1),
//     iSet.DUMMY(),
//     iSet.DUMMY(),
//     iSet.DUMMY(),
    
// ];

// Returns if two instructions are true dependent (RaW)
function checkRaW(i1, i2) {
    let i1dest = isObject(i1.params.dest) ? i1.params.dest : {};
    let i2dest = isObject(i2.params.dest) ? i2.params.dest : {};
    let i2source = isObject(i2.params.source) ? i2.params.source : {};

    if (i2.params.type === DATA_TYPES.ARITHMETIC && i1dest === i2dest) {
        return true;
    }
    if (i1dest === i2source) {
        return true;
    }
    return false;
}

// Returns if two instructions has anti-dependence (WaR)
function checkWaR(i1, i2) {
    let i1dest = isObject(i1.params.dest) ? i1.params.dest : {};
    let i2dest = isObject(i2.params.dest) ? i2.params.dest : {};
    let i1source = isObject(i1.params.source) ? i1.params.source : {};

    if (i1.params.type === DATA_TYPES.ARITHMETIC && i1dest === i2dest) {
        return true;
    }
    if (i1source === i2dest) {
        return true;
    }
    return false;
}

// Returns if two instructions has (WaW)
function checkWaW(i1, i2) {
    let i1dest = isObject(i1.params.dest) ? i1.params.dest : {};
    let i2dest = isObject(i2.params.dest) ? i2.params.dest : {};

    if (i1dest === i2dest) {
        return true;
    }
    return false;
}

code = [
    iSet.LOADI(T0, 0),
    iSet.BRANCH_IF_ZERO(T0, 5),
    iSet.DUMMY(),
    iSet.DUMMY(),
    iSet.DUMMY(),
    iSet.LOADI(T1, -4),
    iSet.DUMMY(),
    iSet.ADD(T1, 1),
    iSet.BRANCH_IF_ZERO(T1, 9),
    iSet.BRANCH_IF_ZERO(T0, 6),
    iSet.LOADI(T0, 1),
    iSet.DUMMY(),
    iSet.DUMMY(),
    iSet.DUMMY(),

];
