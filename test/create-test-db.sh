sqlcmd -S localhost -U sa -P Pass123! -i sqls/db/create-test-db.sql
node sqls/db/create-sps.mjs sa Pass123!
