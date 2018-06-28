var i = 0;
var s = -1;

var pStack = [];
var dStack = [];
var mStack = [];

var labels = {};

var instructionDefinitions = [];


$('#code-input').html(window.localStorage.getItem("mepa_code"));


function storeCode() {
    console.log('Code saved!');
    window.localStorage.setItem("mepa_code", $('#code-input').val());
}

// OVER-ENGINEERING
function Stack(tableName, tableSelector) {
    this.data = [];
    this.tableName = tableName;
    this.tableSelector = tableSelector;
    this.tableElement = undefined;

    this.boot = function () {
        this.tableElement = $(this.tableSelector);
    };

    this.push = function (value) {
        this.tableElement.append(`<tr id="${this.tableName}-${this.data.length}"><td>${value}</td></tr>`);
        this.data.push(value);
    };

    this.pop = function () {
        this.data.pop();
        $('#' + this.tableName + '-' + this.data.length).remove();
    };

    this.set = function (index, value) {
        this.data[index] = value;
        $('#' + this.tableName + '-' + index + '>tr>td').html(value);
    }
}

function InstructionDefinition(name, params, code) {
    this.name = name;
    this.code = code;
    this.params = params;
}

function Instruction(name, p1, p2, p3) {
    this.name = name;
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;

    this.getParameterCount = function () {
        var c = 0;

        if (this.p1 !== undefined) c++;
        if (!isNaN(this.p2) && this.p2 !== undefined) c++;
        if (!isNaN(this.p3) && this.p3 !== undefined) c++;

        return c;
    };

    this.getInstructionDefinition = function () {
        for (var i = 0; i < instructionDefinitions.length; i++) {
            if (instructionDefinitions[i].name === this.name) {
                return instructionDefinitions[i];
            }
        }

        return undefined;
    };

    this.execute = function () {
        var def = this.getInstructionDefinition();

        if (def === undefined) {
            console.error(`Could not find instruction definition for ${this.name}`)
        }

        if (this.getParameterCount() !== def.params) {
            console.error(`Instruction ${this.name} is missing some parameters received ${this.getParameterCount()} out of ${def.params}`)
        }

        def.code(p1, p2, p3);
    }
}

instructionDefinitions.push(new InstructionDefinition('CRCT', 1, function (p1, p2, p3) {
    s = s + 1;
    mStack[s] = p1;
}));

instructionDefinitions.push(new InstructionDefinition('CRVL', 2, function (p1, p2, p3) {
    s = s + 1;
    mStack[s] = mStack[dStack[p1] + p2];
}));

instructionDefinitions.push(new InstructionDefinition('ARMZ', 2, function (p1, p2, p3) {
    mStack[dStack[p1] + p2] = mStack[s]
    s = s - 1;
    mStack.pop()
}));

instructionDefinitions.push(new InstructionDefinition('SOMA', 0, function (p1, p2, p3) {
    mStack[s - 1] = mStack[s - 1] + mStack[s];
    s = s - 1;
}));

instructionDefinitions.push(new InstructionDefinition('SUBT', 0, function (p1, p2, p3) {
    mStack[s - 1] = mStack[s - 1] - mStack[s];
    s = s - 1;
}));

instructionDefinitions.push(new InstructionDefinition('MULTI', 0, function (p1, p2, p3) {
    mStack[s - 1] = mStack[s - 1] * mStack[s];
    s = s - 1;
}));

instructionDefinitions.push(new InstructionDefinition('DIVI', 0, function (p1, p2, p3) {
    mStack[s - 1] = Math.floor(mStack[s - 1] / mStack[s]);
    s = s - 1;
}));

instructionDefinitions.push(new InstructionDefinition('INVR', 0, function (p1, p2, p3) {
    mStack[s] = -mStack[s];
}));

instructionDefinitions.push(new InstructionDefinition('NEGA', 0, function (p1, p2, p3) {
    if (mStack[s] === 1) {
        mStack[s] = 0
    } else if (mStack[s] === 0) {
        mStack[s] = 1;
    } else {
        console.log('Binary operation on decimal value')
    }
}));

instructionDefinitions.push(new InstructionDefinition('CONJ', 0, function (p1, p2, p3) {
    if (mStack[s] === 1 && mStack[s - 1] === 1) {
        mStack[s - 1] = 1
    } else {
        mStack[s] = 0;
    }
    s = s - 1;
    mStack.pop();
}));

instructionDefinitions.push(new InstructionDefinition('DISJ', 0, function (p1, p2, p3) {
    if (mStack[s] === 1 || mStack[s - 1] === 1) {
        mStack[s - 1] = 1
    } else {
        mStack[s] = 0;
    }
    s = s - 1;
    mStack.pop();
}));

instructionDefinitions.push(new InstructionDefinition('CMME', 0, function (p1, p2, p3) {
    if (mStack[s - 1] < mStack[s]) {
        mStack[s - 1] = 1
    } else {
        mStack[s - 1] = 0;
    }

    s = s - 1;
    mStack.pop()
}));

instructionDefinitions.push(new InstructionDefinition('CMEG', 0, function (p1, p2, p3) {
    if (mStack[s - 1] <= mStack[s]) {
        mStack[s - 1] = 1
    } else {
        mStack[s - 1] = 0;
    }

    s = s - 1;
    mStack.pop()
}));

instructionDefinitions.push(new InstructionDefinition('CMMA', 0, function (p1, p2, p3) {
    if (mStack[s - 1] > mStack[s]) {
        mStack[s - 1] = 1
    } else {
        mStack[s - 1] = 0;
    }

    s = s - 1;
    mStack.pop()
}));

instructionDefinitions.push(new InstructionDefinition('CMAG', 0, function (p1, p2, p3) {
    if (mStack[s - 1] >= mStack[s]) {
        mStack[s - 1] = 1
    } else {
        mStack[s - 1] = 0;
    }

    s = s - 1;
    mStack.pop()
}));

instructionDefinitions.push(new InstructionDefinition('CMIG', 0, function (p1, p2, p3) {
    if (mStack[s - 1] === mStack[s]) {
        mStack[s - 1] = 1
    } else {
        mStack[s - 1] = 0;
    }

    s = s - 1;
    mStack.pop()
}));

instructionDefinitions.push(new InstructionDefinition('CMDG', 0, function (p1, p2, p3) {
    if (mStack[s - 1] !== mStack[s]) {
        mStack[s - 1] = 1
    } else {
        mStack[s - 1] = 0;
    }

    s = s - 1;
    mStack.pop()
}));

instructionDefinitions.push(new InstructionDefinition('IMPR', 0, function (p1, p2, p3) {
    console.log(`Printing stack at ${s}`);
    $('#output').append(`<p>${mStack[s]}</p>`)
    s = s - 1;
}));


instructionDefinitions.push(new InstructionDefinition('LEIT', 0, function (p1, p2, p3) {
    s = s + 1;
    mStack[s] = Math.round(Math.random() * 10);
}));

instructionDefinitions.push(new InstructionDefinition('DSVS', 1, function (p1, p2, p3) {
    if (!$.isNumeric(p1)) {
        p1 = labels[p1];
    }
    i = p1 - 1; // must subtract since at the end of each inst i++
}));

instructionDefinitions.push(new InstructionDefinition('DSVF', 1, function (p1, p2, p3) {
    if (!$.isNumeric(p1)) {
        p1 = labels[p1];
    }

    if (mStack[s] == 0) {
        i = p1 - 1; // must subtract since at the end of each inst i++
    }

    s = s - 1;
}));

instructionDefinitions.push(new InstructionDefinition('NADA', 0, function (p1, p2, p3) {

}));
instructionDefinitions.push(new InstructionDefinition('AMEM', 1, function (p1, p2, p3) {
    s = s + p1;
}));
instructionDefinitions.push(new InstructionDefinition('DMEM', 1, function (p1, p2, p3) {
    s = s - p1;
}));

instructionDefinitions.push(new InstructionDefinition('CHPR', 1, function (p1, p2, p3) {
    if (!$.isNumeric(p1)) {
        p1 = labels[p1];
    }
    s = s + 1;
    mStack[s] = i + 1;
    i = p1 - 1;  // must subtract since at the end of each inst s++
}));

instructionDefinitions.push(new InstructionDefinition('ENPR', 1, function (p1, p2, p3) {
    s = s + 1;
    mStack[s] = dStack[p1];
    dStack[p1] = s + 1;
}));

instructionDefinitions.push(new InstructionDefinition('RTPR', 2, function (p1, p2, p3) {
    dStack[p1] = mStack[s];
    i = mStack[s - 1];
    s = s - (p2 + 2);
}));


instructionDefinitions.push(new InstructionDefinition('CREN', 2, function (p1, p2, p3) {
    s = s + 1;
    mStack[s] = dStack[p1] + p2;
}));
instructionDefinitions.push(new InstructionDefinition('CRVI', 2, function (p1, p2, p3) {
    s = s + 1;
    mStack[s] = mStack[mStack[dStack[p1] + p2]];
}));
instructionDefinitions.push(new InstructionDefinition('ARMI', 2, function (p1, p2, p3) {
    mStack[mStack[dStack[p1] + p2]] = mStack[s];
    s = s - 1;
    mStack.pop()
}));
instructionDefinitions.push(new InstructionDefinition('INPP', 0, function (p1, p2, p3) {
    s = -1;
    mStack = [];
    dStack = [0];
    for (var i = 0; i < 500; i++) {
        dStack[i] = 0;
    }
}));
instructionDefinitions.push(new InstructionDefinition('PARA', 0, function (p1, p2, p3) {
    for (var i = 0; i < 5; i++) {
        console.log('Program finished successfully');
    }
}));

function load() {
    var re = /(?:([A-Za-z0-9]+):[ ])?(-?[A-Za-z]+)[ ]?(-?[a-zA-Z0-9]+)?[ ]?,?[ ]?(-?[0-9]+)?/gm;

    // Match whole lines without capturing groups
    var instructions = $('#code-input').val().match(re);

    pStack = [];

    for (var z = 0; z < instructions.length; z++) {
        re.lastIndex = 0;
        // Match using each capturing group
        var inst = re.exec(instructions[z].toUpperCase());

        var name = inst[2];
        var p1 = $.isNumeric(inst[3]) ? parseInt(inst[3]) : inst[3];
        var p2 = parseInt(inst[4]);
        var p3 = parseInt(inst[5]);
        pStack.push(new Instruction(name, p1, p2, p3));

        if (inst[1]) {
            console.log(`PUSHING NEW LABEL: ${inst[1]} = ${pStack.length - 1}`);
            labels[inst[1]] = pStack.length - 1;
        }

        console.log('Pushing:', inst[1], inst[2], inst[3], inst[4], inst[5]);
    }

    console.log(pStack);
}

function next() {
    if (!pStack[i]) {
        return false;
    }
    console.log('Running:', pStack[i]);
    pStack[i].execute();
    i = i + 1;


    console.log(mStack);

    return true;
}

function run() {
    while (next()) {
    }
}
