//essa funcao devera so ser invocada se instruction1.UPipe = true e instruction2.VPipe = true
function pairingCheck (instruction1, instruction2) {
	
	//const pairableBoth = ["MOV", "PUSH", "POP", "LEA", "NOP", "INC", "DEC", "ADD", "SUB", "CMP", "CMP", "AND", "OR", "XOR"];
	//const pairableU = ["ADC", "SBB", "SHR", "SAR", "SHL", "SAL", "ROR", "ROL", "RCR", "RCL"];
	//const pairableV = ["NC", "SJ", "NJ", ]
	//colocar ou uma lista aqui com as instrucoes pareaveis ou colocar uma tag em cada instrucao
	
	//para parear instrucao1 nao pode ser um jump
	if(instruction1.type === "DATA_TYPES.CONTROL")
		return false;

	//verificar condicoes de disputa (rule 2)
	if(instruction1.params.dest !== undefined && typeof instruction1.params.dest === 'object')//se nao for objeto, nao eh registrador
	{
		if(instruction2.params.dest !== undefined && typeof instruction2.params.dest === 'object')//se nao for objeto, nao eh registrador
		{
			if(instruction1.params.dest === instruction2.params.dest)//se o destino de 1 for igual ao destino de 2 ja nao pode parear
			{
				//se fizer registradores parciais, colocar ifs aqui
				return false;
			}
		}
		if(instruction2.params.source !== undefined && typeof instruction2.params.source === 'object')
		{
			if(instruction1.params.dest === instruction2.params.source)//se o destino de 1 for igual a fonte de 2 ja nao pode parear
			{
				//se fizer registradores parciais, colocar ifs aqui
				return false;
			}
		}
		
		return true;
	}
	else
		return true;//else, a instrucao 1 nao tem destino
}
		