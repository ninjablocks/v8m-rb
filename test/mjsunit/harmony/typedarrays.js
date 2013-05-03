// Copyright 2013 the V8 project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
//       copyright notice, this list of conditions and the following
//       disclaimer in the documentation and/or other materials provided
//       with the distribution.
//     * Neither the name of Google Inc. nor the names of its
//       contributors may be used to endorse or promote products derived
//       from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// Flags: --harmony-typed-arrays

// ArrayBuffer

function TestByteLength(param, expectedByteLength) {
  var ab = new ArrayBuffer(param);
  assertSame(expectedByteLength, ab.byteLength);
}

function TestArrayBufferCreation() {
  TestByteLength(1, 1);
  TestByteLength(256, 256);
  TestByteLength(-10, 0);
  TestByteLength(2.567, 2);
  TestByteLength(-2.567, 0);

  TestByteLength("abc", 0);

  TestByteLength(0, 0);

/* TODO[dslomov]: Reenable the test
  assertThrows(function() {
    var ab1 = new ArrayBuffer(0xFFFFFFFFFFFF)
  }, RangeError);
*/

  var ab = new ArrayBuffer();
  assertSame(0, ab.byteLength);
}

TestArrayBufferCreation();

function TestByteLengthNotWritable() {
  var ab = new ArrayBuffer(1024);
  assertSame(1024, ab.byteLength);

  assertThrows(function() { "use strict"; ab.byteLength = 42; }, TypeError);
}

TestByteLengthNotWritable();

function TestSlice(expectedResultLen, initialLen, start, end) {
  var ab = new ArrayBuffer(initialLen);
  var a1 = new Uint8Array(ab);
  for (var i = 0; i < a1.length; i++) {
    a1[i] = 0xCA;
  }
  var slice = ab.slice(start, end);
  assertSame(expectedResultLen, slice.byteLength);
  var a2 = new Uint8Array(slice);
  for (var i = 0; i < a2.length; i++) {
    assertSame(0xCA, a2[i]);
  }
}

function TestArrayBufferSlice() {
  var ab = new ArrayBuffer(1024);
  var ab1 = ab.slice(512, 1024);
  assertSame(512, ab1.byteLength);

  TestSlice(512, 1024, 512, 1024);
  TestSlice(512, 1024, 512);

  TestSlice(0, 0, 1, 20);
  TestSlice(100, 100, 0, 100);
  TestSlice(100, 100, 0, 1000);
  TestSlice(0, 100, 5, 1);

  TestSlice(1, 100, -11, -10);
  TestSlice(9, 100, -10, 99);
  TestSlice(0, 100, -10, 80);
  TestSlice(10, 100, 80, -10);

  TestSlice(10, 100, 90, "100");
  TestSlice(10, 100, "90", "100");

  TestSlice(0, 100, 90, "abc");
  TestSlice(10, 100, "abc", 10);

  TestSlice(10, 100, 0.96, 10.96);
  TestSlice(10, 100, 0.96, 10.01);
  TestSlice(10, 100, 0.01, 10.01);
  TestSlice(10, 100, 0.01, 10.96);


  TestSlice(10, 100, 90);
  TestSlice(10, 100, -10);
}

TestArrayBufferSlice();

// Typed arrays

function TestTypedArray(proto, elementSize, typicalElement) {
  var ab = new ArrayBuffer(256*elementSize);

  var a0 = new proto(30);
  assertSame(elementSize, a0.BYTES_PER_ELEMENT);
  assertSame(30, a0.length);
  assertSame(30*elementSize, a0.byteLength);
  assertSame(0, a0.byteOffset);
  assertSame(30*elementSize, a0.buffer.byteLength);

  var aLen0 = new proto(0);
  assertSame(elementSize, aLen0.BYTES_PER_ELEMENT);
  assertSame(0, aLen0.length);
  assertSame(0, aLen0.byteLength);
  assertSame(0, aLen0.byteOffset);
  assertSame(0, aLen0.buffer.byteLength);

  var aOverBufferLen0 = new proto(ab, 128*elementSize, 0);
  assertSame(ab, aOverBufferLen0.buffer);
  assertSame(elementSize, aOverBufferLen0.BYTES_PER_ELEMENT);
  assertSame(0, aOverBufferLen0.length);
  assertSame(0, aOverBufferLen0.byteLength);
  assertSame(128*elementSize, aOverBufferLen0.byteOffset);

  var a1 = new proto(ab, 128*elementSize, 128);
  assertSame(ab, a1.buffer);
  assertSame(elementSize, a1.BYTES_PER_ELEMENT);
  assertSame(128, a1.length);
  assertSame(128*elementSize, a1.byteLength);
  assertSame(128*elementSize, a1.byteOffset);


  var a2 = new proto(ab, 64*elementSize, 128);
  assertSame(ab, a2.buffer);
  assertSame(elementSize, a2.BYTES_PER_ELEMENT);
  assertSame(128, a2.length);
  assertSame(128*elementSize, a2.byteLength);
  assertSame(64*elementSize, a2.byteOffset);

  var a3 = new proto(ab, 192*elementSize);
  assertSame(ab, a3.buffer);
  assertSame(64, a3.length);
  assertSame(64*elementSize, a3.byteLength);
  assertSame(192*elementSize, a3.byteOffset);

  var a4 = new proto(ab);
  assertSame(ab, a4.buffer);
  assertSame(256, a4.length);
  assertSame(256*elementSize, a4.byteLength);
  assertSame(0, a4.byteOffset);


  var i;
  for (i = 0; i < 128; i++) {
    a1[i] = typicalElement;
  }

  for (i = 0; i < 128; i++) {
    assertSame(typicalElement, a1[i]);
  }

  for (i = 0; i < 64; i++) {
    assertSame(0, a2[i]);
  }

  for (i = 64; i < 128; i++) {
    assertSame(typicalElement, a2[i]);
  }

  for (i = 0; i < 64; i++) {
    assertSame(typicalElement, a3[i]);
  }

  for (i = 0; i < 128; i++) {
    assertSame(0, a4[i]);
  }

  for (i = 128; i < 256; i++) {
    assertSame(typicalElement, a4[i]);
  }

  var aAtTheEnd = new proto(ab, 256*elementSize);
  assertSame(elementSize, aAtTheEnd.BYTES_PER_ELEMENT);
  assertSame(0, aAtTheEnd.length);
  assertSame(0, aAtTheEnd.byteLength);
  assertSame(256*elementSize, aAtTheEnd.byteOffset);

  assertThrows(function () { new proto(ab, 257*elementSize); }, RangeError);
  assertThrows(
      function () { new proto(ab, 128*elementSize, 192); },
      RangeError);

  if (elementSize !== 1) {
    assertThrows(function() { new proto(ab, 128*elementSize - 1, 10); },
                 RangeError);
    var unalignedArrayBuffer = new ArrayBuffer(10*elementSize + 1);
    var goodArray = new proto(unalignedArrayBuffer, 0, 10);
    assertSame(10, goodArray.length);
    assertSame(10*elementSize, goodArray.byteLength);
    assertThrows(function() { new proto(unalignedArrayBuffer)}, RangeError);
    assertThrows(function() { new proto(unalignedArrayBuffer, 5*elementSize)},
                 RangeError);
    assertThrows(function() { new proto() }, TypeError);
  }

  var aFromString = new proto("30");
  assertSame(elementSize, aFromString.BYTES_PER_ELEMENT);
  assertSame(30, aFromString.length);
  assertSame(30*elementSize, aFromString.byteLength);
  assertSame(0, aFromString.byteOffset);
  assertSame(30*elementSize, aFromString.buffer.byteLength);

  var jsArray = [];
  for (i = 0; i < 30; i++) {
    jsArray.push(typicalElement);
  }
  var aFromArray = new proto(jsArray);
  assertSame(elementSize, aFromArray.BYTES_PER_ELEMENT);
  assertSame(30, aFromArray.length);
  assertSame(30*elementSize, aFromArray.byteLength);
  assertSame(0, aFromArray.byteOffset);
  assertSame(30*elementSize, aFromArray.buffer.byteLength);
  for (i = 0; i < 30; i++) {
    assertSame(typicalElement, aFromArray[i]);
  }

  var abLen0 = new ArrayBuffer(0);
  var aOverAbLen0 = new proto(abLen0);
  assertSame(abLen0, aOverAbLen0.buffer);
  assertSame(elementSize, aOverAbLen0.BYTES_PER_ELEMENT);
  assertSame(0, aOverAbLen0.length);
  assertSame(0, aOverAbLen0.byteLength);
  assertSame(0, aOverAbLen0.byteOffset);
}

TestTypedArray(Uint8Array, 1, 0xFF);
TestTypedArray(Int8Array, 1, -0x7F);
TestTypedArray(Uint16Array, 2, 0xFFFF);
TestTypedArray(Int16Array, 2, -0x7FFF);
TestTypedArray(Uint32Array, 4, 0xFFFFFFFF);
TestTypedArray(Int32Array, 4, -0x7FFFFFFF);
TestTypedArray(Float32Array, 4, 0.5);
TestTypedArray(Float64Array, 8, 0.5);
TestTypedArray(Uint8ClampedArray, 1, 0xFF);

function SubarrayTestCase(constructor, item, expectedResultLen, expectedStartIndex,
                          initialLen, start, end) {
  var a = new constructor(initialLen);
  var s = a.subarray(start, end);
  assertSame(constructor, s.constructor);
  assertSame(expectedResultLen, s.length);
  if (s.length > 0) {
    s[0] = item;
    assertSame(item, a[expectedStartIndex]);
  }
}

function TestSubArray(constructor, item) {
  SubarrayTestCase(constructor, item, 512, 512, 1024, 512, 1024);
  SubarrayTestCase(constructor, item, 512, 512, 1024, 512);

  SubarrayTestCase(constructor, item, 0, undefined, 0, 1, 20);
  SubarrayTestCase(constructor, item, 100, 0,       100, 0, 100);
  SubarrayTestCase(constructor, item, 100, 0,       100,  0, 1000);
  SubarrayTestCase(constructor, item, 0, undefined, 100, 5, 1);

  SubarrayTestCase(constructor, item, 1, 89,        100, -11, -10);
  SubarrayTestCase(constructor, item, 9, 90,        100, -10, 99);
  SubarrayTestCase(constructor, item, 0, undefined, 100, -10, 80);
  SubarrayTestCase(constructor, item, 10,80,        100, 80, -10);

  SubarrayTestCase(constructor, item, 10,90,        100, 90, "100");
  SubarrayTestCase(constructor, item, 10,90,        100, "90", "100");

  SubarrayTestCase(constructor, item, 0, undefined, 100, 90, "abc");
  SubarrayTestCase(constructor, item, 10,0,         100, "abc", 10);

  SubarrayTestCase(constructor, item, 10,0,         100, 0.96, 10.96);
  SubarrayTestCase(constructor, item, 10,0,         100, 0.96, 10.01);
  SubarrayTestCase(constructor, item, 10,0,         100, 0.01, 10.01);
  SubarrayTestCase(constructor, item, 10,0,         100, 0.01, 10.96);


  SubarrayTestCase(constructor, item, 10,90,        100, 90);
  SubarrayTestCase(constructor, item, 10,90,        100, -10);
}

TestSubArray(Uint8Array, 0xFF);
TestSubArray(Int8Array, -0x7F);
TestSubArray(Uint16Array, 0xFFFF);
TestSubArray(Int16Array, -0x7FFF);
TestSubArray(Uint32Array, 0xFFFFFFFF);
TestSubArray(Int32Array, -0x7FFFFFFF);
TestSubArray(Float32Array, 0.5);
TestSubArray(Float64Array, 0.5);
TestSubArray(Uint8ClampedArray, 0xFF);

function TestTypedArrayOutOfRange(constructor, value, result) {
  var a = new constructor(1);
  a[0] = value;
  assertSame(result, a[0]);
}

TestTypedArrayOutOfRange(Uint8Array, 0x1FA, 0xFA);
TestTypedArrayOutOfRange(Uint8Array, -1, 0xFF);

TestTypedArrayOutOfRange(Int8Array, 0x1FA, 0x7A - 0x80);

TestTypedArrayOutOfRange(Uint16Array, 0x1FFFA, 0xFFFA);
TestTypedArrayOutOfRange(Uint16Array, -1, 0xFFFF);
TestTypedArrayOutOfRange(Int16Array, 0x1FFFA, 0x7FFA - 0x8000);

TestTypedArrayOutOfRange(Uint32Array, 0x1FFFFFFFA, 0xFFFFFFFA);
TestTypedArrayOutOfRange(Uint32Array, -1, 0xFFFFFFFF);
TestTypedArrayOutOfRange(Int32Array, 0x1FFFFFFFA, 0x7FFFFFFA - 0x80000000);

TestTypedArrayOutOfRange(Uint8ClampedArray, 0x1FA, 0xFF);
TestTypedArrayOutOfRange(Uint8ClampedArray, -1, 0);

var typedArrayConstructors = [
  Uint8Array,
  Int8Array,
  Uint16Array,
  Int16Array,
  Uint32Array,
  Int32Array,
  Uint8ClampedArray,
  Float32Array,
  Float64Array];

function TestPropertyTypeChecks(constructor) {
  var a = new constructor();
  function CheckProperty(name) {
    var d = Object.getOwnPropertyDescriptor(constructor.prototype, name);
    var o = {}
    assertThrows(function() {d.get.call(o);}, TypeError);
    d.get.call(a); // shouldn't throw
    for (var i = 0 ; i < typedArrayConstructors.length; i++) {
      d.get.call(new typedArrayConstructors[i](10));
    }
  }

  CheckProperty("buffer");
  CheckProperty("byteOffset");
  CheckProperty("byteLength");
  CheckProperty("length");
}

for(i = 0; i < typedArrayConstructors.lenght; i++) {
  TestPropertyTypeChecks(typedArrayConstructors[i]);
}


// General tests for properties

// Test property attribute [[Enumerable]]
function TestEnumerable(func, obj) {
  function props(x) {
    var array = [];
    for (var p in x) array.push(p);
    return array.sort();
  }
  assertArrayEquals([], props(func));
  assertArrayEquals([], props(func.prototype));
  if (obj)
    assertArrayEquals([], props(obj));
}
TestEnumerable(ArrayBuffer, new ArrayBuffer());
for(i = 0; i < typedArrayConstructors.lenght; i++) {
  TestEnumerable(typedArrayConstructors[i]);
}

// Test arbitrary properties on ArrayBuffer
function TestArbitrary(m) {
  function TestProperty(map, property, value) {
    map[property] = value;
    assertEquals(value, map[property]);
  }
  for (var i = 0; i < 20; i++) {
    TestProperty(m, i, 'val' + i);
    TestProperty(m, 'foo' + i, 'bar' + i);
  }
}
TestArbitrary(new ArrayBuffer(256));
for(i = 0; i < typedArrayConstructors.lenght; i++) {
  TestArbitary(new typedArrayConstructors[i](10));
}



// Test direct constructor call
assertTrue(ArrayBuffer() instanceof ArrayBuffer);
