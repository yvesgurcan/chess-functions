const axios = require('axios');
const Base64 = require('js-base64').Base64;
const { getEnvironmentVariables } = require('../lib/util');
const {
    GITHUB_TOKEN,
    GITHUB_REPOSITORY_NAME,
    GITHUB_REPOSITORY_OWNER
} = getEnvironmentVariables([
    'GITHUB_TOKEN',
    'GITHUB_REPOSITORY_NAME',
    'GITHUB_REPOSITORY_OWNER'
]);
const {
    GITHUB_GRAPHQL_API,
    GITHUB_REST_API,
    DEFAULT_HEADERS
} = require('../lib/constants');

function preflight() {
    return {
        statusCode: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST'
        }
    };
}

async function loadGame(event) {
    try {
        const parameters = event.queryStringParameters;

        if (!parameters.fileId) {
            return {
                statusCode: 400,
                body: 'fileId is required',
                headers: DEFAULT_HEADERS
            };
        }

        const expression = `master:games/${parameters.fileId}.json`;
        const url = GITHUB_GRAPHQL_API;

        if (
            !GITHUB_TOKEN ||
            !GITHUB_REPOSITORY_NAME ||
            !GITHUB_REPOSITORY_OWNER
        ) {
            return {
                statusCode: 500,
                headers: DEFAULT_HEADERS
            };
        }

        const response = await axios({
            url,
            method: 'post',
            headers: { Authorization: `bearer ${GITHUB_TOKEN}` },
            data: {
                query: `{
                    repository(name: "${GITHUB_REPOSITORY_NAME}", owner: "${GITHUB_REPOSITORY_OWNER}") {
                        object(expression: "${expression}") {
                            ... on Blob {
                                text
                                oid
                            }
                        }
                    }
                }`
            }
        });

        if (response.data.data) {
            if (
                response.data.data.repository &&
                response.data.data.repository.object
            ) {
                return {
                    statusCode: 200,
                    body: JSON.stringify(response.data.data.repository.object),
                    headers: DEFAULT_HEADERS
                };
            }
        }

        return {
            statusCode: 404,
            headers: DEFAULT_HEADERS
        };
    } catch (error) {
        console.error({ error });
        return {
            statusCode: 500,
            headers: DEFAULT_HEADERS
        };
    }
}

async function saveGame(event) {
    try {
        const parameters = event.queryStringParameters;

        if (!parameters.fileId) {
            return {
                statusCode: 400,
                body: 'fileId is required',
                headers: DEFAULT_HEADERS
            };
        }

        if (!parameters.content) {
            return {
                statusCode: 400,
                body: 'content is required',
                headers: DEFAULT_HEADERS
            };
        }

        const encodedContent = Base64.encode(parameters.content);

        let oid = null;

        if (parameters.oid) {
            oid = parameters.oid;
        } else {
            const checkIfFileExists = await loadGame({
                queryStringParameters: {
                    fileId: parameters.fileId
                }
            });

            if (checkIfFileExists.statusCode === 200) {
                const bodyCheckIfFileExists = JSON.parse(
                    checkIfFileExists.body
                );
                oid = bodyCheckIfFileExists.oid;
            }
        }

        if (
            !GITHUB_TOKEN ||
            !GITHUB_REPOSITORY_NAME ||
            !GITHUB_REPOSITORY_OWNER
        ) {
            return {
                statusCode: 500,
                headers: DEFAULT_HEADERS
            };
        }

        const url = `${GITHUB_REST_API}/repos/${GITHUB_REPOSITORY_OWNER}/${GITHUB_REPOSITORY_NAME}/contents/games/${parameters.fileId}.json`;

        const response = await axios({
            url,
            method: 'put',
            headers: { Authorization: `bearer ${GITHUB_TOKEN}` },
            data: {
                message: `Update games/${parameters.fileId}.json`,
                content: encodedContent,
                ...(oid && { sha: oid })
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                oid: response.data.content.sha
            }),
            headers: DEFAULT_HEADERS
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: error.message,
            headers: DEFAULT_HEADERS
        };
    }
}

export async function handler(event) {
    switch (event.httpMethod) {
        default: {
            return {
                statusCode: 405,
                headers: DEFAULT_HEADERS
            };
        }
        case 'OPTIONS': {
            return preflight();
        }
        case 'GET': {
            return loadGame(event);
        }
        case 'POST': {
            return saveGame(event);
        }
    }
}
