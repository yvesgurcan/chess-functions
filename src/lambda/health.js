const packageInfo = require('../../package.json');

export async function handler() {
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
