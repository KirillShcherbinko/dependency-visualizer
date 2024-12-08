import { getDependencies } from "../visualizer.js";

describe(
    "Checking getDependencies",

    () => {
        const packageName = "serilog";
        const packageVersion = "latest";
        const targetFramework = ".NETStandard2.0";
        const depth = 1;
        const curDepth = 1;
        const graph = {};
        
        const expectedResults = {
            'serilog 4.2.0': [
              'System.Diagnostics.DiagnosticSource 9.0.0',
              'System.Threading.Channels 9.0.0'
            ]
          }

        test ("Valid dependencies", async () => {
            await getDependencies(packageName, packageVersion, targetFramework, depth, curDepth, graph);
            expect(graph).toEqual(expectedResults);
        });
    }
)