import fs from "fs/promises";
import { strict as assert } from "node:assert";
import { Article } from "./article";

/*
  Note:
    this function supports specific tree:
    /data
      /blogs -- *1
        /[year] -- *2
          /[filename].md

  Paramater:
    articleBaseDir(string): pass *1
*/
export const getAllArticles = async () => {
  const articleBaseDir = `${process.cwd()}/data/blogs`;

  // list *1
  const blogDir = await fs.readdir(articleBaseDir, {
    withFileTypes: true,
  });
  const blogDirNames = blogDir
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  // list *2
  const result = await blogDirNames.map(async (year) => {
    const yearDirFiles = await fs.readdir(`${articleBaseDir}/${year}`, {
      withFileTypes: true,
    });
    return yearDirFiles
      .filter((dirent) => dirent.isFile())
      .map((dirent) => dirent.name)
      .map((file) => `${year}/${file}`);
  });
  return (await Promise.all(result)).flat();
};

export const openArticle = async (pathInBlogs: string) => {
  const path = `${process.cwd()}/data/blogs/${pathInBlogs}`;
  const stat = await fs.stat(path);
  const article = await fs.readFile(path, "utf8");
  return new Article(article, pathInBlogs, stat.ctime, stat.atime);
};

const pathRegex = /(\d+)\/(.*)\.md/;
export const pathToSlug = (path: string) => {
  const result = path.match(pathRegex);
  if (result === null) return null;

  const [_, year, filename] = result;
  return `${year}-${filename}`;
};

const slugRegex = /(\d+)-(.*)/;
export const slugToPath = (path: string) => {
  const result = path.match(slugRegex);
  if (result === null) return null;

  const [_, year, filename] = result;
  return `${year}/${filename}.md`;
};
