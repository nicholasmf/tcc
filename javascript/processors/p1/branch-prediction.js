// Branch Target Buffer
function BTB() {
    this.cache = new a4waycache();

    // target address if predict to be taken, undefined otherwise
    this.predict = function(address) {
        let entry = this.cache.search(address);
        if (entry && entry.history > 1) {
            return entry.value;
        }
        else {
            return undefined;
        }
    }

    // update entry on BTB
    this.update = function(address, target, taken) {
        let entry = this.cache.search(address);
        if (entry) {
            let history = entry.history;
            if (taken) {
                if (history === 0) {
                    entry.history = 3;
                }
                else if (history < 3) {
                    entry.history++;
                }
            }
            else {
                if (history > 0) {
                    entry.history--;
                }
            }
        }
        else {
            this.cache.insert(address, target, taken ? 3 : 0);
        }
    }
};

function cacheNode(tag, value, history) {
    this.tag = tag || 0;
    this.value = value || 0;
    this.history = history || 0;
}

// 4 way associative cache
function a4waycache() {
    this.size = 256;
    this.ways = 4;
    this.sets = this.size/this.ways;
    this.cacheArray = [];

    this.insert = function(address, value, counter) {
        let set = address % this.sets;
        let tag = Math.floor(address / this.sets);
        let block = this.cacheArray[set];
        let newNode = new cacheNode(tag, value, counter);
        
        if (!block) {
            this.cacheArray[set] = [newNode];
        }
        else if (block.length === this.ways) { 
            let rand = Math.floor(Math.random() * 4);
            block[rand] = newNode;
        }
        else {
            block.push(newNode);
        }
    }

    // Return undefined if not found or the value
    this.search = function(address) {
        let set = address % this.sets;
        let tag = Math.floor(address / this.sets);

        let block = this.cacheArray[set];

        if (!block) { return undefined; };
        if (block.length === 0) { return undefined; }
        return block.find(node => {
            return node.tag === tag;
        });
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
