import { WireValue } from "../../src/core/WireValue";

test("unknown generator", () => {
    const wv = WireValue.unknown(8);
    expect(wv.width).toBe(8);
    const data = new Uint8Array(8);
    data.fill(2);

    expect(wv.data).toEqual(data);
});

test("reset", () => {
    const wv = WireValue.unknown(8);
    wv.data.fill(0);

    const dataZero = new Uint8Array(8);
    dataZero.fill(0);
    expect(wv.data).toEqual(dataZero);

    WireValue.reset(wv);
    const dataUnknown = new Uint8Array(8);
    dataUnknown.fill(2);

    expect(wv.data).toEqual(dataUnknown);
});