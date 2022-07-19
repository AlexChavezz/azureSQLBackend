const { Router, request } = require('express');
const { Connection, Request } = require('tedious');
const router = Router();

router.post('/', getConnection);
router.post('/gettable', getTable);

function getTable(req, res) {
    const {currentConfig, table:tableToGet} = req.body;

    const config = getConfig(currentConfig);
    // console.log(config)
    const connection = new Connection(config);
    let tables = [];
    connection.on('connect', (error) => {
        if (error) {
            console.log(`Error: , ${error}`);
            res.json({ Error: "Something went wrong" });
        }

        const request = new Request(`SELECT * FROM ${tableToGet};`, (error, rowCount) => {
            if (error) {
                console.log(`Error: , ${error}`);
                res.json({ Error: "Something went wrong" });
            }
        });
        let table = {};
        request.on("row", (columns) => {
            columns.forEach(column => {
                table[column.metadata.colName] = column.value;
            })
            tables = [...tables, table];
            table = {};
        })
        request.on("requestCompleted", () => {
            res.json(tables);
            connection.close();
        })
        connection.execSql(request);
    })
    connection.connect();
}

function getConnection(req, res) {
    const values = req.body;
    const config = getConfig(values);
    console.log(config)
    const connection = new Connection(config);
    let tables = [];
    connection.on('connect', (error) => {
        if (error) {
            console.log(`Error: , ${error}`);
            res.json({ Error: "Something went wrong" });
        }

        const request = new Request(`select schema_name(t.schema_id) as schema_name,
        t.name as table_name,
        t.create_date,
        t.modify_date
 from sys.tables t
 order by schema_name,
          table_name;`, (error, rowCount) => {
            if (error) {
                console.log(`Error: , ${error}`);
                res.json({ Error: "Something went wrong" });
            }
        });
        let table = {};
        request.on("row", (columns) => {
            columns.forEach(column => {
                table[column.metadata.colName] = column.value;
            })
            tables = [...tables, table];
            table = {};
        })
        request.on("requestCompleted", () => {
            res.json(tables);
            connection.close();
        })
        connection.execSql(request);
    })
    connection.connect();
}

const getConfig = ({ user, server: sv, password: ps, database: db }) => ({
    authentication: {
        options: {
            userName: user,
            password: ps
        },
        type: 'default',
    },
    server: sv,
    options: {
        database: db,
        encrypt: true
    }
})


module.exports = router;