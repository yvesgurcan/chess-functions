const { getEnvironmentVariables } = require('../lib/util');
const { ALLOWED_ORIGIN } = getEnvironmentVariables(['ALLOWED_ORIGIN']);

module.exports = {
    GITHUB_GRAPHQL_API: 'https://api.github.com/graphql',
    GITHUB_REST_API: 'https://api.github.com',
    DEFAULT_HEADERS: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Headers': '*'
    }
};
