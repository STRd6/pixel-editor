buffer = new ArrayBuffer(2)
new DataView(buffer).setInt16(0, 256, true)
module.exports = new Int16Array(buffer)[0] is 256
