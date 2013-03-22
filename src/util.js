
var util = {};

/**
 * Convert a number to a formatted string representation
 * @param {Number} value            The value to be formatted
 * @param {Number} [digits]         number of digits
 * @return {String} formattedValue  The formatted value
 */
util.format = function format(value, digits) {
    if (value === Infinity) {
        return 'Infinity';
    }
    else if (value === -Infinity) {
        return '-Infinity';
    }
    else if (value === NaN) {
        return 'NaN';
    }

    // TODO: what is a nice limit for non-scientific values?
    var abs = Math.abs(value);
    if ( (abs > 0.0001 && abs < 1000000) || abs == 0.0 ) {
        // round the func to a limited number of digits
        return String(roundNumber(value, digits));
    }
    else {
        // scientific notation
        var exp = Math.round(Math.log(abs) / Math.LN10);
        var v = value / (Math.pow(10.0, exp));
        return roundNumber(v, digits) + 'E' + exp;
    }
};

/**
 * Create a semi UUID
 * source: http://stackoverflow.com/a/105074/1262753
 * @return {String} uuid
 */
util.randomUUID = function randomUUID() {
    var S4 = function () {
        return Math.floor(
            Math.random() * 0x10000 /* 65536 */
        ).toString(16);
    };

    return (
        S4() + S4() + '-' +
            S4() + '-' +
            S4() + '-' +
            S4() + '-' +
            S4() + S4() + S4()
        );
};

/**
 * Execute function fn element wise for each element in array. Returns an array
 * with the results
 * @param {Array} array
 * @param {function} fn
 * @return {Array} res
 */
util.map = function map(array, fn) {
    if (!array instanceof Array) {
        throw new TypeError('Array expected');
    }

    return array.map(function (x) {
        return fn(x);
    });
};

/**
 * Execute function fn element wise for each entry in two given arrays, or for
 * an object and array pair. Returns an array with the results
 * @param {Array | Object} array1
 * @param {Array | Object} array2
 * @param {function} fn
 * @return {Array} res
 */
util.map2 = function map2(array1, array2, fn) {
    var res, len, i;
    if (array1 instanceof Array) {
        if (array2 instanceof Array) {
            // fn(array, array)
            if (array1.length != array2.length) {
                throw new Error('Dimension mismatch ' +
                    '(' +  array1.length + ' != ' + array2.length + ')');
            }

            res = [];
            len = array1.length;
            for (i = 0; i < len; i++) {
                res[i] = fn(array1[i], array2[i]);
            }
        }
        else {
            // fn(array, object)
            res = [];
            len = array1.length;
            for (i = 0; i < len; i++) {
                res[i] = fn(array1[i], array2);
            }
        }
    }
    else {
        if (array2 instanceof Array) {
            // fn(object, array)
            res = [];
            len = array2.length;
            for (i = 0; i < len; i++) {
                res[i] = fn(array1, array2[i]);
            }
        }
        else {
            // fn(object, object)
            res = fn(array1, array2);
        }
    }

    return res;
};


util.object = {};


/**
 * For each method for objects. The method loops over all properties of the object.
 * @param {Object} object       The object
 * @param {function} callback   Callback method, called for each item in
 *                              the object or array with three parameters:
 *                              callback(value, index, object)
 */
util.object.forEach = function forEach (object, callback) {
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            callback(object[key], key, object);
        }
    }
};

/**
 * Creates a new object with the results of calling a provided function on
 * every property in the object.
 * @param {Object} object           The object
 * @param {function} fn             Mapping function
 * @return {Object} mappedObject
 */
util.object.map = function map (object, fn) {
    var m = {};
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            m[key] = fn(object[key]);
        }
    }
    return m;
};


util.array = {};

/**
 * Recursively get the size of an array.
 * The size is calculated from the first dimension.
 * The array is not checked for matching dimensions, that should be done using
 * util.array.validate or util.array.validatedSize
 * @param {Array} x
 * @Return {Number[]} size
 */
util.array.size = function size (x) {
    if (x instanceof Array) {
        var sizeX = x.length;
        if (sizeX) {
            var size0 = util.array.size(x[0]);
            return [sizeX].concat(size0);
        }
        else {
            return [sizeX];
        }
    }
    else {
        return [];
    }
};

/**
 * Verify whether each element in an n dimensional array has the correct size
 * @param {Array} array    Array to be validated
 * @param {Number[]} size  Array with dimensions
 * @param {Number} [dim]   Current dimension
 * @throw Error
 */
util.array.validate = function validate(array, size, dim) {
    if (size.length == 0) {
        // scalar
        if (array instanceof Array) {
            throw new Error('Dimension mismatch (' + array.length + ' != 0)');
        }
        return;
    }

    var i,
        len = array.length;
    if (!dim) {
        dim = 0;
    }

    if (len != size[dim]) {
        throw new Error('Dimension mismatch (' + len + ' != ' + size[dim] + ')');
    }

    if (dim < size.length - 1) {
        // recursively validate each child array
        var dimNext = dim + 1;
        for (i = 0; i < len; i++) {
            var child = array[i];
            if (!(child instanceof Array)) {
                throw new Error('Dimension mismatch ' +
                    '(' + (size.length - 1) + ' < ' + size.length + ')');
            }
            validate(array[i], size, dimNext);
        }
    }
    else {
        // last dimension. none of the childs may be an array
        for (i = 0; i < len; i++) {
            if (array[i] instanceof Array) {
                throw new Error('Dimension mismatch ' +
                    '(' + (size.length + 1) + ' > ' + size.length + ')');
            }
        }
    }

    return true;
};

/**
 * Recursively get the size of a multidimensional array.
 * The array is checked for matching dimensions.
 * @param {Array} x
 * @Return {Number[]} size
 */
util.array.validatedSize = function validatedSize(x) {
    var s = util.array.size(x);
    util.array.validate(x, s); // TODO: make validation optional via math.options?
    return s;
};

// Internet Explorer 8 and older does not support Array.indexOf, so we define
// it here in that case.
// http://soledadpenades.com/2007/05/17/arrayindexof-in-internet-explorer/
if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj){
        for(var i = 0; i < this.length; i++){
            if(this[i] == obj){
                return i;
            }
        }
        return -1;
    };
}

// Internet Explorer 8 and older does not support Array.forEach, so we define
// it here in that case.
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fn, scope) {
        for(var i = 0, len = this.length; i < len; ++i) {
            fn.call(scope || this, this[i], i, this);
        }
    }
}

// Internet Explorer 8 and older does not support Array.map, so we define it
// here in that case.
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/map
// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.com/#x15.4.4.19
if (!Array.prototype.map) {
    Array.prototype.map = function(callback, thisArg) {

        var T, A, k;

        if (this == null) {
            throw new TypeError(" this is null or not defined");
        }

        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== "function") {
            throw new TypeError(callback + " is not a function");
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (thisArg) {
            T = thisArg;
        }

        // 6. Let A be a new array created as if by the expression new Array(len) where Array is
        // the standard built-in constructor with that name and len is the value of len.
        A = new Array(len);

        // 7. Let k be 0
        k = 0;

        // 8. Repeat, while k < len
        while(k < len) {

            var kValue, mappedValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                kValue = O[ k ];

                // ii. Let mappedValue be the result of calling the Call internal method of callback
                // with T as the this value and argument list containing kValue, k, and O.
                mappedValue = callback.call(T, kValue, k, O);

                // iii. Call the DefineOwnProperty internal method of A with arguments
                // Pk, Property Descriptor {Value: mappedValue, : true, Enumerable: true, Configurable: true},
                // and false.

                // In browsers that support Object.defineProperty, use the following:
                // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

                // For best browser support, use the following:
                A[ k ] = mappedValue;
            }
            // d. Increase k by 1.
            k++;
        }

        // 9. return A
        return A;
    };
}
