import {extname, join} from "path";
import { exec } from "child_process";
import {existsSync, mkdirSync, writeFile } from "fs";
import axios from "axios"

export function readKeys() {
    const args = process.argv.slice(2);

    // Проверка на число введённых аргументов
    if (args.length > 5) {
        throw new Error("Введено слишком много аргументов");
    } else if (args.length < 3) {
        throw new Error("Введено недостаточно аргументов");
    } else if (args[2] <= 0) {
        throw new Error("Некорректное значение максимальной глубины")
    }
    
    // Объект с ключами командной строки
    const keys = {
        graphProgramPath: args[0],
        packageName: args[1],
        depth: args[2],
        version: args[3] || "latest",
        targetFramework: args[4] || ".NETStandard2.0"
    };

    return keys;
}

export function findVersion(versions, packageVersion) {
    // Если нужно найти последнюю версию
    if (packageVersion === "latest")
        return versions[versions.length - 1];

    // Если нужно найти конкретную версию
    if(!"[(".includes(packageVersion[0])) {
        if(versions.includes(packageVersion)) {
            return packageVersion;
        }
    }

    // Достаём границы из диапазона
    const range = packageVersion.split(",")
    
    range.forEach((element, index) => {
        range[index] = element.replace(/[^.0-9]/g, "")
    });

    const leftBorder = packageVersion[0];
    const leftValue = range[0] || "";
    const rightBorder = packageVersion[packageVersion.length - 1];
    const rightValue = range[range.length - 1] || "";

    // Если требуется версия, которая больше заданной
    if ("[(".includes(leftBorder) && ")".includes(rightBorder) && !rightValue) {
        return versions[versions.length - 1];
    }

    // Если требуется версия, которая меньше заданной
    if ("(".includes(leftBorder) && ")]".includes(rightBorder) && !leftValue) {
        let curVersion = "";
        for (const version of versions) {
            if (version < rightValue && ")]".includes(rightBorder)) {
                curVersion = version;
            } else if (version === rightValue && rightBorder === "]") {
                curVersion = version;
            } else if (curVersion) {
                return curVersion;
            }
        }
    }

    if(leftValue && rightValue && leftValue < rightValue) {
        let curVersion = "";
        for (const version of versions) {
            if (version < rightValue && ")]".includes(rightBorder)) {
                curVersion = version;
            } else if (version === rightValue && rightBorder === "]") {
                curVersion = version;
            } else if (curVersion && (curVersion >= leftValue && leftBorder === "[" || curVersion > leftValue && leftBorder === "(")) {
                return curVersion;
            } 
        }
    }

    throw new Error("Не удалось найти версию");
}

export async function getPackageVersion(packageName, packageVersion) {
    // Ссылка на все версии пакета
    const versionsUrl = `https://api.nuget.org/v3-flatcontainer/${packageName.toLowerCase()}/index.json`;

    try {
        // Запрос на получение версии
        const res = await axios.get(versionsUrl);
        const version = findVersion(res.data.versions, packageVersion);

        // Возврат найденной версии
        return version;

    } catch(err) {
        throw new Error(`Ошибка при получении версии пакета ${packageName}: ${err.message}`);
    }
}

export async function findDependencies(dependenciesUrl, packageTargetFramework) {
    try {
        const res = await axios.get(dependenciesUrl);
        const packageData = res.data.dependencyGroups.find(element => element.targetFramework === packageTargetFramework);
        return packageData.dependencies || [];
    } catch(err) {
        throw new Error(`Ошибка при получении зависисмостей: ${err.message}`);
    }
}

export async function fetchDependencies(packageName, packageVersion, packageTargetFramework) {
    // Ссылка на зависисмости пакета
    const packageUrl = `https://api.nuget.org/v3/registration5-gz-semver2/${packageName.toLowerCase()}/${packageVersion}.json`

    try {
        // Получаем массив зависимостей
        const res = await axios.get(packageUrl);
        const dependenciesUrl = res.data.catalogEntry;
        const dependencies = findDependencies(dependenciesUrl, packageTargetFramework);
        return dependencies;
    } catch(err) {
        console.error(`Ошибка при получении пакета ${packageName}: ${err.message}`);
        process.exit(1)
    }
}

export async function getDependencies(packageName, packageVersion, packageTargetFramework, depth, curDepth, graph) {
    // Проверка на достижение максимальной глубины
    if (curDepth > depth) {
        return;
    }
    
    // Получение информации о версии
    packageVersion = await getPackageVersion(packageName, packageVersion);

    // Получение данных о зависисмостях пакета
    const packageDependencies = await fetchDependencies(packageName, packageVersion, packageTargetFramework);

    if (packageDependencies.length === 0) {
        return;
    }

    // Создаем массив зависимостей для конкретного пакета
    if (!graph[`${packageName} ${packageVersion}`]) {
        graph[`${packageName} ${packageVersion}`] = [];
    }

     // Получаем данные о версии
    for (const dependency of packageDependencies) {
        const name = dependency.id;
        const version = await getPackageVersion(dependency.id, dependency.range);
        const fullPackageName = `${packageName} ${packageVersion}`;
        const fullDependencyName = `${name} ${version}`;
        if (! graph[fullPackageName].includes(fullDependencyName)){
            graph[fullPackageName].push(fullDependencyName);
        }

        // Рекурсивный вызов для зависимостей
        await getDependencies(name, version, packageTargetFramework, depth, curDepth + 1, graph);
    }
}

export function generatePlantUmlCode(graph) {
    let code = "@startuml\n";

    for (const [key, dependencies] of Object.entries(graph)) {
        dependencies.forEach(dependency => {
            code += `[${key}] --> [${dependency}]\n`;
        });
    }

    code += "@enduml";
    return code;
}

export function savePlantUmlCode(code, folderPath, fileName) {
    // Создание папки, если её нет
    if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true });
    }

    // Создание файла
    const filePath = join(folderPath, fileName);

    // Запись файла
    writeFile(filePath, code, err => {
        if(!err) {
            console.log(`Файл ${fileName} успешно сохранён`);
        } else {
            console.error(`Ошибка при сохранении файла: ${err.message}`);
        }
    })

    return filePath;
}

function generatePlantUmlGraph(plantUmlPath, filePath) {
    // Команда для вызова PlantUML
    const command = `java -jar ${plantUmlPath} -tsvg ${filePath}`;

    // Выполнение команды
    exec(command, (err) => {
        if (err) {
            console.error(`Ошибка выполнения команды: ${err.message}`);
            return;
        }
        console.log("Изображение графа успешно сохранено");
    });
}

async function main() {
    try {
        const keys = readKeys();
        const graph = {};
        const folderPath = `./packages/${keys.packageName}`;
        const fileName = `${keys.packageName}.puml`;
        let curDepth = 1;

        await getDependencies(
            keys.packageName, 
            keys.version,
            keys.targetFramework,
            keys.maxDepth,
            curDepth,
            graph
        )

        const code = generatePlantUmlCode(graph);
        const filePath = savePlantUmlCode(code, folderPath, fileName);
        generatePlantUmlGraph(keys.graphProgramPath, filePath);
    }
    catch (err) {
        console.error(err.message);
    }
}

main();


// Пример команады node visualizer.js ../../Downloads/plantuml-1.2024.7.jar serilog 10
