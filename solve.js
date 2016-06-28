var getNormalString = function(str, constraint, wordBreak) {
    if (!str || typeof str !== 'string' ||
            typeof constraint !== 'number' || isNaN(constraint) || constraint < 1) {
        return str;
    }
    
    constraint = Math.floor(constraint);
    
    var arr = getWordLengths(str, constraint, wordBreak);
    
    if (!arr.length) {
        return '';
    }
    
    var splitters = balancedSplitArray(arr, constraint + 1);
    
    return applySplitters(str, splitters, wordBreak && constraint);
}

function applySplitters(str, splitters, constraint) {
    
    var curSplitter = 0;
    var curSplitterPos = splitters.length && splitters[0];
    var wordNum = -1;
    
    var regex = constraint ? RegExp('\\s*(\\S{1,' + constraint + '})\\s*', 'g') : /\s*(\S+)\s*/g
    
    return str.replace(regex, function(a, word) {
        wordNum++;
        
        if (!wordNum) {
            return word;
        }
        
        if (wordNum === curSplitterPos) {
            curSplitter++;
            curSplitterPos = splitters.length > curSplitter && splitters[curSplitter];
            return '\n' + word;
        }
        
        return ' ' + word;
    });
}

function getWordLengths(str, constraint, splitLongWord) {
    var arr = [];
    
    function addLength(length) {
        if (length > constraint) {
            if (splitLongWord) {
                while (length > constraint) {
                    arr.push(constraint + 1);
                    length -= constraint;
                }
            } else {
                length = constraint;
            }
        }
        if (length > 0) {
            arr.push(length + 1);
        }
    }

    var match, lastIndex = 0;
    var rx = /\s+/g;

    while (match = rx.exec(str)) {
        addLength(match.index - lastIndex);
        lastIndex = rx.lastIndex;
    }

    if (lastIndex < str.length) {
        addLength(str.length - lastIndex);
    }
    
    return arr;
}

function balancedSplitArray(arr, constraint) {
    var i, j;

    var totalLength = 0;
    var sums = [];

    for (i = 0; i < arr.length; ++i) {
        sums.push(totalLength);
        totalLength += arr[i];
    }
    sums.push(totalLength);

    var splittersMax = [];
    
    //------------ splittersMin, splittersMax ------------------------------
    var lastSum = 0;

    for (i = 1; i < sums.length; ++i) {
        if (sums[i] - lastSum > constraint) {
            splittersMax.push(i - 1);
            lastSum = sums[i - 1];
        }
    }
    
    //console.log('\n' + splittedStr(arr, splittersMax));
    
    if (splittersMax.length == 0) {
        return splittersMax;
    }

    lastSum = totalLength;
    var splittersMin = new Array(splittersMax.length);
    var currentGroup = splittersMax.length - 1;
    var matchCount = 0;

    for (i = sums.length - 2; i >= 0; --i) {
        if (lastSum - sums[i] > constraint) {
            splittersMin[currentGroup] = i + 1;
            matchCount += (splittersMin[currentGroup] === splittersMax[currentGroup]) ? 1 : 0;
            currentGroup--;
            lastSum = sums[i + 1];
        }
    }
    
    //console.log('\n' + splittedStr(arr, splittersMin));
    
    if (matchCount === splittersMax.length) {
        //console.log('matchCount');
        return splittersMax;
    }
    
    // -------- calc weights and splitters ---------------------------------
    var length = arr.length;
    var groupCount = splittersMin.length + 1;
    var avgLength = totalLength / groupCount;

    var weights = [];
    var splitters = [];
    var delta;

    for (i = 1; i <= length; ++i) {
        delta = sums[i] - avgLength;
        weights[i] = [0, delta * delta];
        splitters[i] = [];
    }

    var delta1 = (arr[0] - avgLength) * (arr[0] - avgLength);
    for (j = 1; j <= groupCount; ++j) {
        weights[1][j] = delta1;
    }
    
    //var cmpCount = 0; //*******************

    for (j = 2; j <= groupCount; ++j) {
        var minI = Math.max(2, splittersMin[j-1] || splittersMin[j-2]);
        var maxI = Math.min(length, splittersMax[j-1] || length);
        var minX = splittersMin[j-2];
        
        for (i = minI; i <= maxI; ++i) {
            var minCost = Infinity;
            var maxX = Math.min(i - 1, splittersMax[j-2]);
            
            for (var x = minX; x <= maxX; ++x) {
                delta = sums[i] - sums[x] - avgLength;
                var cost = weights[x][j - 1] + delta * delta;
                //cmpCount++; //********************

                if (minCost > cost) {
                    minCost = cost;
                    splitters[i][j] = x;
                }
            }
            weights[i][j] = minCost;
        }
    }
    /*
console.log(weights.map(function(row) {
    return row ? row.join(', ') : '';
}).join('\n'));

console.log(splitters.map(function(row) {
    return row ? row.join(', ') : '';
}).join('\n'));
*/
    while (groupCount > 1) {
        splittersMin[groupCount - 2] = length = splitters[length][groupCount];
        --groupCount;
    }
    
    //console.log('cmpCount', cmpCount);
    //console.log('avgLength', avgLength);
    
    return splittersMin;
}