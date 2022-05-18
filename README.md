# ani-research-backend
## Backend APIs and Database scripts


### Run locally

To run locally you will need to have an **env** folder in the project root containing **development.env** file

Then you need to install the dependencies. In the project root run
```
npm i
```

Then to start the project
```
npm run dev
```

#### With Docker

To setup:

1. Create and populate `env/development.env` file. You can use `development.env.template` as an example
2. Run `docker-compose up -d`
3. Enter the `node` container: `docker-compose exec node bash`
4. Run `node sqls/db/create-sps.mjs sa Parola123!`

To run app:

1. Run `docker-compose up -d`
2. Enter the `node` container: `docker-compose exec node bash`
3. Run `npm run dev`
