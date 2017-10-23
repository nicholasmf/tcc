// check if a var is an object
function isObject(elem) {
    return (elem !== null && typeof elem === 'object');
}

// Returns value of elem - if elem is Register, calls get method; if elem is number returns itself
function getValue(elem) 
{
    if (elem !== null && typeof elem === 'object')
    {
        return elem.get();
    }
    else
    {
        return elem;
    }
}

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

// Print source and dest name
function logInstruction(instruction) {
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
