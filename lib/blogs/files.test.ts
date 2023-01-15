import { assert, test } from "vitest";
import { getAllArticles, openArticle, pathToSlug, slugToPath } from "./files";

test("find articles", async () => {
  const result = await getAllArticles();
  assert.ok(!!result.find((v) => v == "2022/02-28-test.md"));
});

test("open articles", async () => {
  const result = await getAllArticles();
  const file = await openArticle(result[0]);
  assert.equal(file.attributes.title, "test post!");
  assert.ok(await file.renderHTML());
});

test("convert path to slug", () => {
  const pts = pathToSlug("2001/01-01-hello-world.md");
  assert.equal(pts, "2001-01-01-hello-world");
});

test("convert slug to path", () => {
  const stp = slugToPath("2001-01-01-hello-world");
  assert.equal(stp, "2001/01-01-hello-world.md");
});
