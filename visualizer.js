import {extname} from "path";
import { existsSync, read } from "fs";
import axios from "axios"

function readKeys() {
    const args = process.argv.slice(2);

    // Проверка на число введённых аргументов
    if (args.length > 5) {
        console.log("Введено слишком много аргументов");
        process.exit(1);
    } else if (args.length < 3) {
        console.log("Введено недостаточно аргументов");
        process.exit(1);
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

function findVersion(versions, packageVersion) {
    // Если нужно найти последнюю версию
    if (packageVersion === "latest")
        return versions[versions.length - 1];

    // Если нужно найти конкретную версию
    if(!"[(".includes(packageVersion[0])) {
        return versions.includes(packageVersion) ? packageVersion : "not found";
    }

    // Достаём границы из диапазона
    const range = packageVersion.split(",")
    
    range.forEach((element, index) => {
        range[index] = element.replace(/[^.0-9]/g, "")
    });

    const rangeObject = {
        leftBorder: packageVersion[0],
        leftValue: range[0] || "",
        rightBorder: packageVersion[packageVersion.length - 1],
        rightValue: range[packageVersion.length - 1] || ""
    }

    // Если требуется версия, которая больше заданной
    if (
        "[(".includes(rangeObject.leftBorder) && 
        ")".includes(rangeObject.rightBorder) && 
        rangeObject.rightValue === ""
    ) {
        return versions[versions.length - 1];
    }

    // Если требуется версия, которая меньше заданной
    if (
        "(".includes(rangeObject.leftBorder) && 
        ")]".includes(rangeObject.rightBorder) && 
        rangeObject.leftValue === ""
    ) {
        let curVersion = versions[0];
        for (const version of versions) {
            if (curVersion < rangeObject.rightValue && 
                ")]".includes(rangeObject.rightBorder)
            ) {
                curVersion = version
            } else if (curVersion === rangeObject.rightValue && 
                rangeObject.rightBorder === "]"
            ) {
                curVersion = version
            } else {
                return curVersion
            }
        }
    }

    console.log("Не удалось найти версию");
    return false;
}

async function getPackageVersion(packageName, packageVersion) {
    // Ссылка на все версии пакета
    const versionsUrl = `https://api.nuget.org/v3-flatcontainer/${packageName.toLowerCase()}/index.json`;

    // Запрос на получение версии
    return axios.get(versionsUrl)
        .then(res => {
            // Получение версии
            const versions = res.data.versions;
            const version = findVersion(versions, packageVersion);
  
            // Проверка наличия версии
            if (version === "not found" || !version) {
                throw new Error(`версия ${packageVersion} пакета не найдена`);
            }

            // Возврат найденной версии
            return version;
        })
        .catch((err) => {
            console.error(`Ошибка при получении версии пакета ${packageName}: ${err.message}`);
        })
}

async function findDependencies(dependenciesUrl, packageTargetFramework) {
    return axios.get(dependenciesUrl)
        .then(res => {
            const packageData = res.data.dependencyGroups.find(element => element.targetFramework === packageTargetFramework);
            return packageData.dependencies || [];
        })
        .catch(err => {
            console.error(`Ошибка при получении зависисмостей: ${err.message}`);
        })
}

async function fetchDependencies(packageName, packageVersion, packageTargetFramework) {
    // Ссылка на зависисмости пакета
    const packageUrl = `https://api.nuget.org/v3/registration5-gz-semver2/${packageName.toLowerCase()}/${packageVersion}.json`

    return axios.get(packageUrl)
        .then(res => {
            // Получаем массив зависимостей
            const dependenciesUrl = res.data.catalogEntry;
            const dependencies = findDependencies(dependenciesUrl, packageTargetFramework);
            return dependencies;
        })
        .catch(err => {
            console.error(`Ошибка при получении пакета ${packageName}: ${err.message}`);
        })
}

async function getDependencies(packageName, packageVersion, packageTargetFramework, depth, curDepth, graph) {
    // Проверка на достижение максимальной глубины
    if (curDepth > depth) {
        return;
    }
    
    // Получение информации о версии
    packageVersion = await getPackageVersion(packageName, packageVersion);

    // Получение данных о зависисмостях пакета
    const packageDependencies = await fetchDependencies(packageName, packageVersion, packageTargetFramework);

    if (!packageDependencies) {
        return;
    }

    // Добавление нового узла
    if (!graph.nodes.includes(packageName)) {
        graph.nodes.push(packageName);
    }

    if (packageDependencies.length !== 0) {
        // Создаем массив зависимостей для конкретного пакета
        if (!graph.dependencies[packageName]) {
            graph.dependencies[packageName] = [];
        }

        // Получаем данные о версии
        for (const dependency of packageDependencies) {
            const name = dependency.id;
            const version = await getPackageVersion(dependency.id, dependency.range);
            graph.dependencies[packageName].push({
                name: name,
                version: version
            });

            // Рекурсивный вызов для зависимостей
            await getDependencies(name, version, packageTargetFramework, depth, curDepth + 1, graph);
        }
    }
}

const graph = {
    nodes: [],
    dependencies: {}
}
//const version = await getPackageVersion("serilog", "latest");
//const dependencies = await fetchDependencies("serilog", version, ".NETStandard2.0");
await getDependencies("serilog", "latest", ".NETStandard2.0", 10, 1, graph)
console.log(graph);
