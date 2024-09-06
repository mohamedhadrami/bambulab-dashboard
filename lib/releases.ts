import fs from 'fs';
import path from 'path';

const releasesDirectory = path.join(process.cwd(), 'release');

export function getAllReleases() {
    const releaseFolders = fs.readdirSync(releasesDirectory);

    const allReleases = releaseFolders.map((folder) => {
        const filePath = path.join(releasesDirectory, folder, 'description.md');
        const fileContents = fs.readFileSync(filePath, 'utf8');

        return {
            version: folder,
            content: fileContents,
        };
    });

    return allReleases.sort((a, b) => (a.version < b.version ? 1 : -1));
}
