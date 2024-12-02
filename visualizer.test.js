import * as functions from './visualizer.js';

// Тесты для функции readKeys
describe(
    "Checking readKeys",
    () => {
        let originalArgv;
        beforeAll(() => {originalArgv = process.argv;});
        afterAll(() => {process.argv = originalArgv;});

        const expectedKeys = {
            graphProgramPath: "../../Downloads/plantuml-1.2024.7.jar",
            packageName: "serilog",
            depth: 10,
            version: "latest",
            targetFramework: ".NETStandard2.0"
        }

        const validTestCases = [
            {
                in: ["node", "visualizer.js", "../../Downloads/plantuml-1.2024.7.jar", "serilog", 10],
                expected: expectedKeys
            },
            {
                in: ["node", "visualizer.js", "../../Downloads/plantuml-1.2024.7.jar", "serilog", 10, "latest",".NETStandard2.0"],
                expected: expectedKeys
            }
        ];

        const InvalidTestCases = [
            {
                in: [
                    "node", "visualizer.js", "../../Downloads/plantuml-1.2024.7.jar","serilog",
                     10, "latest", ".NETStandard2.0", "one more arg"
                ],
                message: "Введено слишком много аргументов"
            },
            {
                in: ["node", "visualizer.js", "../../Downloads/plantuml-1.2024.7.jar", "serilog"],
                message: "Введено недостаточно аргументов"
            },
            {
                in: ["node", "visualizer.js", "../../Downloads/plantuml-1.2024.7.jar", "serilog", -1],
                message: "Некорректное значение максимальной глубины"
            }
        ];
        validTestCases.forEach(test => {
            it (
                "Valid number of arguments",
                () => {
                    process.argv = test.in;
                    const res = functions.readKeys();
                    expect(res).toEqual(test.expected);
                }
            );
        });

        InvalidTestCases.forEach(test => {
            it (
                "Invalid arguments",
                () => {
                    process.argv = test.in;
                    expect(() => functions.readKeys().toThrow(test.message));
                }
            )
        })
    }
)

// Тесты для функции findVersion
describe (
    "Checking findVersion",
    () => {
        const versions = ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "2.0.0", "3.0.0", "3.0.1","3.1.0"];
        const invalidCaseMessage = "Не удалось найти версию";

        const validTestCases = [
            {
                packageVersion: "latest",
                expected: "3.1.0"
            },
            {
                packageVersion: "1.1.0",
                expected: "1.1.0"
            },
            {
                packageVersion: "[2.0.0, )",
                expected: "3.1.0"
            },
            {
                packageVersion: "(, 2.0.0]",
                expected: "2.0.0"
            },
            {
                packageVersion: "(, 2.0.0)",
                expected: "1.1.2"
            },
            {
                packageVersion: "(1.0.0, 1.1.1]",
                expected: "1.1.1"
            },
            {
                packageVersion: "[1.0.0, 1.1.0)",
                expected: "1.0.0"
            },
            {
                packageVersion: "[1.0.0, 1.1.0]",
                expected: "1.1.0"
            }
        ];

        const invalidTestCases = [
            {
                packageVersion: "4.0.0"
            },
            {
                packageVersion: "asa"
            },
            {
                packageVersion: "(0.0.1, 0.0.9]"
            },
            {
                packageVersion: "(1.1.0, 1.0.0]"
            }
        ];

        validTestCases.forEach(test => {
            it (
                "Valid version ranges",
                () => {
                    const res = functions.findVersion(versions, test.packageVersion);
                    expect(res).toBe(test.expected);
                }
            )
        })

        invalidTestCases.forEach(test => {
            it (
                "Invalid version ranges",
                () => {
                    expect(() => functions.findVersion(versions, test.packageVersion)).toThrow(invalidCaseMessage);
                }
            )
        })
    }
)

// Тесты для функции getPackageVersion
describe(
    "Checking getPackageVersion",

    () => {
        const packageName = "serilog";
        const validPackageVersion = "2.9.0";
        const invalidPackageVersion = "5.0.0";
        const invalidCaseMessage = "Ошибка при получении версии пакета serilog: Не удалось найти версию";

        test ("Valid package version", async () => {
            const res = await functions.getPackageVersion(packageName, validPackageVersion);
            expect(res).toBe(validPackageVersion);
        })

        test ("Invalid package version", async () => {
            await expect(() => functions.getPackageVersion(packageName, invalidPackageVersion)).rejects.toThrow(invalidCaseMessage);
        })
    }
)