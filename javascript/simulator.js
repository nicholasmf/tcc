function Simulator() {
    var self = this;

    this.run = function(instructionSet, instructions) {
        self.instructionSet = instructionSet;
        self.instructions = instructions;
        
        // Render
        var instructionsList = document.getElementById("instructions");
        instructions.map((instruction) => {
            var newItem = document.createElement('li');
            newItem.textContent = instruction.name;
            newItem.className = 'list-group-item';
            instructionsList.appendChild(newItem);
        });
		
		
        // Execute
        var pc = 0; lastPc = -1;
        var execution = setInterval(function() {
            if (instructionsList.children[pc]) {
                var instruction = instructionsList.children[pc];
                instruction.className += " list-group-item-info";
            }

            if (instructionsList.children[lastPc]) {
                var lastInstruction = instructionsList.children[lastPc];
                $(lastInstruction).removeClass('list-group-item-info');
                $(lastInstruction).addClass('list-group-item-success');
            }
            
			if(lastPc !== -1)
			{
				var instruction = instructions[lastPc];
				if(instruction.MicroInstruction) {
					var element = $(instructionsList).children().eq(lastPc+1)[0];
					var deleteelement = $(instructionsList).children().eq(lastPc).detach();
					instructions.splice(lastPc, 1, instruction.MicroInstruction);
					pc--;
					instruction.MicroInstruction.map( function (microinstruction)
					{
						var newItem = document.createElement('li');
						newItem.textContent = microinstruction.name;
						newItem.className = 'list-group-item';
						instructionsList.insertBefore(newItem, element)						
					});
				}
			}
			
			lastPc = pc;
			
			if (instructions[pc] && instructions[pc].type === DATA_TYPES.CONTROL) {
                var instruction = instructions[pc];
                if (instruction.branchResult) {
                    pc = instruction.branchTo;
                }
                else {
                    pc++;
                }
            }
            else {
                pc++;
            }

            if (lastPc === instructions.length) {
                clearInterval(execution);
            }
        }, 1000);
    }
}