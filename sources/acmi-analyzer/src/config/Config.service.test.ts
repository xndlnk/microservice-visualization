import { ConfigService } from './Config.service'

describe(ConfigService.name, () => {

  beforeEach(() => {
    process.env = {}
  })

  it('validate env variable with number', () => {
    process.env.PORT = '2'
    const config = new ConfigService()
    expect(config.getPort()).toEqual(2)
  })
})
