export class BitComp {
    public static stringToBuffer(str: string): ArrayBuffer {
        const array = new Uint16Array(str.length);
        for (let i = str.length; i-- > 0;) {
            array[i] = str.charCodeAt(i);
        }
        return array.buffer;
    }

    public static bufferToString(data: ArrayBuffer): string {
        return String.fromCharCode.apply(null, new Uint16Array(data));
    }

    /**
     * @param {number?} length EVEN optional. if larger than included string in bytes, right is padded with spaces; if shorter than string, string is truncated. 
     * @return {number} byteCount written number of bytes
     */
    public static stringIntoBuffer(str: string, buffer: ArrayBuffer, offset?: number, length?: number): number {
        const strLen = str.length;
        if (length === undefined) {
            length = str.length * 2;
        }

        const lengthToTransfer = ((strLen <= length / 2) ? strLen : length / 2);

        const array = new Uint16Array(buffer, offset, length);

        //Pad right with spaces
        if (lengthToTransfer * 2 < length) {
            array.fill(" ".charCodeAt(0), lengthToTransfer);
        }

        for (let i = lengthToTransfer; i-- > 0;) {
            array[i] = str.charCodeAt(i);
        }
        return length;
    }

    /**
     * Creates a UTF16 string from a section of a buffer
     * @param {ArrayBuffer} buffer
     * @param {number} offset
     * @param {number} length byte length of string buffer section
     */
    public static stringFromBuffer(buffer: ArrayBuffer, offset?: number, byteLength?: number): string {
        return String.fromCharCode.apply(null, new Uint16Array(buffer, offset, byteLength));
    }
}



//Bovius's Compression Code
// RoomPosition.prototype.toUnicode = function() {
//     return String.fromCharCode((this.x << 8) + this.y);
// }

// RoomPosition.prototype.fromUnicode = function(roomName, character) {
//     let integer = character.charCodeAt(0);
//     return new RoomPosition(
//         (integer >> 8), 
//         (integer & 255),
//         roomName
//     );  
// }