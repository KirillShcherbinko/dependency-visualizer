import {extname} from "path";
import { existsSync, read } from "fs";
import axios from "axios"

async function readKeys() {
    const args = process.argv.slice(2);

    // Проверка на число введённых аргументов
    if (args.length > 3) {
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
        depth: args[2]
    };

    return keys;
}

async function fetchPackageData(packageName) {
    try {
        // Получаем последнюю версию пакета
        const versionUrl = `https://api.nuget.org/v3-flatcontainer/${packageName}/index.json`;
        const versionResponce = await axios.get(versionUrl);

        const versions = versionResponce.data.versions;
        

        if (versions.length === 0) {
            throw new Error(`Нет доступных версий для пакета ${packageName}`)
        }

        const version = versions[versions.length - 1];

        // Получаем сам пакет
        const packageUrl = `https://api.nuget.org/v3-flatcontainer/${packageName}/${version}/${packageName}.${version}.nupkg`;
        const packageResponce = await axios.get(packageUrl, {responceType: "arraybuffer"});

        console.log(packageResponce.data, 234)

        return packageResponce.data;

    } catch(err) {
        console.error(`"Ошибка при получении пакета ${packageName}: "${err.message}`);
    }
}

console.log(fetchPackageData("newtonsoft.json"));
