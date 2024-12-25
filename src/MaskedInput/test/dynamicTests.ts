export default function dynamicTests(arrayOfTests, generateTestDefinition) {
  arrayOfTests = arrayOfTests || [];
  generateTestDefinition =
    generateTestDefinition ||
    function () {
      // noop
    };

  arrayOfTests.forEach(function (test) {
    test = test || {};

    const testDefinition = generateTestDefinition(test) || {};

    it(testDefinition.description, testDefinition.body);
  });
}
