import {extname} from "path";
import { existsSync, read } from "fs";
import axios from "axios"

function readKeys() {
    const args = process.argv.slice(2);

    // Проверка на число введённых аргументов
    if (args.length > 4) {
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
        version: args[3] || "latest"
    };

    return keys;
}

async function getLatestVersionPackage(packageName) {
    // Ссылка на сам пакет
    const allPackageUrl = `https://api.nuget.org/v3/registration5-semver1/${packageName.toLowerCase()}/index.json`;

    // Запрос на получение версии
    return axios.get(allPackageUrl)
        .then(res => {
            // Поучаем данные о версии
            const data = res.data.items;
            const latestVersion = data[data.length - 1].upper;

            return latestVersion;
        })

        .catch(() => {
            console.error(`Ошибка при получении пакета ${packageName}`);
        })
}

async function fetchPackageData(packageName, packageVersion) {
    const packageUrl = `https://api.nuget.org/v3/catalog0/data/2023.03.08.07.46.17/${packageName}.${packageVersion}.json`
    console.log(packageUrl)
    return axios.get(packageUrl)
        .then(res => {
            const dependencies = res.data.dependencyGroups  || [];
            return dependencies;
        })
        .catch(() => {
            console.error(`Ошибка при получении пакета ${packageName}`);
        })
}

const url = await getLatestVersionPackage("newtonsoft.json");
const dependencies = await fetchPackageData("newtonsoft.json", url);
console.log(dependencies);
