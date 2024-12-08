import { fetchDependencies } from '../visualizer.js';

describe(
    "Checking findDependencies",

    () => {
        const packageName = "serilog";
        const targetFramework = ".NETStandard2.0";

        const validPackageVersion = "4.2.0";
        const invalidPackageVersion = "4.2.1";

        const invalidCaseMessage = "Ошибка при получении пакета serilog: Request failed with status code 404";
        
        const expectedResults = [
          {
            '@id': 'https://api.nuget.org/v3/catalog0/data/2024.12.06.04.15.39/serilog.4.2.0.json#dependencygroup/.netstandard2.0/system.diagnostics.diagnosticsource',    
            '@type': 'PackageDependency',
            id: 'System.Diagnostics.DiagnosticSource',
            range: '[8.0.1, )'
          },
          {
            '@id': 'https://api.nuget.org/v3/catalog0/data/2024.12.06.04.15.39/serilog.4.2.0.json#dependencygroup/.netstandard2.0/system.threading.channels',
            '@type': 'PackageDependency',
            id: 'System.Threading.Channels',
            range: '[8.0.0, )'
          }
        ]

        test ("Valid package url", async () => {
            const res = await fetchDependencies(packageName, validPackageVersion, targetFramework);
            expect(res).toEqual(expectedResults);
        });

        test ("Invalid package url", async () => {
            await expect(() => fetchDependencies(packageName, invalidPackageVersion, targetFramework)).rejects.toThrow(invalidCaseMessage);
        });
    }
)