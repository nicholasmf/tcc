function P5Arq ()
{
	
	//this.BTB = new BTB();
	
	this.p5Arq = function(sim.BTB, instructions, execution){
		var pc = 0;
		p5cycle(sim.BTB, instructions, pc, execution);
	}
		
}