import { globSync } from 'glob';
import Path from 'path';
import { ActionIndex } from '../types/actions';

function filesWithExtensionsWithoutExtensions(
  path: string,
  extensions: string[],
): string[] {
  const extensionsSet = new Set(extensions.map((e) => `.${e.toLowerCase()}`));
  const allFiles: string[] = [];

  globSync('*', {
    withFileTypes: true,
    cwd: path,
    matchBase: true,
    nocase: true,
    // nodir: true,
  }).map((value) => {
    const filePath: string = value.relative();
    const fileExtension: string = Path.extname(filePath).toLowerCase();

    if (extensionsSet.has(fileExtension)) {
      const fileBase: string = Path.basename(filePath);
      allFiles.push(
        Path.join(
          Path.dirname(filePath),
          fileBase.substring(0, fileBase.length - fileExtension.length),
        ),
      );
    }
  });

  return allFiles;
}

function findDuplicates(values: string[]): string[] {
  const counter: { [key: string]: number } = {};
  const duplicates: string[] = [];

  values.forEach((value) => {
    counter[value] = (counter[value] ?? 0) + 1;
  });
  for (const key in counter) {
    if (1 < counter[key]) {
      duplicates.push(key);
    }
  }

  return duplicates;
}

export async function getActions(path: string): Promise<ActionIndex> {
  const allFiles = filesWithExtensionsWithoutExtensions(path, ['js', 'ts']);

  const duplicates = findDuplicates(allFiles);

  if (0 === allFiles.length) {
    throw new Error('No actions found in the specified path');
  }

  if (duplicates.length) {
    throw new Error(`Duplicate routes: ${duplicates}`);
  }

  const actions: ActionIndex = {};

  allFiles.forEach(async (file) => {
    const matches = file.match(/^(?<name>[^/]*)$/i);

    if (matches?.groups) {
      const action = await require(Path.resolve(path, file));
      actions[matches.groups.name] = action.default;
      console.info(`Loaded '${matches.groups.name}' action file`);
    } else {
      console.warn(
        `Skipping ${file} as it doesn't comply to subscription conventions.`,
      );
    }
  });

  return actions;
}
