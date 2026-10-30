import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, normalize, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';
const root = resolve('src/components');
const levels: Record<string, number> = { atoms: 0, molecules: 1, organisms: 2, templates: 3 };
function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)],
    )
    .filter((file) => /\.tsx?$/.test(file));
}
describe('Atomic Design boundaries', () => {
  it('keeps dependencies directed from larger compositions toward smaller components', () => {
    const violations: string[] = [];
    for (const file of files(root)) {
      const layer = relative(root, file).split('/')[0];
      const source = ts.createSourceFile(
        file,
        readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      for (const statement of source.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
          continue;
        const target = normalize(resolve(dirname(file), statement.moduleSpecifier.text));
        if (!target.startsWith(root + '/')) continue;
        const dependency = relative(root, target).split('/')[0];
        if (levels[dependency] > levels[layer])
          violations.push(`${relative(root, file)} imports ${dependency}`);
      }
    }
    expect(violations).toEqual([]);
  });
  it('keeps API calls and Redux subscriptions out of reusable UI components', () => {
    const violations = files(root).filter((file) =>
      /\b(?:fetch|useAppDispatch|useAppSelector|useGet\w+Query)\s*\(/.test(
        readFileSync(file, 'utf8'),
      ),
    );
    expect(violations.map((file) => relative(root, file))).toEqual([]);
  });
});
