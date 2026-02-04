const fs = require('fs');
const path = require('path');

const envProdPath = path.resolve(__dirname, 'src/environments/environment.prod.ts');

const envConfigFile = `export const environment = {
    production: true,
    apiUrl: '${process.env.APP_API_URL || "/api"}',
    hubUrl: '${process.env.APP_HUB_URL || "/hubs/dashboard"}',
    logging: {
        enabled: false,
        level: 'error' as 'debug' | 'info' | 'warn' | 'error'
    }
};
`;

console.log('Generating environment.prod.ts...');
fs.writeFileSync(envProdPath, envConfigFile);
console.log(`Environment file generated at ${envProdPath}`);
