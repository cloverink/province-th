const chai = require('chai')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const sinonChai = require('sinon-chai')
const expect = chai.expect

const { query } = require('./db')

chai.use(sinonChai)

describe('services', () => {
  describe('postgres', () => {
    before(() => {
      global.app = {}
    })

    beforeEach(() => {
      global.app.pool = undefined
    })

    after(() => {
      global.app = {}
    })

    describe('.connect', () => {
      it('set pool connecting database to app', async() => {
        const fakeDB = proxyquire('./db', {
          'pg': ({
            'Pool': function() {
              return {
                on: sinon.stub(),
                x: 'connected'
              }
            }
          })
        })

        await fakeDB.connect({
          host: 'host.com',
          port: '9999',
          name: 'dbname',
          user: 'username',
          password: 'password'
        })

        expect(typeof global.app.pool).to.be.equal('object')
        expect(global.app.pool.x).to.eq('connected')

      })

      it('throws exception when cannot open database pool', async() => {
        const fakeDB = proxyquire('./db', {
          'pg': ({
            'Pool': function() { throw new Error('somethaing went wrong') }
          })
        })

        let error = undefined
        try {
          await fakeDB.connect({
            host: 'host.com',
            port: '9999',
            name: 'dbname',
            user: 'username',
            password: 'password'
          })
        } catch (e) {
          error = e
        }
        expect(error.message).to.be.eq('somethaing went wrong')
      })

    })

    describe('.query', () => {

      let fakeApp

      beforeEach(async() => {
        fakeApp = app
      })

      afterEach(async() => {
        app = fakeApp
      })

      it('returns rows result', async() => {
        global.app.pool = {
          query: sinon.stub().returns({
            rows: [{ data: 'bla' }],
            rowCount: 0
          })
        }
        const sql = 'select * from what'
        const props = ['bla']
        const result = await query(sql, props)
        expect(global.app.pool.query).to.have.be.calledWith('select * from what', ['bla'])
        expect(result).to.be.deep.eq([{ data: 'bla' }])
      })

      it('returns default result is empty array', async() => {
        global.app.pool = {
          query: sinon.stub().returns({ rows: undefined })
        }
        const result = await query({})
        expect(result).to.be.deep.eq([])
      })

      it('throws exception when have somthing went wrong', async() => {
        const errorStub = new Error('bla')
        global.app.pool = {
          query: sinon.stub().throws(errorStub),
        }

        let error = undefined
        try {
          await query({})
        } catch (e) {
          error = e
        }
        expect(error).to.be.eq(errorStub)
      })
    })
  })

})
