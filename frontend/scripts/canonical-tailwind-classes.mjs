import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { __unstable__loadDesignSystem } from "@tailwindcss/node";
import ts from "typescript";

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, "src");
const cssPath = path.join(srcRoot, "index.css");
const checkOnly = process.argv.includes("--check");
const supportedExtensions = new Set([".html", ".js", ".jsx", ".ts", ".tsx"]);
const canonicalizeOptions = {
  collapse: true,
  logicalToPhysical: true,
  rem: 16,
};

function usage() {
  console.log(
    "Usage: npm run tailwind:canonical [-- --check]\n" +
      "Canonicalizes static Tailwind class strings using Tailwind v4.",
  );
}

if (process.argv.includes("--help")) {
  usage();
  process.exit(0);
}

function shouldVisitFile(filePath) {
  return supportedExtensions.has(path.extname(filePath));
}

async function collectFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
    } else if (entry.isFile() && shouldVisitFile(entryPath)) {
      files.push(entryPath);
    }
  }

  return files;
}

function canonicalizeClassText(text, designSystem) {
  const leadingWhitespace = text.match(/^\s*/)?.[0] ?? "";
  const trailingWhitespace = text.match(/\s*$/)?.[0] ?? "";
  const classText = text.trim();
  const candidates = classText.match(/\S+/g);
  if (!candidates) {
    return text;
  }

  return leadingWhitespace + designSystem
    .canonicalizeCandidates(candidates, canonicalizeOptions)
    .map((candidate, index) =>
      isArbitraryRadius(candidates[index]) ? candidates[index] : candidate,
    )
    .join(" ") + trailingWhitespace;
}

function isArbitraryRadius(candidate) {
  return /(^|:)rounded(?:-[trblse]{1,2})?-\[[^\]]+\]$/.test(candidate);
}

function addReplacement(replacements, start, end, source, designSystem) {
  if (start >= end) {
    return;
  }

  const original = source.slice(start, end);
  const canonical = canonicalizeClassText(original, designSystem);

  if (canonical !== original) {
    replacements.push({ start, end, value: canonical });
  }
}

function addStringReplacement(replacements, node, source, designSystem) {
  addReplacement(
    replacements,
    node.getStart() + 1,
    node.getEnd() - 1,
    source,
    designSystem,
  );
}

function addTemplatePartReplacement(replacements, node, source, designSystem) {
  const text = node.getText();
  let startOffset = 1;
  let endOffset = 1;

  if (
    ts.isTemplateHead(node) ||
    ts.isTemplateMiddle(node)
  ) {
    endOffset = 2;
  }

  if (text.length <= startOffset + endOffset) {
    return;
  }

  addReplacement(
    replacements,
    node.getStart() + startOffset,
    node.getEnd() - endOffset,
    source,
    designSystem,
  );
}

function visitClassExpression(node, source, replacements, designSystem) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    addStringReplacement(replacements, node, source, designSystem);
    return;
  }

  if (ts.isTemplateExpression(node)) {
    addTemplatePartReplacement(
      replacements,
      node.head,
      source,
      designSystem,
    );
    for (const span of node.templateSpans) {
      visitClassExpression(span.expression, source, replacements, designSystem);
      addTemplatePartReplacement(
        replacements,
        span.literal,
        source,
        designSystem,
      );
    }
    return;
  }

  ts.forEachChild(node, (child) =>
    visitClassExpression(child, source, replacements, designSystem),
  );
}

function transformTsx(source, filePath, designSystem) {
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    path.extname(filePath) === ".tsx" || path.extname(filePath) === ".jsx"
      ? ts.ScriptKind.TSX
      : ts.ScriptKind.TS,
  );
  const replacements = [];

  function visit(node) {
    if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      (node.name.text === "className" || node.name.text === "class")
    ) {
      const initializer = node.initializer;

      if (initializer) {
        if (ts.isStringLiteral(initializer)) {
          addStringReplacement(replacements, initializer, source, designSystem);
        } else if (ts.isJsxExpression(initializer) && initializer.expression) {
          visitClassExpression(
            initializer.expression,
            source,
            replacements,
            designSystem,
          );
        }
      }

      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return applyReplacements(source, replacements);
}

function transformHtml(source, designSystem) {
  return source.replace(
    /\bclass(Name)?=(["'])(.*?)\2/gs,
    (match, name = "", quote, classText) => {
      const canonical = canonicalizeClassText(classText, designSystem);
      return canonical === classText
        ? match
        : `class${name}=${quote}${canonical}${quote}`;
    },
  );
}

function applyReplacements(source, replacements) {
  if (replacements.length === 0) {
    return source;
  }

  return replacements
    .sort((a, b) => b.start - a.start)
    .reduce(
      (current, replacement) =>
        current.slice(0, replacement.start) +
        replacement.value +
        current.slice(replacement.end),
      source,
    );
}

async function main() {
  const css = await fs.readFile(cssPath, "utf8");
  const designSystem = await __unstable__loadDesignSystem(css, {
    base: projectRoot,
  });
  const files = [
    path.join(projectRoot, "index.html"),
    ...(await collectFiles(srcRoot)),
  ];
  const changedFiles = [];

  for (const filePath of files) {
    const original = await fs.readFile(filePath, "utf8");
    const ext = path.extname(filePath);
    const next =
      ext === ".html"
        ? transformHtml(original, designSystem)
        : transformTsx(original, filePath, designSystem);

    if (next !== original) {
      changedFiles.push(path.relative(projectRoot, filePath));
      if (!checkOnly) {
        await fs.writeFile(filePath, next);
      }
    }
  }

  if (changedFiles.length === 0) {
    console.log("Tailwind classes are already canonical.");
    return;
  }

  const heading = checkOnly
    ? "Non-canonical Tailwind classes found:"
    : "Canonicalized Tailwind classes in:";
  console.log(heading);
  for (const filePath of changedFiles) {
    console.log(`- ${filePath}`);
  }

  if (checkOnly) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
