import fs from "fs";
import ignore from "ignore";
import path from "path";

export const getAllFiles = (folderPath: string): string[] => {

    const gitignorePath = path.join(folderPath, '.gitignore');
    let ig = ignore();
    try {
        if (fs.existsSync(gitignorePath)) {
            const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
            console.log('gitignoreContent:', gitignoreContent);
            ig = ig.add(gitignoreContent);
        }
    } catch (error) {
        console.error('Error reading .gitignore:', error);
    }


    let response: string[] = [];

    const traverseDirectory = (currentPath: string, relativePath: string = '') => {
        const allFilesAndFolders = fs.readdirSync(currentPath);

        allFilesAndFolders.forEach(file => {
            const fullFilePath = path.join(currentPath, file);
            const relativeFilePath = path.join(relativePath, file);

            // Check if the file/directory is ignored
            if (ig.ignores(relativeFilePath)) {
                return; // Skip ignored files and directories
            }

            const stat = fs.statSync(fullFilePath);

            if (stat.isDirectory()) {
                traverseDirectory(fullFilePath, relativeFilePath);
            } else {
                response.push(fullFilePath);
            }
        });
    };

    traverseDirectory(folderPath);

    return response;
}