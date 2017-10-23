function AlwaysTruePredictor() {
    this.predict = function(instruction) {
        return instruction.params.branchTo;
    }
    this.update = function(address, target, taken) {

    }
    this.render = function(container) {

    }
}