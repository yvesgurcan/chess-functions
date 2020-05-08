const axios = require('axios');
const Base64 = require('js-base64').Base64;
const { getEnvironmentVariables } = require('../lib/util');
const {
    GITHUB_TOKEN,
    GITHUB_REPOSITORY_NAME,
    GITHUB_REPOSITORY_OWNER,
    ALLOWED_ORIGIN
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
            'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
            'Access-Control-Allow-Methods': 'GET, POST'
        }
    };
}

async function loadUser(event) {
    try {
        const parameters = event.queryStringParameters;

        if (!parameters.userId) {
            return {
                statusCode: 400,
                body: 'userId is required',
                headers: DEFAULT_HEADERS
            };
        }

        const expression = `master:users/${parameters.userId}.json`;
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

async function saveUser(event) {
    const parameters = event.queryStringParameters;

    if (!parameters.userId) {
        return {
            statusCode: 400,
            body: 'userId is required',
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
        const checkIfUserExists = await loadUser({
            queryStringParameters: { userId: parameters.userId }
        });

        if (checkIfUserExists.statusCode === 200) {
            const bodyCheckIfUserExists = JSON.parse(checkIfUserExists.body);
            oid = bodyCheckIfUserExists.oid;
        }
    }

    if (!GITHUB_TOKEN || !GITHUB_REPOSITORY_NAME || !GITHUB_REPOSITORY_OWNER) {
        return {
            statusCode: 500,
            headers: DEFAULT_HEADERS
        };
    }

    const url = `${GITHUB_REST_API}/repos/${GITHUB_REPOSITORY_OWNER}/${GITHUB_REPOSITORY_NAME}/contents/users/${parameters.userId}.json`;

    const response = await axios({
        url,
        method: 'put',
        headers: { Authorization: `bearer ${GITHUB_TOKEN}` },
        data: {
            message: `Update users/${parameters.userId}.json`,
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
            return loadUser(event);
        }
        case 'POST': {
            return saveUser(event);
        }
    }
}
