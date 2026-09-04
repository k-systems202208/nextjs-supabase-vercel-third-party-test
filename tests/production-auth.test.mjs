import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authActions = readFileSync(new URL("../app/auth/actions.ts", import.meta.url), "utf8");

test("production signup uses the exact auth confirmation path", () => {
  assert.match(authActions, /emailRedirectTo: `\$\{origin\}\/auth\/confirm`/);
  assert.doesNotMatch(authActions, /emailRedirectTo:[^\n]*\?next=/);
});
