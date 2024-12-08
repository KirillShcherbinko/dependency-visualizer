import { getPackageVersion } from '../visualizer.js';

describe(
    "Checking getPackageVersion",

    () => {
        const packageName = "serilog";
        const validPackageVersion = "2.9.0";
        const invalidPackageVersion = "5.0.0";
        const invalidCaseMessage = "Ошибка при получении версии пакета serilog: Не удалось найти версию";

        test ("Valid package version", async () => {
            const res = await getPackageVersion(packageName, validPackageVersion);
            expect(res).toBe(validPackageVersion);
        })

        test ("Invalid package version", async () => {
            await expect(() => getPackageVersion(packageName, invalidPackageVersion)).rejects.toThrow(invalidCaseMessage);
        })
    }
)