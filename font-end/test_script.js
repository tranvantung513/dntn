const fs = require('fs');
fetch('http://103.82.24.142:9090/api/orders')
  .then(r => r.json())
  .then(data => {
      let list = data.data || data.content || data;
      let simplified = list.map(o => ({id: o.id.slice(0,5), name: o.receiverName, user_id: o.userId || o.user_id || 'NONE'}));
      console.log(JSON.stringify(simplified, null, 2));
  }).catch(e => console.error(e));
