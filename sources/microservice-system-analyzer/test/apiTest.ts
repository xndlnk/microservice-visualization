import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as api from '~/api'

/* tslint:disable:no-unused-expression */
describe('api', function() {

  it('is accessible', function() {
    const v0system = new api.model.System()
    v0system.name = 'S'
    v0system.addService('B')

    const v1system = new api.System('S', [ new api.Microservice('A') ])

    const mergedSystem = new api.V1SystemMerger().mergeWithoutSubSystems([ v0system ], [ v1system ])

    expect(mergedSystem).to.be.not.null
  })

  it('can convert models', function() {
    const v1system = new api.System('S', [ new api.Microservice('A') ])
    const modelConverter = new api.presentation.ModelConverter()

    const convertedSystem = modelConverter.convertNode(v1system)

    expect(convertedSystem).to.be.not.null
  })
})
