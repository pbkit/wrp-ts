import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import { branch } from "./misc.ts";

Deno.test("branch", () => {
  const gen = async function* gen() {
    yield 1;
    yield 2;
    yield 3;
  };

  const branchedGen = branch(gen());
  const branch1 = branchedGen.get();
  const branch2 = branchedGen.get();
  const branch3 = branchedGen.get();
  const branch4 = branchedGen.get();

  (async () => {
    let counter = 1;
    for await (const n of branch1) {
      assertEquals(n, counter++);
    }
  })();

  (async () => {
    let counter = 1;
    for await (const n of branch2) {
      assertEquals(n, counter++);
    }
  })();

  (async () => {
    let counter = 1;
    for await (const n of branch3) {
      assertEquals(n, counter++);
    }
    counter = 1;
    for await (const n of branch4) {
      assertEquals(n, counter++);
    }
  })();
});
