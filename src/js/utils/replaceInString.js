/**
 * Replaces placeholders in given string with replacements
 * @param string - "Foo {bar}""
 * @param replacements - { "bar": 10 }
 */
export const replaceInString = (string, replacements) =>
    string.replace(/(?:{([a-zA-Z]+)})/g, (match, group) => replacements[group]);
