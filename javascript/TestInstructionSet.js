function getValue(elem) //verifica se o elemento eh um, objeto ou outra coisa
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

var TestInstructionSet = new InstructionSet();
TestInstructionSet.ADD = function (op1, op2) 
{
    return new Instruction("ADD", DATA_TYPES.ARITHMETIC, null, { op1: op1, op2: op2}, function() {
        var op2val = getValue (this.params.op2);//chamar getvalue para fazer uma operacao aritmetica com 2 numeros
        var soma = this.params.op1.get() + op2val;// + nao pode dar pau plx (obj com numero nao eh bom nesse caso)
        return soma;//this.params.op1.set(soma);

    }); 
};
TestInstructionSet.LOAD = function (source, dest) 
{ 
    return new Instruction("LOAD", DATA_TYPES.DATA_TRANSFER, null, {source : source, dest : dest}); 
};
TestInstructionSet.BRANCH_TRUE = function (dest)
{
    return new Instruction("BRANCH (true)", DATA_TYPES.CONTROL, null, { branchResult: true, branchTo: dest });
};
TestInstructionSet.BRANCH_FALSE = function () 
{
    return new Instruction("BRANCH (false)", DATA_TYPES.CONTROL, null, { branchResult: false });
};
TestInstructionSet.BRANCH_IF_ZERO = function (source, dest)
{
    return new Instruction("BRANCH IF ZERO", DATA_TYPES.CONTROL, null, { source: source, branchTo: dest }, function()
    {
        if(this.params.source.get() === 0 )
        { 
            this.params.branchResult = true;
        } 
        else {
            this.params.branchResult = false;
        }

        //console.log(this.params.source.get());
    } );
};
// TestInstructionSet.DIVIDE = function ()
// {
//     return new Instruction("DIVISIBLE", DATA_TYPES.DIVISIBLE, [new MicroInstruction("ADD", DATA_TYPES.ARITHMETIC), new MicroInstruction("ADD", DATA_TYPES.ARITHMETIC)]);
// }
TestInstructionSet.SET =  function (register, value) { 
    return new Instruction("SET", DATA_TYPES.DATA_TRANSFER, null, { source: value, dest: register }); 
};
