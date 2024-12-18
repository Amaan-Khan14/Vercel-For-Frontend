import { exec } from "child_process";
import path from "path";
import fs from "fs";

export async function buildProject(id: string) {
    const lowerCaseId = id.toLowerCase();
    const projectPath = path.join(process.cwd(), 'dist', `output/${id}`);

    // Create a Dockerfile in the project directory.
    const dockerFilePath = path.join(projectPath, 'Dockerfile')
    fs.writeFileSync(dockerFilePath, `
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
    `)

    return new Promise((resolve, reject) => {
        const buildCommand = `
cd ${path.join(projectPath)} && 
docker build -t frontend-build-${lowerCaseId} . && 
docker create --name build-container-${lowerCaseId} frontend-build-${lowerCaseId} && 
(docker cp build-container-${lowerCaseId}:/app/build ${projectPath}/build || 
 docker cp build-container-${lowerCaseId}:/app/dist ${projectPath}/build) && 
docker rm build-container-${lowerCaseId} && 
docker rmi frontend-build-${lowerCaseId} && 
rm -rf Dockerfile
        `.replace(/\n/g, ' ');

        const child = exec(buildCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Execution error: ${error}`);
                reject(error);
                return;
            }

            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }

            console.log(`stdout: ${stdout}`);
            resolve("");
        });

        child.stdout?.on('data', function (data) {
            console.log('stdout: ' + data);
        });

        child.stderr?.on('data', function (data) {
            console.log('stderr: ' + data);
        });
    });
}