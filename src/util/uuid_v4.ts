// Thanks to https://gist.github.com/scwood/3bff42cc005cc20ab7ec98f0d8e1d59d

/*
    Paraphrased from RFC 4122:
    The formal definition of the UUID string representation is
    provided by the following ABNF:
    UUID                   = time-low "-" time-mid "-"
                             time-high-and-version "-"
                             clock-seq-and-reserved
                             clock-seq-low "-" node
    time-low               = 4hexOctet
    time-mid               = 2hexOctet
    time-high-and-version  = 2hexOctet
    clock-seq-and-reserved = hexOctet
    clock-seq-low          = hexOctet
    node                   = 6hexOctet
    hexOctet               = hexDigit hexDigit
    hexDigit =
          "0" / "1" / "2" / "3" / "4" / "5" / "6" / "7" / "8" / "9" /
          "a" / "b" / "c" / "d" / "e" / "f" /
          "A" / "B" / "C" / "D" / "E" / "F"
   The version 4 UUID is meant for generating UUIDs from truly-random or
   pseudo-random numbers.
   The algorithm is as follows:
   -  Set the two most significant bits (bits 6 and 7) of the
      clock-seq-and-reserved to zero and one, respectively.
   -  Set the four most significant bits (bits 12 through 15) of the
      time-high-and-version field to 0100
   -  Set all the other bits to randomly (or pseudo-randomly) chosen
      values.
*/

export function uuidV4() {
  const uuid = new Array(36);
  for (let i = 0; i < 36; i++) {
    uuid[i] = Math.floor(Math.random() * 16);
  }
  uuid[14] = 4; // set bits 12-15 of time-high-and-version to 0100
  uuid[19] = uuid[19] &= ~(1 << 2); // set bit 6 of clock-seq-and-reserved to zero
  uuid[19] = uuid[19] |= 1 << 3; // set bit 7 of clock-seq-and-reserved to one
  uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
  return uuid.map((x) => x.toString(16)).join("");
}
