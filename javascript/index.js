var simulator = new Simulator();
var iSet;

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
	//var architecture1 = new P5Pipe();
	//var architecture = new P5Arq();
	simulator.clear();
    simulator.run(iSet, code, architecture);
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

function setInstructionset() {
    var select = $("#selectInstructionset");
    var value = select.val();
	
	
	
	if (value === "test") {
        iSet = TestInstructionSet;
		
		/*
        code = [
            iSet.SET(T0, 0),
			iSet.LOAD(),
            iSet.LOAD(),
			iSet.BRANCH_IF_ZERO(T0, 1),
			iSet.SET(T0, 1),
			iSet.LOAD(),
			iSet.LOAD(),
			
        ];
		*/
    
	
	
	
	 code = [
		 iSet.LOADI(T0, 0),
		 iSet.BRANCH_IF_ZERO(T0, 5),
		 iSet.DUMMY(),
		 iSet.DUMMY(),
		 iSet.DUMMY(),
		 iSet.LOADI(T1, -4),
		 iSet.ADD(T1, 1),
		 iSet.BRANCH_IF_ZERO(T1, 9),
		 iSet.BRANCH_IF_ZERO(T0, 6),
		 iSet.LOADI(T0, 1),
		 iSet.DUMMY(),
		 iSet.DUMMY(),
		 iSet.DUMMY(),
    
	];
	
	
		/*
        code = [
            iSet.ADD(T1, 5),
            iSet.ADD(T0, 4),
            iSet.ADD(T0, T1),
            iSet.STORE(-4, 15),
            iSet.LOADI(T0, 0),
            iSet.BRANCH_IF_ZERO(T0, 5),
            iSet.DUMMY(),
            iSet.DUMMY(),
			iSet.LOAD(T1, 15),
            iSet.ADD(T1, 1),
			iSet.BRANCH_IF_ZERO(T1, 9),
			iSet.BRANCH_IF_ZERO(T0, 6),
            iSet.LOADI(T0, 1),
            iSet.ADD(V0, 4),
			iSet.DUMMY(),
			iSet.DUMMY(),
			iSet.DUMMY(),
        ];
		*/
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

	iSet = TestInstructionSet;
	 code = [
		 iSet.LOADI(T0, -1),
		 iSet.DUMMY(),
		 iSet.DUMMY(),
		 iSet.DUMMY(),
		 iSet.ADD(T0, 1),
		 iSet.DUMMY(),
		 iSet.DUMMY(),
		 iSet.DUMMY(),
		 iSet.BRANCH_IF_ZERO(T0, 1),
		 iSet.LOADI(T1, 9),

		 
	];

window.onload = function() { 
    var myPipe = new DummyPipe(code);    
    var dataMem = new DataMemory(64);
    simulator.renderRegistersBank();
    dataMem.render();

    // List Render -- Remover apos integracao com simulator
    var instructionsList = document.getElementById("instructions");
    code.map((instruction) => {
        var newItem = document.createElement('li');
        newItem.textContent = instruction.name;
        newItem.className = 'list-group-item';
        instructionsList.appendChild(newItem);
    });
}
myPipe.init(dataMem);