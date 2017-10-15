/********************** Associative cache ***********************
 * Params:  - size: cache size
 *          - ways: cache ways
 * Methods: - insert
 *          - search
 *          - render
 ****************************************************************/
/*********************** Cache node *****************************/
 function cacheNode(tag, value, history) {
    this.tag = tag || 0;
    this.value = value || 0;
    this.history = history || 0;
}

/************************ Cache *********************************/
 function associativeCache(size, ways) {
    const cache = this;
    this.size = size;
    this.ways = ways;
    this.sets = this.size/this.ways;
    this.cacheArray = []; // Each address represents a block

    // Insert element on cache
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

    // Expects a HTML element to render into
    this.render = function(container) {
        var cacheElement = $("<div></div>");
        var row = $("<div class='row'></div>");
        var col = $("<div class='col-xs-3 no-padding'></div>");

        container.empty();
        var firstRow = row.clone();
        var labels = ["Set", "Tag", "Value", "Status"];
        cacheElement.append(firstRow);
        for (let i = 0; i < labels.length; i++) {
            var colLabel = col.clone().text(labels[i]);
            firstRow.append(colLabel);
        }

        for (let i = 0; i < cache.sets; i++) {
            let block = cache.cacheArray[i];
            let newRow = row.clone();

            let tagText = [];
            let valueText = [];
            let statusText = [];

            for (let j = 0; j < cache.ways; j++) {
                let node = block ? block[j] : undefined;
                tagText.push(node ? node.tag : "0");
                valueText.push(node ? node.value : "0");
                statusText.push(node ? node.history : "0");
            }

            let setCol = col.clone().text(i);
            let tagCol = col.clone().html(tagText.join("<br>"));
            let valueCol = col.clone().html(valueText.join("<br>"));
            let statusCol = col.clone().html(statusText.join("<br>"));

            newRow.append(setCol);
            newRow.append(tagCol);
            newRow.append(valueCol);
            newRow.append(statusCol);

            cacheElement.append(newRow);
        }

        container.append(cacheElement);
    }
}