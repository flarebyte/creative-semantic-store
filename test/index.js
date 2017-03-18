import test from "tape"
import creativeSemanticStore from "../src"

test("creativeSemanticStore", (t) => {
  t.plan(1)
  t.equal(true, creativeSemanticStore(), "return true")
})
