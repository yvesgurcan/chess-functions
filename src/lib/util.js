require('dotenv').config();

const getEnvironmentVariables = function (variableNames) {
    let values = {};
    for (let i = 0; i < variableNames.length; i++) {
        const variableName = variableNames[i];
        values[variableName] = process.env[variableName];
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
