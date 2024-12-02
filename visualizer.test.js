import {readKeys} from './visualizer.js';


describe(
    "Проверка функции readKeys",
    () => {
        let originalArgv;

        beforeAll(() => {originalArgv = process.argv;});

        afterAll(() => {process.argv = originalArgv;});

        const correctTestCases = [
            {
                in: [
                    "node",
                    "visualizer.js",
                    "../../Downloads/plantuml-1.2024.7.jar", 
                    "serilog", 
                    10
                ],
                expected: {
                    graphProgramPath: "../../Downloads/plantuml-1.2024.7.jar",
                    packageName: "serilog",
                    depth: 10,
                    version: "latest",
                    targetFramework: ".NETStandard2.0"
                }
            },
            {
                in: [
                    "node",
                    "visualizer.js",
                    "../../Downloads/plantuml-1.2024.7.jar", 
                    "serilog", 
                    10,
                    "latest",
                    ".NETStandard2.0"
                ],
                expected: {
                    graphProgramPath: "../../Downloads/plantuml-1.2024.7.jar",
                    packageName: "serilog",
                    depth: 10,
                    version: "latest",
                    targetFramework: ".NETStandard2.0"
                }
            }
        ];
        correctTestCases.forEach(test => {
            it(
                `Input: ${test.in}, expected ${test.expected}`,
                () => {
                    process.argv = test.in;
                    const res = readKeys();
                    expect(res).toEqual(test.expected);
                }
            );
        });

        test("To many arguments", () => {
            process.argv = [
                "node",
                "visualizer.js",
                "../../Downloads/plantuml-1.2024.7.jar", 
                "serilog", 
                10,
                "latest",
                ".NETStandard2.0",
                "one more arg"
            ];
            expect(() => readKeys()).toThrow("Введено слишком много аргументов");
        });

        test("Too few agruments", () => {
            process.argv = [
                "node",
                "visualizer.js",
                "../../Downloads/plantuml-1.2024.7.jar", 
                "serilog"
            ];
            expect(() => readKeys()).toThrow("Введено недостаточно аргументов");
        });

        test("Invalid depth value", () => {
            process.argv = [
                "node",
                "visualizer.js",
                "../../Downloads/plantuml-1.2024.7.jar", 
                "serilog",
                -1
            ];
            expect(() => readKeys()).toThrow("Некорректное значение максимальной глубины");
        });
    }
)