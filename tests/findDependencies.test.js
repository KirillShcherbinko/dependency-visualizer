import { findDependencies } from '../visualizer.js';

describe(
    "Checking findDependencies",

    () => {
        const targetFramework = ".NETStandard2.0"
        const validDependenciesUrl = "https://api.nuget.org/v3/catalog0/data/2024.12.06.04.15.39/serilog.4.2.0.json";
        const invalidDependenciesUrl = "https://api.nuget.org/v3/catalog0/data/2024.12.06.04.15.39/serilog.4.2.1.json";
        const invalidCaseMessage = "Ошибка при получении зависисмостей: Request failed with status code 404";
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

        test ("Valid dependencies url", async () => {
            const res = await findDependencies(validDependenciesUrl, targetFramework);
            expect(res).toEqual(expectedResults);
        })

        test ("Invalid dependencies url", async () => {
            await expect(() => findDependencies(invalidDependenciesUrl, targetFramework)).rejects.toThrow(invalidCaseMessage);
        })
    }
)