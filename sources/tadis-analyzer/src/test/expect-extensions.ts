declare namespace jest {
  interface Matchers<R> {
    toContainObject(object: any): CustomMatcherResult
    toContainObjectWithContent(content: any): CustomMatcherResult
  }
}

expect.extend({
  toContainObject(actualObject: any, expectedObject: any) {

    const pass = this.equals(actualObject,
      expect.arrayContaining([
        expect.objectContaining(expectedObject)
      ])
    )

    if (pass) {
      return {
        message: () => (`expected ${this.utils.printReceived(actualObject)} not to contain object ${this.utils.printExpected(expectedObject)}`),
        pass: true
      }
    } else {
      return {
        message: () => (`expected ${this.utils.printReceived(actualObject)} to contain object ${this.utils.printExpected(expectedObject)}`),
        pass: false
      }
    }
  }
})
