import mysql from 'mysql2';

const pool = mysql.createPool({

    host: 'localhost',
    user: 'ayoub',
    password: '_Co0p_Ap30Y2',
    database: 'campuslinkdatabase',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0


});

export default pool.promise();
