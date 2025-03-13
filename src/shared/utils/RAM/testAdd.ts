import { AddrGen } from "./AddrGen";

console.log(AddrGen.generate(99));  // "ADDR-3039"
console.log(AddrGen.generate(98.123)); // "ADDR-181CD"
console.log(AddrGen.generate(255)); // "ADDR-FF"
console.log(AddrGen.generate(-1)); // "ADDR--1"
console.log(AddrGen.generate(999999999)); // "ADDR-3B9AC9FF"
