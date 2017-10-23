// Branch Target Buffer
function BTB() {
    this.cache = new associativeCache(256, 4);
    
    // target address if predict to be taken, undefined otherwise
    this.predict = function(instruction) {
        let entry = this.cache.search(instruction.address);
        if (entry && entry.history > 1) {
            return entry.value;
        }
        else {
            return undefined;
        }
    }

    // update entry on BTB
    this.update = function(instruction, taken) {
        let address = instruction.address;
        let target = instruction.params.brachTo;
        let entry = this.cache.search(address);
        if (entry) {
            let history = entry.history;
            if (taken) {
                if (history === 0) {
                    this.cache.update(address, {history: 3});
                }
                else if (history < 3) {
                    this.cache.update(address, {history: history + 1});
                }
            }
            else {
                if (history > 0) {
                    this.cache.update(address, {history: history - 1});
                }
            }
        }
        else {
            this.cache.insert(address, target, taken ? 3 : 0);
        }
    }

    // Render BTB
    this.render = function(container) {
        this.cache.render(container);
    }
};


/******** testing BTB *********/
// let predictor = new BTB();
// console.log(predictor.predict(3));
// predictor.update(3, 9, true);
// console.log(predictor.predict(3));
// predictor.update(3, 9, false);
// console.log(predictor.predict(3));
// predictor.update(3, 9, false);
// console.log(predictor.predict(3));
// predictor.update(3, 9, false);
// console.log(predictor.predict(3));
// predictor.update(3, 9, true);
// console.log(predictor.predict(3));
// predictor.update(3, 9, false);
// console.log(predictor.predict(3));
// predictor.update(3, 9, false);
// console.log(predictor.predict(3));
// predictor.update(3, 9, true);
// console.log(predictor.predict(3));
// predictor.update(3, 9, false);
// console.log(predictor.predict(3));
