import { readKeys } from "../visualizer.js";

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
                    const res = readKeys();
                    expect(res).toEqual(test.expected);
                }
            );
        });

        InvalidTestCases.forEach(test => {
            it (
                "Invalid arguments",
                () => {
                    process.argv = test.in;
                    expect(() => readKeys().toThrow(test.message));
                }
            )
        })
    }
)