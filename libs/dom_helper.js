"use strict";

//const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// POLYFILLS
// Polyfill, um indexOf() für alte IEs zugänglich zu machen
if (!("indexOf" in Array.prototype)) {
    Array.prototype.indexOf = function (item) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === item) {
                return i;
            }
        }
        return -1;
    };
}

// Polyfill für remove() - für IE bis incl. IE11
if (!("remove" in Element.prototype)) {
    Element.prototype.remove = function () {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

// Fähigkeitenweiche für XHR
var createFunctions = [
    function () { return new XMLHttpRequest(); },
    function () { return new ActiveXObject("Msxml2.XMLHTTP"); },
    function () { return new ActiveXObject("Msxml3.XMLHTTP"); },
    function () { return new ActiveXObject("Microsoft.XMLHTTP"); }
];

function createXHR() {
    var test, xmlHTTP = null;

    for (var i = 0; i < createFunctions.length; i++) {
        try {
            test = createFunctions[i];
            // test =  function() { return new XMLHttpRequest()};
            xmlHTTP = test();
        } catch (e) {
            continue;
        }
        break;
    }
    return xmlHTTP;
}
