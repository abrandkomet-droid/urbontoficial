import http from 'http';

http.get('http://localhost:3000/api/integrations/freepik/icon?term=user', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
  });
}).on('error', (e) => {
  console.error(e);
});
