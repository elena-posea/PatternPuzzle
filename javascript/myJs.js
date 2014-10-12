/**
 * Created by elena_mishu on 12.10.2014.
 */

var colorList = new Array();
colorList[0] = '#FFFFFF';
colorList[1] = '#FF0000';
colorList[2] = '#00FF00';
colorList[3] = '#0000FF';
colorList[4 ] = '#FFFF00';

function getColor(index) {
    return colorList[index];
}


var patterns = new Array();

function Pattern(noLines, noColumns) {
    this.noLines = noLines;
    this.noColumns = noColumns;
    this.pattern = new Array();
    var i,j;
    for (i = 0; i < noLines; i++) {
        this.pattern[i] = new Array();
        for (j = 0; j < noColumns; j++) {
            var cell = $("<div data-selected='" + 0 + "'> </div>");
            cell.addClass('cellClass');
            cell.css('background', getColor(0));
            this.pattern[i][j] = cell;
        }
    }
    this.setPatternOn = function (line, column) {
        this.pattern[line][column].data('selected', 1);
        this.pattern[line][column].css('background', getColor(1));
    }

    this.setPatternRoot = function (line, column) {
        this.pattern[line][column].data('selected', 2);
        this.patternRootLine = line;
        this.patternRootColumn = column;
        this.pattern[line][column].css('background', getColor(2));
    }

}

var pattern = new Pattern(1, 1);
pattern.setPatternRoot(0, 0);
patterns.push(pattern);

pattern = new Pattern(3, 3);
pattern.setPatternOn(0, 0);
pattern.setPatternOn(0, 1);
pattern.setPatternOn(0, 2);
pattern.setPatternRoot(1, 1);

patterns.push(pattern);

var defaultPatternIndex = 0;
var selectedPatternIndex = defaultPatternIndex;

var noLines = 10;
var noCols = 10;

function getSelectedCells (cell, pattern) {
    // if error/out of table -> null
    var rootLine = pattern.patternRootLine;
    var rootColumn = pattern.patternRootColumn;
    var cells = new Array();
    var cellRow =  parseInt(cell.data("row"));
    var cellColumn = parseInt(cell.data("column"));
    for(var i = 0; i < pattern.noLines; i++) {
        for(var j = 0; j < pattern.noColumns; j++) {
            var currentCell = pattern.pattern[i][j];
            if(parseInt(currentCell.data("selected")) != 0) {
                var rowIndex = cellRow + i - rootLine;
                var columnIndex = cellColumn + j - rootColumn;
                if (rowIndex < 1 || rowIndex > noLines || columnIndex < 1 || columnIndex > noCols)
                    return null;
                var cell = $("#cell_" + rowIndex + "_" + columnIndex);
                cells.push(cell);
            }
        }
    }
    return cells;
}

function increaseAll(selectedCells){
    for(var c = 0; c < selectedCells.length; c++){
//        alert( selectedCells[c]);
        var currentCell = selectedCells[c];
        var colorIndex = currentCell.data("color-index");
        var nextIndex = (colorIndex + 1) % colorList.length;
        var nextColor = getColor(nextIndex);
        currentCell.css('background', nextColor);
        currentCell.data("color-index", nextIndex);
    }

}


function highlightAll(selectedCells){
    $(".highlight").removeClass("highlight");
    for(var c = 0; c < selectedCells.length; c++){
        var currentCell = selectedCells[c];
        var colorIndex = currentCell.data("color-index");
        var nextIndex = (colorIndex + 1) % colorList.length;
        var nextColor = getColor(nextIndex);
        currentCell.addClass("highlight");
    }

}

function checkClean() {
    var i,j;
    for (i = 1; i <= noLines; i++) {
        for (j = 1; j <= noCols; j++) {
            var cell = $("#cell_"+i+"_"+j);
//            alert(cell.data("color-index"));
            if (cell.data("color-index") != '0')
                return false;
        }
    }
        return true;
}

function youClickedOn(event) {
    // I want all the cells implied by the current pattern
    var currentPattern= patterns[selectedPatternIndex];
    var selectedCells = getSelectedCells(event.data.cell, currentPattern);
//    alert(selectedCells);
    if (selectedCells == null) {
        alert("invalid move; pattern cannot go outside the table");
        return;
    }

    increaseAll(selectedCells);
    if (checkClean()) {
        alert("Ai terminat!!!");
    }
}

function youEnteredOn(event) {
    // I want all the cells implied by the current pattern
    var currentPattern= patterns[selectedPatternIndex];
    var selectedCells = getSelectedCells(event.data.cell, currentPattern);
    if (selectedCells == null) {
        return;
    }

    highlightAll(selectedCells);
}

function simulateRandomClick(){
    var i, j;
    i = Math.floor(Math.random() * noLines + 1);
    j = Math.floor(Math.random() * noCols + 1);
    var cell = $("#cell_" + i + "_" + j);
    // I want all the cells implied by the current pattern
    var currentPattern= patterns[selectedPatternIndex];
    var selectedCells = getSelectedCells(cell, currentPattern);
    if (selectedCells == null) {
        return;
    }
//    alert("click on " + selectedCells.length);
    increaseAll(selectedCells);
}

function scramble() {
    var noOfMoves = Math.floor(Math.random() * 5 + 5); // 5 to 9 moves
    for (var i = 0; i < noOfMoves; i++) {
        simulateRandomClick();
    }
}

$(document).ready(function() {
    var mainBoard = $("#mainBoard");
    var row;
    var column, cell, i,j;
    for (i = 1; i <= noLines; i++) {
        row = $('<tr id=\'row_' + i + "'></tr>");
        for(j = 1; j <= noCols; j++) {
            column = $('<td id=\'column_' + i + "_"+ j +"'></td>");
            var identifier = 'cell_' + i + '_' + j;
            cell = $("<div id='" + identifier + "'  data-color-index = '0' data-row='" + i + "' data-column='" + j + "'> </div>");
            cell.on("click", {"cell" : cell}, youClickedOn);
            cell.on("mouseenter", {"cell" : cell}, youEnteredOn);
            cell.on("mouseleave",function(){
                $(".highlight").removeClass("highlight");
            });

            cell.addClass('cellClass');
            cell.css('background', getColor(0));
            column.append(cell);
            row.append(column);
        }
        mainBoard.append(row);
    }

    var settingsLink = $("#settings");
    var divForMenu = $("#menu");

    settingsLink.on("click", function(){
        divForMenu.slideToggle();
    });

    //display predefined patterns
//            alert(patterns.length);
    for (var p = 0; p < patterns.length; p++) {
        var table = $("<table id='pattern_" + p + "' data-index='"+ p + "'></table>");
        table.css("float", "left");
        for (i = 1; i <= patterns[p].noLines; i++) {
            var row = $('<tr id=\'row_' + i + "'></tr>");
            for(j = 1; j <= patterns[p].noColumns; j++) {
                var column = $('<td id=\'column_' + i + "_"+ j +"'></td>");
                column.append(patterns[p].pattern[i - 1][j - 1]);
                row.append(column);
            }
            table.append(row);
        }

        table.on("click", function(){
            $(".selected").removeClass("selected");
            $(this).addClass("selected");
            selectedPatternIndex = $(this).data("index");
//                    alert("ati selectat patternul " + $(this).data("index"));
        });


        $("#patterns").append(table);
    }

    $("#pattern_" + defaultPatternIndex).addClass("selected");
    $("#scramble").on("click", scramble);
});
