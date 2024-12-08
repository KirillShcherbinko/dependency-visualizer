import { generatePlantUmlGraph } from "../visualizer.js";

describe(
    "Checking generatePlantUmlGraph",

    () => {
        const validPlantUmlPath = "../../Downloads/plantuml-1.2024.7.jar";
        const invalidPlantUmlPath = "../../Downloads/plantuml-1.2024.7";
        const filePath = "./packages/serilog/serilog.puml";

        const validCaseMessage = "Изображение графа успешно сохранено";
        const invalidCaseMessage = "Ошибка выполнения команды: Command failed: java -jar ../../Downloads/plantuml-1.2024.7 -tsvg ./packages/serilog/serilog.puml";

        test ("Valid graph generation", () => {
            const res = generatePlantUmlGraph(validPlantUmlPath, filePath);
            expect(res).toBe(validCaseMessage);
        });

        test ("Invalid graph generation", () => {
            expect(() => generatePlantUmlGraph(invalidPlantUmlPath, filePath)).toThrow(invalidCaseMessage);
        })
    }
)