/*eslint-env browser*/
/*eslint "no-console": "off"*/
/*global $*/
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global Mustache: true*/

var statistics = {
    "general_statistics": {
        "number_of_democrats": 0,
        "number_of_republicans": 0,
        "number_of_independent": 0,
        "total_number": 0,
        "votes_with_party_pct_democrats": 0,
        "votes_with_party_pct_republicans": 0,
        "votes_with_party_pct_independent": 0,
        "votes_with_party_pct": 0
    },

    "least_engaged": [

    ],
    "most_engaged": [
//        
    ],
    "least_loyal": [
//             
    ],
    "most_loyal": [
//        
    ]

};
var membersArray = [];
var democratArray = [];
var republicanArray = [];
var independentArray = [];
var isAttendancePage = false;

$(function () {
    var url = '';
    if (window.location.pathname == "/senate_attendance_statistics-page.html" || window.location.pathname == "/senate-party-loyalty-page.html") {
        url = "https://api.myjson.com/bins/sge7v";
    } else if (window.location.pathname == "/house_attendance_statistics-page.html" || window.location.pathname == "/house-party-loyalty-page.html") {
        url = "https://api.myjson.com/bins/7od7f";
    }

    isAttendancePage = window.location.pathname == "/senate_attendance_statistics-page.html" || window.location.pathname == "/house_attendance_statistics-page.html";

    $.getJSON(url, function (data) {

        membersArray = data.results[0].members;
        //        democratArray = getArrayFilteredByParty(membersArray, "D");
        //        republicanArray = getArrayFilteredByParty(membersArray, "R");
        //        independentArray = getArrayFilteredByParty(membersArray, "I");

        democratArray = membersArray.filter(function (member) {
            return member.party == "D";
        });
        republicanArray = membersArray.filter(function (member) {
            return member.party == "R";
        });
        independentArray = membersArray.filter(function (member) {
            return member.party == "I";
        });

        var membersArraySortedByLeastLoyal = membersArray.sort(compareAscending("votes_with_party_pct"));
        var leastLoyalArray = getTenPct(membersArraySortedByLeastLoyal, "votes_with_party_pct");
        
        var membersArraySortedByMostLoyal = membersArray.sort(compareDescending("votes_with_party_pct"));
        var mostLoyalArray = getTenPct(membersArraySortedByMostLoyal, "votes_with_party_pct");
        
        var membersArraySortedByLeastEngaged = membersArray.sort(compareDescending("missed_votes_pct"));
        var leastEngagedArray = getTenPct(membersArraySortedByLeastEngaged, "missed_votes_pct");
        var membersArraySortedByMostEngaged = membersArray.sort(compareAscending("missed_votes_pct"));
        var mostEngagedArray = getTenPct(membersArraySortedByMostEngaged, "missed_votes_pct");
        
        fillGeneralStatistics();
        
        $(".loader").hide();
        $("#floatingBarsG").hide();
                
          //get rid of the info message that data is loading

        if (isAttendancePage == true) {
            fillLeastMostEngaged(leastEngagedArray, "least_engaged");
            fillLeastMostEngaged(mostEngagedArray, "most_engaged");
        } else {
            fillLeastMostLoyal(leastLoyalArray, "least_loyal");
            fillLeastMostLoyal(mostLoyalArray, "most_loyal");
        }

        fillGenStatTemp();
        
        createTable();
        
        $('a.iframe').colorbox({
            iframe:true,
            width:"60%",
            height:"60%",
            overlayClose: false,
            close: "Close",
            fixed: true
        });
        
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
        
        $("#data_table, #dataTableAttendance2, #dataTableLoyaltyHouse1").dataTable({
            "paging": false,
            "scrollY": "400px",
            "scrollCollapse": true,
            "columnDefs": [{
                "targets": 0,
                "width": "50%",
                "orderable": true,
                "type": "full_name" 
    }],
            "dom": '<ft>',
            "order": [2, "asc"]
        });
        
        $("#dataTableAttendanceSenate2, #dataTableLoyaltySenate1").dataTable({
            "paging": false,
            "scrollY": "400px",
            "scrollCollapse": true,
            "searching": false,
            "columnDefs": [{
                "targets": 0,
                "width": "50%",
                "orderable": true,
                "type": "full_name" 
    }],
            "dom": '<ft>',
            "order": [2, "asc"]
        });
        
        $("#dataTableAttendanceSenate1, #dataTableLoyaltySenate2").dataTable({
            "paging": false,
            "scrollY": "400px",
            "scrollCollapse": true,
            "searching": false,
            "columnDefs": [{
                "targets": 0,
                "width": "50%",
                "orderable": true,
                "type": "full_name" 
    }],
            "dom": '<ft>',
            "order": [2, "desc"]
        });
        
        $("#dataTableAttendance1, #dataTableLoyaltyHouse2").dataTable({
            "paging": false,
            "scrollY": "400px",
            "scrollCollapse": true,
            "columnDefs": [{
                "targets": 0,
                "width": "50%",
                "orderable": true,
                "type": "full_name" 
    }],
            "dom": '<ft>',
            "order": [2, "desc"]
        });
       
    });

});


// my functions:


function fillGeneralStatistics() {
    statistics.general_statistics.number_of_democrats = democratArray.length;
    statistics.general_statistics.number_of_republicans = republicanArray.length;
    statistics.general_statistics.number_of_independent = independentArray.length;
    statistics.general_statistics.total_number = democratArray.length + republicanArray.length + independentArray.length;

    statistics.general_statistics.votes_with_party_pct_democrats = getAverageVotingWithPartyPct(democratArray);
    statistics.general_statistics.votes_with_party_pct_republicans = getAverageVotingWithPartyPct(republicanArray);
    statistics.general_statistics.votes_with_party_pct_independent = getAverageVotingWithPartyPct(independentArray);
    statistics.general_statistics.votes_with_party_pct = getAverageVotingWithPartyPct(membersArray);

}

function getDataForFullName(memberObj) {
    var fullNameMember = [];
    var firstNameMember = memberObj.first_name;
    var lastNameMember = memberObj.last_name;
    var middleNameMember = memberObj.middle_name;
    var apostr = memberObj.last_name.replace("&#x27;", "'");
    lastNameMember = apostr;
    fullNameMember.push(firstNameMember, middleNameMember, lastNameMember);

    return fullNameMember.join(" ");
}

function fillLeastMostLoyal(array, statisticsOutputKey) {
    for (var i = 0; i < array.length; i++) {
        var innerMember = {};
        innerMember.full_name = getDataForFullName(array[i]);
        innerMember.url = array[i].url;
        innerMember.total = +(array[i].total_votes) - +(array[i].missed_votes);
        innerMember.pct = array[i].votes_with_party_pct;
        statistics[statisticsOutputKey].push(innerMember);
    }
}

function fillLeastMostEngaged(array, statisticsOutputKey) {
    for (var i = 0; i < array.length; i++) {
        var innerMember = {};
        innerMember.full_name = getDataForFullName(array[i]);
        innerMember.url = array[i].url;
        innerMember.total = array[i].missed_votes;
        innerMember.pct = array[i].missed_votes_pct;

        statistics[statisticsOutputKey].push(innerMember);
    }
}

function fillGenStatTemp() {
    var template = $("#gen-stat-template").html();
    var output = Mustache.render(template, statistics.general_statistics);
    $("#general_statistics").html(output);
}

function fillTemplate(templateID, elementId, objArray) {
    var template = $(templateID).html();
    var output = '';

    for (var i in objArray) {
        output += Mustache.render(template, objArray[i]);
    }

    $(elementId).html(output);
}

//function for getting the first 10% according to a set parameter, i.e. key

function getTenPct(sortedarray, targetMemberKey) {
    var pct = Math.round(sortedarray.length / 10);
    var newArray = [];
    for (var i = 0; i < sortedarray.length; i++) {
        if (i < pct) {
            newArray.push(sortedarray[i]);
        } else {
            if (sortedarray[i][targetMemberKey] == newArray[newArray.length - 1][targetMemberKey]) {
                newArray.push(sortedarray[i]);
            }
        }
    }
    return newArray;
}

//the function to get an array with elements from only one party. The lenght of the party is used to represent the number of party members:


//function getArrayFilteredByParty(array, stringMeaningValueOfKey) {
//    var partyList = [];
//    $(array).each(function () {
//        if (this.party == stringMeaningValueOfKey) {
//            partyList.push(this);
//        }
//    });
//    return partyList;
//}

//function that calculates the average percentage of voting:
function getAverageVotingWithPartyPct(arrayFilteredByParty) {
    var totalVotingPct = 0;

    $(arrayFilteredByParty).each(function () {
        var singleVotingPct = this.votes_with_party_pct;
        totalVotingPct += +singleVotingPct;
    });
    var averangeVotingPct = totalVotingPct / arrayFilteredByParty.length;
    return averangeVotingPct.toFixed(2);
}

function compareAscending(key) {
    return function compareBy(a, b) {
        if (a[key] > b[key]) {
            return 1;
        }
        if (a[key] < b[key]) {
            return -1;
        } else {
            return 0;
        }
    }
}

function compareDescending(key) {
    return function compareBy(a, b) {
        if (a[key] < b[key]) {
            return 1;
        }
        if (a[key] > b[key]) {
            return -1;
        } else {
            return 0;
        }
    }
}


function createTable() {

    if (window.location.pathname == "/senate_attendance_statistics-page.html" || window.location.pathname == "/house_attendance_statistics-page.html") {
        fillTemplate("#attendance-loyalty-stat-template", "#least_engaged", statistics.least_engaged);
        fillTemplate("#attendance-loyalty-stat-template", "#most_engaged", statistics.most_engaged);
    } else if (window.location.pathname == "/senate-party-loyalty-page.html" || window.location.pathname == "/house-party-loyalty-page.html") {

        fillTemplate("#attendance-loyalty-stat-template", "#least_loyal", statistics.least_loyal);

        fillTemplate("#attendance-loyalty-stat-template", "#most_loyal", statistics.most_loyal);

    }

}
