const http = require('http');

http.get('http://localhost:3000/api/activities', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const activities = JSON.parse(data);
            console.log("FIRST_ACTIVITY=" + JSON.stringify(activities[0]));
            console.log("ALL_TYPES=" + JSON.stringify([...new Set(activities.map(a => a.tipo))]));
            process.exit(0);
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    });
}).on('error', err => {
    console.error(err);
    process.exit(1);
});


