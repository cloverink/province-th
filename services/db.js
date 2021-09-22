const { Pool } = require('pg')
const { log, error } = console

const connect = async({
  host,
  port,
  name,
  user,
  pass,
  serviceName = 'INTAGE',
  max = 20,
  idleTimeoutMillis = 1000,
  connectionTimeoutMillis = 5 * 60 * 1000
}) => {
  try {

    log(`Database pool connecting to ${host}:${port}:${name}`)

    const pool = new Pool({
      application_name: serviceName,
      host: host,
      port: port,
      database: name,
      user: user,
      password: pass,
      max,
      idleTimeoutMillis,
      connectionTimeoutMillis
    })

    pool.on('connect', async() => {
      log('Database connecting ...')
    })

    pool.on('remove', async() => {
      log('Database disconnected')
    })

    pool.on('error', err => {
      error('Database error')
      error(err)
    })

    global.pool = pool

  } catch (e) {
    throw e
  }
}

const begin = async(flag = false) => {
  if (flag)
    await global.pool.query('BEGIN')
}
const commit = async(flag = false) => {
  if (flag)
    await global.pool.query('COMMIT')
}
const rollback = async(flag = false) => {
  if (flag)
    await global.pool.query('ROLLBACK')
}

const query = async(query, props = [], transaction = false) => {
  try {
    await begin(transaction)
    const result = await global.pool.query(query, props)
    await commit(transaction)
    return result.rows || []
  } catch (e) {
    await rollback(transaction)
    throw e
  }
}

module.exports = {
  connect,
  query,
  begin,
  commit,
  rollback
}
