import { savePlantUmlCode } from "../visualizer.js";

describe(
    "Checking savePlantUmlCode",

    () => {
        const code = "@startuml\n[serilog 4.2.0] --> [System.Diagnostics.DiagnosticSource 9.0.0]\n[serilog 4.2.0] --> [System.Threading.Channels 9.0.0]\n@enduml";
        const folderPath = "./packages/serilog";
        const fileName = "serilog.puml";

        const expectedResult = "packages\\serilog\\serilog.puml";

        test ("Save code", () => {
            const res = savePlantUmlCode(code, folderPath, fileName);
            expect(res).toBe(expectedResult);
        });
    }
)