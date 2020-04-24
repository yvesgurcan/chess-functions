[![Netlify Status](https://api.netlify.com/api/v1/badges/1fa07b72-318c-4d13-b9c4-df6c7f4289f2/deploy-status)](https://app.netlify.com/sites/chess-functions/deploys)

Lambda functions to handle chess games data.

CORS policy: Only requests from origin `https://chess.yvesgurcan.com` are allowed. If the lambdas are running from `localhost`, requests from all origins are allowed.

## Development

Install project dependencies:

    npm i

Run functions locally:

    npm start

## Game data

### New game

When a game is saved for the first time in the data store, the player who sent the game data first is considered the host and other players are automatically given the role of guest. This data is added by the function in the `players` object:

```json
    "players": [
        {
            "playerId": "ff5b8d2d-0452-4bb5-a805-649624ae4dc1",
            "host": true,
            "color": 0,
            "control": "Human"
        },
        {
            "playerId": "98b029e0-00aa-4ab0-8efd-6560f784ce5c",
            "color": 1,
            "control": "Human"
        }
    ]
```

### Load game

When clients connect to a game, they load the whole game from the data store. Afterwards, data provided by the websocket server is used to patch the game state locally.

### Save game

Once the logic to update the game state has been executed by the host of the game, the client sends the updated data to the save function.

### Object Identifier

After saving a game, the function returns the object identifier (`oid`) of the updated file to the client. The client sends this ID back to the function at the next update.

The `oid` is required by the GitHub API in order to update an existing file. It is not required to create a new file. If the client does not provide this identifier in a save request, the function has to send a separate request to the GitHub API to retrieve the `oid`. By providing this field in the request, the client saves a request to the GitHub API on every game update.
