var express = require('express');
var router = express.Router();
var moment = require('moment');

module.exports = function (pool) {

    /* GET home page. */
    router.get('/', (req, res) => {
        const url = req.url == '/' ? '/?page=1' : req.url


        let sql = 'SELECT COUNT (*) AS count FROM data'
        const params = []

        const sqlsearch = []

        if (req.query.id && req.query.checkboxid) {
            params.push(req.query.id)
            sqlsearch.push(`id = $${params.length}`)
        }

        if (req.query.string && req.query.checkboxstring) {
            params.push(`%${req.query.string}%`);
            sqlsearch.push(`string ILIKE $${params.length}`)
        }

        if (req.query.integer && req.query.checkboxinteger) {
            params.push(req.query.integer)
            sqlsearch.push(`integer = $${params.length}`)
        }

        if (req.query.float && req.query.checkboxfloat) {
            params.push(req.query.float)
            sqlsearch.push(`float = $${params.length}`)
        }

        if (req.query.startdate && req.query.enddate && req.query.checkboxdate) {
            params.push(req.query.startdate, req.query.enddate)
            sqlsearch.push(`date BETWEEN $${params.length - 1} AND $${params.length}`)
        }

        if (req.query.boolean && req.query.checkboxboolean) {
            params.push(req.query.boolean)
            sqlsearch.push(`boolean = $${params.length}`)
        }

        if (params.length > 0) {
            sql += ` WHERE ${sqlsearch.join(' AND ')}`
        }

        pool.query(sql, params, (err, data) => {
            // console.log(data)
            const page = req.query.page || 1
            const limit = 3
            const offset = (page - 1) * limit
            const pages = Math.ceil(data.rows[0].count / limit)

            sql = 'SELECT * FROM data'
            if (params.length > 0) {
                sql += ` WHERE ${sqlsearch.join(' AND ')}`
            }

            params.push(limit, offset)
            sql += ` LIMIT $${params.length - 1} OFFSET $${params.length}`


            pool.query(sql, params, (err, data) => {
                if (err) {
                    console.log(err)
                    return res.status(500).send('Internal Server Error')
                } else {
                    res.render('list', { data: data.rows, pages, page,moment, offset, query: req.query, url })
                }
            })
        })
    })


    // router.get('/add', (req, res) => {
    //     res.render('add', { item: 'add' })
    // })



    // router.post('/add', (req, res) => {
    //     const string = req.body.string
    //     const integer = req.body.integer
    //     const float = req.body.float
    //     const date = req.body.date
    //     const boolean = req.body.boolean
    //     const query = `INSERT INTO data (string, integer, float, date, boolean) VALUES ('${string}', ${integer}, ${float}, '${date}', ${boolean})`

    //     pool.query(query, (err) => {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             res.redirect('/')
    //         }
    //     })
    // })

    router.get('/add', (req, res) => {
        res.render('add', { item: {}, moment })
      })
    
      router.post('/add', (req, res) => {
        const { string, integer, float, date, boolean } = req.body
        const sqlAdd = `INSERT INTO data (string,integer,float,date,boolean) VALUES ($1,$2,$3,$4,$5)`
        const values = [string, integer, float, date, boolean]
    
        pool.query(sqlAdd, values, (err) => {
          if (err) {
            console.log(err)
          } else {
            res.redirect('/')
          }
        })    
      })


    // router.get('/hapus/:id', (req, res) => {
    //     const query = `DELETE FROM data WHERE id = ${id}`
    //     const id = req.params.id
    //     pool.query(query,(err) => {
    //         if (err) {
    //             console.error(err);
    //         } else {
    //             console.log('DELETE DATA SUCCESS')
    //             res.redirect('/')
    //         }
    //     })
    // })

    router.get('/hapus/:id', (req, res) => {
        const id = req.params.id
        const sqlDelete = 'DELETE FROM data WHERE id = $1'
        const values = [id]
        pool.query(sqlDelete, values, function (err) {
          if (err) {
            console.log(err)
          } else {
            res.redirect('/')
          }
        })
      })
    

    // router.get('/ubah/:id', (req, res) => {
    //     const query = `SELECT * FROM data WHERE id = ? ${id}`
    //     const id = req.params.id
       

    //     pool.query(query, (err, row) => {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             res.render('edit', { title: 'Edit', data: row.rows[0], moment })
    //         }
    //     })
    // })

    // router.get('/ubah/:id', (req, res) => {
    //     const id = req.params.id
    //     const sqlEdit = 'SELECT * FROM data WHERE id = $1'
    //     const values = [id]
    //     pool.query(sqlEdit, values, (err, item) => {
    //       if (err) {
    //         console.error(err)
    //       } else {
    //         res.render('edit', { item: item.rows[0], moment })
    //       }
    //     })
    //   })



    // router.post('/edit/:id', (req, res, next) => {
    //     const id = req.params.id
    //     const string = req.body.string
    //     const integer = req.body.integer
    //     const float = req.body.float
    //     const date = req.body.date
    //     const boolean = req.body.boolean
    //     let sql = `UPdate data SET string= '${string}', integer = ${integer}, float = ${float},date = '${date}', boolean = ${boolean} WHERE id = ${id}`
    //     pool.query(sql, (err) => {
    //       if (err) {
    //         console.error(err)
    //       } else {
    //         console.log('EDIT DATA SUCCESS')
    //         res.redirect('/')
    //       }
    //     })
    //   })


//   router.post('/ubah/:id', (req, res) => {
//     const id = req.params.id
//     const { string, integer, float, date, boolean } = req.body
//     const query = 'UPdate data SET string = $1, integer = $2, float = $3, date = $4, boolean = $5 WHERE id = $6 ';
//     const values = [string, integer, float, date, boolean, id];

//     pool.query(query, values, function (err) {
//       if (err) {
//         console.log(err);
//       } else {
//         res.redirect('/')
//       }
//     })
//   })

    return router;
}
