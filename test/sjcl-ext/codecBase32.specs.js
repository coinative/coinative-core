'use strict';
// https://tools.ietf.org/html/rfc4648
describe('sjcl.codec.base32', function () {
	var strToBits = sjcl.codec.utf8String.toBits;
	var bitsToStr = sjcl.codec.utf8String.fromBits;

	var fromBits = sjcl.codec.base32.fromBits;
	var toBits = sjcl.codec.base32.toBits;

	it('fromBits (from rfc4648)', function () {
		expect(fromBits(strToBits(''))).to.equal('');
		expect(fromBits(strToBits('f'))).to.equal('MY======');
		expect(fromBits(strToBits('fo'))).to.equal('MZXQ====');
		expect(fromBits(strToBits('foo'))).to.equal('MZXW6===');
		expect(fromBits(strToBits('foob'))).to.equal('MZXW6YQ=');
		expect(fromBits(strToBits('fooba'))).to.equal('MZXW6YTB');
		expect(fromBits(strToBits('foobar'))).to.equal('MZXW6YTBOI======');
	});

	it('toBits (from rfc4648)', function () {
		expect(bitsToStr(toBits(''))).to.equal('');
		expect(bitsToStr(toBits('MY======'))).to.equal('f');
		expect(bitsToStr(toBits('MZXQ===='))).to.equal('fo');
		expect(bitsToStr(toBits('MZXW6==='))).to.equal('foo');
		expect(bitsToStr(toBits('MZXW6YQ='))).to.equal('foob');
		expect(bitsToStr(toBits('MZXW6YTB'))).to.equal('fooba');
		expect(bitsToStr(toBits('MZXW6YTBOI======'))).to.equal('foobar');
	});

	/*
	Copyright (c) 2011, Chris Umbel (see https://github.com/chrisumbel/thirty-two)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	*/
	it('fromBits (from thirty-two)', function () {
		expect(fromBits(strToBits('a'))).to.equal('ME======');
		expect(fromBits(strToBits('be'))).to.equal('MJSQ====');
		expect(fromBits(strToBits('bee'))).to.equal('MJSWK===');
		expect(fromBits(strToBits('beer'))).to.equal('MJSWK4Q=');
		expect(fromBits(strToBits('beers'))).to.equal('MJSWK4TT');
		expect(fromBits(strToBits('beers 1'))).to.equal('MJSWK4TTEAYQ====');
		expect(fromBits(strToBits('shockingly dismissed'))).to.equal('ONUG6Y3LNFXGO3DZEBSGS43NNFZXGZLE');
	});

	it('toBits (from thirty-two)', function () {
		expect(bitsToStr(toBits('ME======'))).to.equal('a');
		expect(bitsToStr(toBits('MJSQ===='))).to.equal('be');
		expect(bitsToStr(toBits('ONXW4==='))).to.equal('son');
		expect(bitsToStr(toBits('MJSWK==='))).to.equal('bee');
		expect(bitsToStr(toBits('MJSWK4Q='))).to.equal('beer');
		expect(bitsToStr(toBits('MJSWK4TT'))).to.equal('beers');
		expect(bitsToStr(toBits('MJSWK4TTN5XA===='))).to.equal('beerson');
		expect(bitsToStr(toBits('MJSWK4TTEAYQ===='))).to.equal('beers 1');
		expect(bitsToStr(toBits('ONUG6Y3LNFXGO3DZEBSGS43NNFZXGZLE'))).to.equal('shockingly dismissed');
	});
});
