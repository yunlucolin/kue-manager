module.exports = {
    "extends": "standard",
    // http://eslint.org/docs/rules
    rules: {
        // semicolon(;) in the end of centence
        semi: [1, 'always'],
        indent: [2, 4, {
            MemberExpression: 0
        }]
    }
};