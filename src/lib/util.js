const getEnvironmentVariables = function (variableNames) {
    let values = {};
    try {
        const pathToEnvFile = require.resolve('../../env');
        if (pathToEnvFile) {
            environmentVariables = fs.readFileSync(pathToEnvFile);
        }
        for (let i = 0; i < variableNames.length; i++) {
            const variableName = variableNames[i];
            values[variableName] = environmentVariables[variableName];
        }
    } catch (error) {
        for (let i = 0; i < variableNames.length; i++) {
            const variableName = variableNames[i];
            values[variableName] = process.env[variableName];
        }
    }

    for (let i = 0; i < variableNames.length; i++) {
        const variableName = variableNames[i];
        if (values[variableName] === undefined) {
            console.error(
                `Environment variable '${variableName}' not defined.`
            );
        }
    }

    return values;
};

module.exports = {
    getEnvironmentVariables
};
