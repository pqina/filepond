const banner = require('./banner');
const pkg = require('./package.json');
const args = process.argv.slice(2);
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(data) {
    process.stdout.write(banner({ id: args[0], ...pkg }) + data);
});