const { get } = require('lodash/fp')

module.exports = {
  db: {
    host: get('RDS_HOSTNAME')(process.env),
    port: get('RDS_PORT')(process.env),
    name: get('RDS_DB_NAME')(process.env),
    user: get('RDS_USERNAME')(process.env),
    pass: get('RDS_PASSWORD')(process.env),
  }
}
