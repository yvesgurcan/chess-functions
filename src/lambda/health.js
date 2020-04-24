const axios = require('axios');
const packageInfo = require('../../package.json');

export async function handler(event) {
    const { name, version, description } = packageInfo;
    return {
        statusCode: 200,
        body: JSON.stringify({
            name,
            version,
            description,
            buildCommit: process.env.COMMIT_REF
        })
    };
}
