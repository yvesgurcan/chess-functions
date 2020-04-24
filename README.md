[![Netlify Status](https://api.netlify.com/api/v1/badges/1fa07b72-318c-4d13-b9c4-df6c7f4289f2/deploy-status)](https://app.netlify.com/sites/chess-functions/deploys)

Lambda functions to handle chess games data.

## Development

Create a `.env` file using this template:

```
GITHUB_TOKEN=XXX
GITHUB_REPOSITORY_NAME=chess-storage
GITHUB_REPOSITORY_OWNER=yvesgurcan
ALLOWED_ORIGIN=*
```

CORS policy: To restrict access to the functions in production, make sure to update the allowed origin.

Install project dependencies:

    npm i

Run functions locally:

    npm start

## Game data

### Load game

When clients connect to a game, they load the whole game from the data store. Afterwards, data provided by the websocket server is used to patch the game state locally as they play.

### Save game

Once the logic to update the game state has been executed by the host of the game, the client sends the updated data to the save function.

### Object Identifier

After saving a game, the function returns the object identifier (`oid`) of the updated file to the client. The client sends this ID back to the function at the next update.

The `oid` is required by the GitHub API in order to update an existing file. It is not required to create a new file. If the client does not provide this identifier in a save request, the function has to send a separate request to the GitHub API to retrieve the `oid`. By providing this field in the request, the client saves a request to the GitHub API on every game update.
