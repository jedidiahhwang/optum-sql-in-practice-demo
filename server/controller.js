// Boilerplate code
// Let's import the dotenv package, configure it, so we can use the variables.
require("dotenv").config();
// Now we need to import sequelize. Note that the default export is a class.
const Sequelize = require("sequelize");
// Destructure the CONNECTION_STRING from our process.env object.
const {CONNECTION_STRING} = process.env;

// Instantiate a sequelize object from the Sequelize class.
const sequelize = new Sequelize(CONNECTION_STRING, {
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
})

// JUST FOR THIS DEMO, let's declare a few variables.
// This represents the user with userId of 4 (Fern Rudgerd) and the clientId of 3 (a random person booking appointments).
const userId = 4;
const clientId = 3;

module.exports = {
    // Identify the patterns! Remember, all your seuquelize will have some basic structure to it. The only dynamic part is the actual SQL.
    getUserInfo: (req, res) => {
        // Let's select all the information regarding Fern Rudgerd. She has information stored on two tables though, so let's JOIN and alias.
        sequelize.query(`SELECT * FROM cc_clients AS c
        JOIN cc_users AS u
        ON c.user_id = u.user_id
        WHERE u.user_id = ${userId};`)
            .then((dbResponse) => {
                // Sequelize will store your data at the index of 0.
                res.status(200).send(dbResponse[0]);
            })
            .catch((err) => {
                console.log(err);
            })
    },
    updateUserInfo: (req, res) => {
        // All of this information is coming from the frontend! Let's destructure it off the body first so it's easier to use below.
        let {
            firstName,
            lastName,
            phoneNumber,
            email,
            address,
            city,
            state,
            zipCode
        } = req.body;

        // REMEMBER: If you are passing a string to the DB, make sure you wrap in single quotes to avoid it being read as a column!
        sequelize.query(`UPDATE cc_users
        SET first_name='${firstName}',
            last_name='${lastName}',
            email='${email}',
            phone_number=${phoneNumber}
        WHERE user_id=${userId};
        
        UPDATE cc_clients
        SET address='${address}',
            city='${city}',
            state='${state}',
            zip_code=${zipCode}
        WHERE user_id=${userId};`)
            .then((dbResponse) => {
                res.status(200).send(dbResponse[0]);
            })
            .catch((err) => {
                console.log(err);
            })
    },
    getUserAppt: (req, res) => {
        sequelize.query(`SELECT * FROM cc_appointments
        WHERE client_id=${clientId}
        ORDER BY date DESC;`)
            .then((dbResponse) => {
                res.status(200).send(dbResponse[0]);
            })
            .catch((err) => {
                console.log(err);
            })
    },
    requestAppointment: (req, res) => {
        const {date, service} = req.body;

        sequelize.query(`INSERT INTO cc_appointments(client_id, date, service_type, notes, approved, completed)
        VALUES(${clientId}, '${date}', '${service}', 'Demo appointment', false, false)
        RETURNING *;`)
            .then((dbResponse) => {
                res.status(200).send(dbResponse[0]);
            })
            .catch((err) => {
                console.log(err);
            })
    }
}