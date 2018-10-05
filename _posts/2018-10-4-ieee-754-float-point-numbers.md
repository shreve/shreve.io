---
title: IEEE-754 Floating Point Numbers
date: 2018-10-04
tags:
- programming
- computer science
description: Some notes on how floating point numbers are stored and how to use them
---

Here are some notes about how floating point numbers are stored and how to use
them.

Floats basically use scientific notation, but with 2 instead of 10. They can
either be stored as 32 or 64 bits.

1. 1 sign bit

2. 8 or 11 exponent bits

3. 23 or 52 mantissa bits

"Mantissa" is the word for the base number between being multiplied in
scientific notation.

Several things to know up front:

1. The exponent is unsigned, but biased. For 32 bit, offset 127. For 64 bit,
   offset 1023. For minimal exponent, use value 1. For value of 0, use the value
   of the offset. For maximal exponent, use double the value of the offset.

2. Mantissa bits are read left to right and represent fractional binary values.

3. The mantissa bits should exclude a 1 to the left. For correct scientific
   notation, we should always have a 1 in the most significant value. Since it's
   always the same value, we skip it when encoding.

## Encoding Example

Encoding a decimal number to floating point

    -450.875

1. This number is negative, so it's sign bit is one.

        S = 1

2. Encode the integral part of the number.

        450 = 0b0001 1100 0010

3. Find the value of the fractional part of the number.

        0.875 x 2 = 1.75   [1]
        0.75 x 2  = 1.5    [1]
        0.5 x 2   = 1.0    [1]
        0.0 x 2   = 0.0    [0]

        0.875 = 0b1110
              = (1/2) + (1/4) + (1/8)

4. Our Mantissa bits are the combination of integral and fractional parts.

        M = 0b0001 1100 0010.1110

5. The exponent is the number of spaces we need to move the decimal to be behind
   the leading one, plus the bias.

        M = 1.11000010111
             ^        ^ 8 spaces moved

        Exponent = 8 + 127 = 10000111

6. Combine all parts S + E + M

        1 10000111 11000010111000000000000
        Or, in hex 0xc3e17000

## Addition Example

Add together two floating point numbers

    25.125 + -122.625

1. Convert both to floating point

        0 10000011 10010010000000000000000
        1 10000101 11101010100000000000000

2. Match the exponents by right shifting the mantissa bits of the smaller number

        0 10000101 01100100100000000000000
        1 10000101 11101010100000000000000

    Rember to incorporate the leading 1 before the bits began.

3. Now you can add or subtract the mantissa bits for your answer.

         01100100100000000000000
        -11101010100000000000000
        ––––––––––––––––––––––––
        -10000110000000000000000

4. The resulting bits were negative so the result is negative. The exponent is
   what was matched.

        1 10000101 10000110000000000000000

5. Just to verify the answer is correct, convert to decimal

        110001.1 = -97.5
