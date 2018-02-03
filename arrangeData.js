/*eslint-env browser*/
/*eslint "no-console": "off"*/
/*global $*/
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global Mustache: true*/

//document.getElementById("senate_data").innerHTML = JSON.stringify(data, null, 2);

var membersTable = {
    members_data: [

    ]
};

var membersArray = [];
var sortedListOfStates = [];

$(function () {

    var url = '';

    if (window.location.pathname == "/senate-starter-page.html") {
        url = "https://nytimes-ubiqum.herokuapp.com/congress/113/senate";
    } else if (window.location.pathname == "/house-starter-page.html") {
        url = "https://nytimes-ubiqum.herokuapp.com/congress/113/house";
    }
    $.getJSON(url, function (data) {

        membersArray = data.results[0].members;

        fillMembersData(membersArray, "members_data");
        
        $(".loader").hide();
        $("#floatingBarsG").hide();
          //get rid of the info message that data is loading

        fillTemplate();

        $('a.iframe').colorbox({
            iframe: true,
            width: "60%",
            height: "60%",
            overlayClose: false,
            close: "Close",
            fixed: true,

        });

        sortedListOfStates = sortArrayOfStates(membersArray);

        filterByState(sortedListOfStates);
        $("input[name='filterStatus']").on("change", updateFilteredTable);
        $("#filterByState").on("change", updateFilteredTable);

        $.fn.dataTableExt.oSort['full_name-asc'] = function (x, y) {            
            var last_name_x_array = x.split(" ");
            var last_name_x = last_name_x_array[last_name_x_array.length - 1];
            
            var last_name_y_array = y.split(" ");
            var last_name_y = last_name_y_array[last_name_y_array.length - 1]
            
            return ((last_name_x < last_name_y) ? -1 : ((last_name_x > last_name_y) ? 1 : 0));
        };

        $.fn.dataTableExt.oSort['full_name-desc'] = function (x, y) {
            return $.fn.dataTableExt.oSort['full_name-asc'](y, x);
        };      
        


        $("#data_table").dataTable({
            "paging": false,
            "scrollY": "400px",
            "scrollCollapse": true,
            "columnDefs": [{
                "targets": [0],
                "width": "40%",
                "orderable": true,
                "sType": "full_name"                
            }],
            "dom": '<ft>',
            "order": [4, "desc"]
        });


    });

});

// my functions:
function fillMembersData(array, outputKey) {
    for (var i = 0; i < array.length; i++) {
        var innerMember = {};
        innerMember.full_name = getDataForFullName(array[i]);
        innerMember.url = array[i].url;
        innerMember.party = array[i].party;
        innerMember.state = array[i].state;
        innerMember.seniority = array[i].seniority;
        innerMember.votes_with_party_pct = array[i].votes_with_party_pct;

        membersTable[outputKey].push(innerMember);
    }
}

function fillTemplate() {

    var template = $("#data-template").html();
    var output = Mustache.render(template, membersTable);

    $("#congress_data").html(output);

}

//filter by state - adding the options with their sorted values:

function filterByState(array) {
    var stateFilter = document.getElementById("filterByState");

    for (var i = 0; i < array.length; i++) {
        var selectOption = document.createElement("option");
        stateFilter.add(selectOption);
        selectOption.className = "selectStatus";
        var optionValue = array[i];

        selectOption.innerHTML = optionValue;
        selectOption.setAttribute("value", optionValue);
    }
}
// function that creates an array of state names in alphabetical order:
function sortArrayOfStates(array) {
    var sortedStates = [];
    for (var i = 0; i < array.length; i++) {

        if (sortedStates.includes(array[i].state) == false) {
            sortedStates.push(array[i].state);
        }
    }
    sortedStates = sortedStates.sort();
    return sortedStates;
}

function getDataForFullName(memberObj) {
    var fullNameMember = [];
    var firstNameMember = memberObj.first_name;
    var lastNameMember = memberObj.last_name;
    var middleNameMember = memberObj.middle_name;
    fullNameMember.push(firstNameMember, middleNameMember, lastNameMember);

    return fullNameMember.join(" ");
}


//the function for updating the displayed table according to what checkboxes and selectors are checked for filtering


function updateFilteredTable() {
    var checkedBoxes = $("input[name='filterStatus']:checked")
        .map(function () {
            return $(this).val();
        }).get();
    var stateFilter = $("#filterByState").val();
    console.log(stateFilter);

    $("#congress_data tr").each(function () {
        var theParty = $(this).find(".party").text();
        var theState = $(this).find(".state").text();

        if (((checkedBoxes.length === 0 || checkedBoxes.includes(theParty)) == true) && (stateFilter == "" || theState == stateFilter)) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}
