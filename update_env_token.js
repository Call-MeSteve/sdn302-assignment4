const fs = require('fs');

function updateFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const authFolder = data.item.find(f => f.name.includes('Authentication'));
  if (!authFolder) return;

  authFolder.item.forEach(reqItem => {
    if (reqItem.name.includes('Login')) {
      const testEvent = reqItem.event && reqItem.event.find(e => e.listen === 'test');
      if (testEvent && testEvent.script && testEvent.script.exec) {
        testEvent.script.exec = [
          "pm.test('Status 200 OK', () => pm.response.to.have.status(200));",
          "var jsonData = pm.response.json();",
          "if (jsonData.token) {",
          "    pm.collectionVariables.set('token', jsonData.token);",
          "    pm.environment.set('token', jsonData.token);",
          reqItem.name.includes('Admin') ? "    pm.collectionVariables.set('adminToken', jsonData.token); pm.environment.set('adminToken', jsonData.token);" : "",
          reqItem.name.includes('Author 1') ? "    pm.collectionVariables.set('author1Token', jsonData.token); pm.environment.set('author1Token', jsonData.token);" : "",
          reqItem.name.includes('Author 2') ? "    pm.collectionVariables.set('author2Token', jsonData.token); pm.environment.set('author2Token', jsonData.token);" : "",
          "}"
        ].filter(Boolean);
      }
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
  console.log('Updated:', filePath);
}

updateFile('D:/SDN302/assigment_3/Assignment3_Test.json');
updateFile('D:/SDN302/assigment_3/Assignment3_Postman_Collection.json');
