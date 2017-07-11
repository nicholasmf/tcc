"use strict";

function Simulator() {
    var self = this;
	var execution;
    this.clear = function() {
		var pipeline = document.getElementsByClassName("pipeline")[0];
		var instructions = document.getElementById("instructions");
		var finalList = document.getElementById("finalList");
		if(execution) {
			clearInterval(execution);
			pipeline.innerHTML = "";
			instructions.innerHTML = "";
			finalList.innerHTML = "";
			//$(pipeline).html("");
			//$(".pipeline").html("");
		}
    }
    this.run = function(instructionSet, instructions) {
        if (!instructionSet || !instructions) { return; }

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
        var pc = 0, lastPc = -1;
        execution = setInterval(function() {
            // if (instructionsList.children[pc]) {
            //     var instruction = instructionsList.children[pc];
            //     instruction.className += " list-group-item-info";
            // }

            // if (instructionsList.children[lastPc]) {
            //     var lastInstruction = instructionsList.children[lastPc];
            //     $(lastInstruction).removeClass('list-group-item-info');
            //     $(lastInstruction).addClass('list-group-item-success');
            // }

            // lastPc = pc;
            // if (instructions[pc] && instructions[pc].type === DATA_TYPES.CONTROL) {
            //     var instruction = instructions[pc];
            //     if (instruction.branchResult) {
            //         pc = instruction.branchTo;
            //     }
            //     else {
            //         pc++;
            //     }
            // }
            // else {
            //     pc++;
            // }

            // if (lastPc === instructions.length) {
            //     clearInterval(execution);
            // }
            self.fetchStep(pc < instructions.length ? pc : -1);
            self.decode();
            self.load();
            self.execute();
            self.store();
            self.end(execution, pc);
            pc++;
        }, 1000);
    }

    this.fetchStep = function(pc) {
        if (pc > -1) {
            var instruction = self.instructions[pc];
            var pipeline = $(".pipeline");
            var instructionList = $("#instructions");
            var instructionElem = $("<div class='pipeline-item fetch'>" + instruction.name + "</div>");

            var elem = instructionList.children(":eq(0)");
            elem.addClass("out");
            setTimeout(function() {
                elem.detach();
                pipeline.append(instructionElem);
            }, 100);
        }
    }

    this.decode = function() {
        var count = $(".fetch").length;
        var instruction = $(".fetch:eq(0)");
        if (count) {
            setTimeout(function() {
                instruction.removeClass("fetch");
                instruction.addClass("decode");
            }, 100)
        }
    }

    this.load = function() {
        var count = $(".decode").length;
        var instruction = $(".decode:eq(0)");
        if (count) {
            setTimeout(function() {
                instruction.removeClass("decode");
                instruction.addClass("load");
            }, 100);
        }
    }

    this.execute = function() {
        var count = $(".load").length;
        var instruction = $(".load:eq(0)");
        if (count) {
            setTimeout(function() {
                instruction.removeClass("load");
                instruction.addClass("execute");
            }, 100);
        }
    }

    this.store = function() {
        var count = $(".execute").length;
        var instruction = $(".execute:eq(0)");
        if (count) {
            setTimeout(function() {
                instruction.removeClass("execute");
                instruction.addClass("store");
            }, 100);
        }
    }

    this.end = function(interval, pc) {
        var count = $(".store").length;
        var instruction = $(".store:eq(0)");
        var pipeline = $(".pipeline");
        var instructionList = $("#finalList");
        var instructionElem = $("<li class='list-group-item'>" + instruction.text() + "</li>");

        if (count) {
            instruction.addClass("out");
            setTimeout(function() {
                instruction.detach();
                instructionList.append(instructionElem);
            }, 100);
        }
        else if (pc === -1) {
            clearInterval(interval);
        }
    }
}