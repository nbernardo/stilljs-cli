import fs from 'fs';
import colors from 'yoctocolors';
import { sleepFor } from '../util/time.js';


export class FileHelper {

    static rootFiles = [
        '@still', 'app-setup.js', 'app-template.js', 'index.html', 'route.map.js'
    ];

    static wasRootFolderReached(actualDir) {

        const files = fs.readdirSync(actualDir);

        let counter = 0;
        for (const file of files) {
            if (FileHelper.rootFiles.includes(file)) counter++;
        }

        return {
            flag: counter == FileHelper.rootFiles.length,
            actualDir
        };
    }

    static async parseDirTree(cmpPath, cmpName) {

        let folder, dirPath;

        if (cmpPath != '') {
            folder = cmpPath.shift();
            dirPath = `${folder ? folder : ''}`;
        }

        while (folder) {

            const folderExists = fs.existsSync(dirPath);
            if (!folderExists) fs.mkdirSync(dirPath);

            folder = cmpPath.shift();
            if (folder) dirPath = `${dirPath}/${folder}`;
            await sleepFor(200);
        }

        const fileName = String(cmpName[0]).toUpperCase() + String(cmpName.slice(1));
        return { dirPath, fileName }


    }

    static componentTemplate = (cmpName, superClsPath) =>
        'import { ViewComponent } from ' + superClsPath
        + '\n\nexport class ' + cmpName + ' extends ViewComponent {\n'
        + '\n'
        + '\tisPublic = true;'
        + '\n'
        + '\ttemplate = `\n'
        + '\t\t<h1 class="still-fresh-generated-cmp">\n'
        + '\t\t\t' + cmpName + '  auto generated content\n'
        + '\t\t</h1>'
        + '\n\t`;\n'
        + '\n'
        + '\tconstructor(){\n'
        + '\t\tsuper();'
        + '\n'
        + '\t}\n'
        + '\n'
        + '\n'
        + '}';


    static componentModel(cmpName, importPath) {
        const superClsPath = `"${importPath}/@still/component/super/ViewComponent.js";`;
        return FileHelper.componentTemplate(cmpName, superClsPath);
    }

    static createComponentFile(cmpName, rootFolder, dirPath, fileName) {

        const cmpContent = FileHelper.componentModel(cmpName, rootFolder);
        const isValidDir = dirPath != '' && dirPath != undefined;
        const cmpDirPath = isValidDir ? dirPath : '';
        const cmpFullPath = `${isValidDir ? cmpDirPath + '/' : ''}${fileName}.js`;

        fs.writeFileSync(`${cmpFullPath}`, cmpContent);

        return cmpFullPath;

    }

    static isItRootFolder(spinner, cmdObj, showLog = true) {

        const { flag, actualDir } = FileHelper.wasRootFolderReached(process.cwd());

        if (flag) {
            if (showLog)
                FileHelper.wrongFolderCmpCreationError(spinner, cmdObj);
            return { flag, actualDir };
        }

        return { flag, actualDir };

    }


    static wrongFolderCmpCreationError(spinner, cmdObj) {

        spinner.error(`Failed to create new component`);
        cmdObj.cmdMessage(
            '\n  You\'re creating component from project root folder, you ' + colors.bold(colors.red('cannot')) + ' do it'
            + '\n  without specifying the app/ or ./app/ path as the bellow example:\n'
            + '\n\t- ' + colors.bold(colors.green('npx still create component')) + ' app/path-to/MyComponent'
            + '\n\n  Alternatively you can do ' + colors.bold(colors.green('cd app/')) + ' and then create your component from there'
            + '\n  since this is the root of the app'
        );
        cmdObj.newCmdLine();

    }

    static noStillProjectFolderError(spinner, cmdObj) {

        cmdObj.cmdMessage('\n')
        spinner.error(colors.bold(colors.red('Failed to create new component')));
        cmdObj.cmdMessage(
            '\n  You\'re not inside a Still.js project folder, please follow bellow instructions:'
            + '\n\n\t- navigate to you project folder and run ' + colors.bold(colors.green('npx still create component'))
            + ' app/path-to/MyComponent again '
            + '\n\n\t-  or create a new projec typing ' + colors.bold(colors.green('npx still create project project-name'))
        );
        cmdObj.newCmdLine();

    }

}