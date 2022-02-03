import { Dirent, readdirSync } from 'fs';
import { resolve, join } from 'path';

type DirectoryType = {
  files: string[];
  folders: string[];
};

export const getFilesFromDirectory = (
  path: string,
  paths: DirectoryType = { files: [], folders: [] },
): DirectoryType => {
  const dirents = readdirSync(resolve(path), {
    withFileTypes: true,
  });

  const resolvePath = (d: Dirent) => resolve(join(path, d.name));

  return dirents.reduce((acc) => {
    const files = dirents
      .filter((dirent) => dirent.name.endsWith('.proto'))
      .map(resolvePath)
      .filter((file) => !acc.files.includes(file));

    const folders = [
      ...dirents
        .filter(
          (dirent) => dirent.isDirectory() && !dirent.name.startsWith('.'),
        )
        .map(resolvePath),
      ...paths.folders,
    ];

    if (!folders.length)
      return { ...acc, files: [...files, ...acc.files], folders };

    return getFilesFromDirectory(folders.pop(), {
      files: [...files, ...acc.files],
      folders,
    });
  }, paths);
};
