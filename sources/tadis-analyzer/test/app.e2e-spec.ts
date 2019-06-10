import * as request from 'supertest'
import { Test } from '@nestjs/testing'
import { MsaModule } from './../src/msa/Msa.module'
import { INestApplication } from '@nestjs/common'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeAll(async() => {
    const moduleFixture = await Test.createTestingModule({
      imports: [MsaModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!')
  })
})
