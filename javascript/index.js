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
	var architecture = new P5Pipe();
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

/// Architected register file - holds pointers to PRF registers
function ARF() {
    var size = 64;
    var memory = [];
    var prf = new PRF();

    // Updates a registers pointer and return new register
    this.update = function(register) {
        let i = register.index;
        let value = register.get();
        if (!memory[i]) memory[i] = [];
        let tempI = prf.insert(value);
        memory[i].push(tempI);
        return prf.get(tempI);
    }

    // Get correspondent of a register
    this.get = function(register) {
        let i = register.index;
        let last = memory[i].length - 1;
        let prfI = memory[i][last];
        return prf.get(prfI);
    }
}

// Physical register file - stores data
function PRF() {
    var size = 256;
    var memory = simulator.tempRegistersArray;
    var pos = 0;

    // Insert new register
    this.insert = function(value) {
        memory[pos++].set(value);
        return pos-1;
    }

    // Get register of address
    this.get = function(address) {
        return memory[address];
    }
}

// Rename registers from instruction
function rename(instruction, arf) {
    let dest = isObject(instruction.params.dest) ? instruction.params.dest : undefined;
    let source = isObject(instruction.params.source) ? instruction.params.source : undefined;
    let source1 = isObject(instruction.params.source1) ? instruction.params.source1 : undefined;
    let source2 = isObject(instruction.params.source2) ? instruction.params.source2 : undefined;
    
    if (source) {
        instruction.params.source = arf.get(source);
    }
    if (source1) {
        var temp = arf.get(source1);
        instruction.params.source1 = temp || source1.get();
    }
    if (source2) {
        var temp = arf.get(source2);
        instruction.params.source2 = temp || source2.get();
    }
    if (dest) {
        instruction.params.dest = arf.update(dest);
    }

}

// Print source and dest name
function log(instruction) {
    let dest = isObject(instruction.params.dest) ? instruction.params.dest.name : instruction.params.dest;
    let source = isObject(instruction.params.source) ? instruction.params.source.name : instruction.params.source;
    let source1 = isObject(instruction.params.source1) ? instruction.params.source1.name : instruction.params.source1;
    let source2 = isObject(instruction.params.source2) ? instruction.params.source2.name : instruction.params.source2;
    let log = "";

    if (dest) {
        log += "d: " + dest + " ";
    }
    if (source) {
        log += "s: " + source;
    }
    if (source1) {
        log += "s1: " + source1 + " ";
    }
    if (source2) {
        log += "s2: " + source2;
    }
    if (log) console.log(log);
}

let arf = new ARF();
iSet = Test2InstructionSet;
let i1 = iSet.ADD(T0, 1);
let i2 = iSet.ADD(T1, T0);
let i3 = iSet.ADD(T1, 2);
let i4 = iSet.ADD(T2, 2);
let b1 = iSet.BRANCH_IF_ZERO(T0, 3);
let b2 = iSet.BRANCH_IF_ZERO(T1, 6);
let m1 = iSet.LOAD(T0, 1);
let m2 = iSet.LOAD(T0, 2);
let res;
code = [
    iSet.LOADI(T0, 3),
    iSet.LOADI(T1, 5),
    iSet.ADD(T2, T0, T1),
    iSet.ADD(T0, T0, 2)
];

function MiniPipe() {
    const pipe = this;
    var fetch, decode, load, execute, store;
    var pc = 0, result = {}, lastResult = {}, step;

    this.run = function() {
        pc = 0;
        result = {};
        lastResult = {};
        fetch = decode = load = execute = store = undefined;
        step = 0;

        while ((!(fetch === decode === load === execute === store === null) && pc < code.length)) {
            pipe.cycle();
            console.log(step);
        }
    }

    this.cycle = function() {
        // Fetch
        if (pc < code.length)
            fetch = code[pc++];
        else fetch = undefined;

        // Decode
        if (decode)
            rename(decode, arf);

        // Load

        // Execute
        if (execute) {
            if (execute.type === DATA_TYPES.DATA_TRANSFER) {
                result.ula = execute.executethis();
            }
        }

        // Write back
        if (store) {
            if (store.type === DATA_TYPES.DATA_TRANSFER) {
                store.params.dest.set(result.ula);
            }
            if (store.type === DATA_TYPES.ARITHMETIC) {
                store.executethis();
            }
            log(store);
        }

        lastResult = result;
        store = execute;
        execute = load;
        load = decode;
        decode = fetch;
        fetch = undefined;

        step++;
    }
}

let pipe = new MiniPipe();
//pipe.run();
// res = checkRaW(i1, i2);
// console.log(res);
// res = checkRaW(i2, i3);
// console.log(res);
// res = checkRaW(i3, i4);
// console.log(res);
// res = checkWaR(i2, i1);
// console.log(res);
// res = checkWaW(m1,i3);
// console.log(res);
// rename(i1, arf);
// log(i1);
// rename(b1, arf);
// log(b1);
// rename(i2, arf);
// log(i2);
// rename(m1, arf);
// log(m1);


window.onload = function() {
    simulator.renderRegistersBank();
    pipe.run();
}
