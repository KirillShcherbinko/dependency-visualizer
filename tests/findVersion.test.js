import { findVersion } from "../visualizer.js";

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
                    const res = findVersion(versions, test.packageVersion);
                    expect(res).toBe(test.expected);
                }
            )
        })

        invalidTestCases.forEach(test => {
            it (
                "Invalid version ranges",
                () => {
                    expect(() => findVersion(versions, test.packageVersion)).toThrow(invalidCaseMessage);
                }
            )
        })
    }
)