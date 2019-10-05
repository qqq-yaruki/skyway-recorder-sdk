const lolex = require("lolex");
const Signaling = require("../src/signaling");
const Rest = require("../src/util/rest");

let signaling;
let getJSONSpy;
let postJSONSpy;
beforeEach(() => {
  const rest = new Rest();
  getJSONSpy = jest
    .spyOn(rest, "getJSON")
    .mockResolvedValue({ status: 200, data: {} });
  postJSONSpy = jest
    .spyOn(rest, "postJSON")
    .mockResolvedValue({ status: 200, data: { ok: 1 } });
  signaling = new Signaling(rest);
});
afterEach(() => {
  getJSONSpy.mockRestore();
  postJSONSpy.mockRestore();
});

describe("initialize()", () => {
  test("should call rest", async () => {
    const res = await signaling.initialize({ a: 1 });

    expect(postJSONSpy).toHaveBeenCalledWith("/initialize", { a: 1 });
    expect(res).toEqual({ ok: 1 });
  });
});

describe("connect()", () => {
  test("should call rest", async () => {
    const res = await signaling.connect({ a: 1 });

    expect(postJSONSpy).toHaveBeenCalledWith("/transport/connect", { a: 1 });
    expect(res).toEqual({ ok: 1 });
  });
});

describe("produce()", () => {
  test("should call rest", async () => {
    const res = await signaling.produce({ a: 1 });

    expect(postJSONSpy).toHaveBeenCalledWith("/transport/produce", { a: 1 });
    expect(res).toEqual({ ok: 1 });
  });
});

describe("start()", () => {
  test("should call rest", async () => {
    const res = await signaling.start({ a: 1 }, 3000);

    expect(postJSONSpy).toHaveBeenCalledWith("/record/start", { a: 1 });
    expect(res).toEqual({ ok: 1 });
  });

  test("should call rest with interval", async () => {
    const clock = lolex.install();

    await signaling.start({ a: 1 }, 3000);

    expect(getJSONSpy).not.toHaveBeenCalled();
    clock.tick(10000);
    expect(getJSONSpy).toHaveBeenCalledWith("/record/ping");
    expect(getJSONSpy).toHaveBeenCalledTimes(3);

    clock.uninstall();
  });
});

describe("stop()", () => {
  test("should call rest", async () => {
    const res = await signaling.stop();

    expect(postJSONSpy).toHaveBeenCalledWith("/record/stop", {});
    expect(res).toEqual({ ok: 1 });
  });

  test("should stop interval", async () => {
    const clock = lolex.install();

    await signaling.start({ a: 1 }, 3000);
    await signaling.stop();

    clock.tick(10000);
    expect(getJSONSpy).not.toHaveBeenCalled();

    clock.uninstall();
  });
});
