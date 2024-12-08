import { generatePlantUmlCode } from "../visualizer.js";

describe(
    "Checking generatePlantUmlCode",

    () => {     
        const graph = {
            'serilog 4.2.0': [
              'System.Diagnostics.DiagnosticSource 9.0.0',
              'System.Threading.Channels 9.0.0'
            ]
        }

        const expectedResult = "@startuml\n[serilog 4.2.0] --> [System.Diagnostics.DiagnosticSource 9.0.0]\n[serilog 4.2.0] --> [System.Threading.Channels 9.0.0]\n@enduml";

        test ("Create code", () => {
            const res = generatePlantUmlCode(graph);
            expect(res).toBe(expectedResult);
        });
    }
)