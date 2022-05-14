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

1. Create `env/development.env` file. You can use `development.env.template` as an example
2. Run `docker-compose up -d`
3. Enter the `mssql` container: `docker-compose exec mssql bash`
4. Run `opt/mssql-tools/bin/sqlcmd -S localhost -U sa`. You will be prompted to enter the password, which is `Parola123!`
5. Run `CREATE LOGIN rpb_usr WITH PASSWORD = 'Parola123!'` and `GO`
6. Exit the `mssql` container and enter the `node` one: `docker-compose exec node bash`
7. Run `node sqls/db/create-sps.mjs sa Parola123!`

To run app:

1. Run `docker-compose up -d`
2. Enter the `node` container: `docker-compose exec node bash`
3. Run `npm run dev`
