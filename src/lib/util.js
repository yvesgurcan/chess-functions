const fs = require('fs');
const path = require('path');

const getEnvironmentVariables = function (variableNames) {
    let values = {};
    try {
        const environmentVariables = JSON.parse(fs.readFileSync('env.json'));
        for (let i = 0; i < variableNames.length; i++) {
            const variableName = variableNames[i];
            values[variableName] = environmentVariables[variableName];
        }
    } catch (error) {
        console.log(error);
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
