const Snoowrap = require('snoowrap');
const readline = require('readline');

const r = new readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('--- Reddit Refresh Token Generator ---');
console.log('1. Go to https://www.reddit.com/prefs/apps');
console.log('2. Create a "script" app.');
console.log('3. Set redirect uri to: http://localhost:3000');
console.log('--------------------------------------');

r.question('Enter Client ID: ', (clientId) => {
  r.question('Enter Client Secret: ', (clientSecret) => {
    
    const authenticationUrl = Snoowrap.getAuthUrl({
      clientId: clientId.trim(),
      scope: ['read', 'history', 'identity'],
      redirectUri: 'http://localhost:3000',
      permanent: true,
      state: 'fe211bebc52eb3da9bef8db6e63104d3' // Random string
    });

    console.log('\n--- ACTION REQUIRED ---');
    console.log('Click this link to authorize the app:');
    console.log(authenticationUrl);
    console.log('-----------------------');
    console.log('After authorizing, you will be redirected to localhost (which might fail to load).');
    console.log('Copy the "code" parameter from the URL in your browser address bar.');
    console.log('Example: http://localhost:3000/?state=...&code=YOUR_CODE_IS_HERE#_');
    
    r.question('\nPaste the code here: ', async (code) => {
        try {
            const token = await Snoowrap.fromAuthCode({
                code: code.trim(),
                userAgent: 'IntentMap-Token-Gen',
                clientId: clientId.trim(),
                clientSecret: clientSecret.trim(),
                redirectUri: 'http://localhost:3000'
            });
            
            console.log('\n--- SUCCESS! ---');
            console.log('Add this to your .env file:');
            console.log(`REDDIT_REFRESH_TOKEN=${token.refreshToken}`);
            console.log(`REDDIT_CLIENT_ID=${clientId.trim()}`);
            console.log(`REDDIT_CLIENT_SECRET=${clientSecret.trim()}`);
        } catch (e) {
            console.error('Error generating token:', e.message);
        }
        r.close();
    });
  });
});
