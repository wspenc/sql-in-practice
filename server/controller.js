let nextEmp = 5

require('dotenv').config()

const Sequelize = require('sequelize')
const CONNECTION_STRING = process.env.CONNECTION_STRING

const sequelize = new Sequelize(CONNECTION_STRING, {
    
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }  
})

module.exports = {
    getUpcomingAppointments: (req, res) => {
        sequelize.query(`select a.appt_id, a.date, a.service_type, a.approved, a.completed, u.first_name, u.last_name 
        from cc_appointments a
        join cc_emp_appts ea on a.appt_id = ea.appt_id
        join cc_employees e on e.emp_id = ea.emp_id
        join cc_users u on e.user_id = u.user_id
        where a.approved = true and a.completed = false
        order by a.date desc;`)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },

    approveAppointment: (req, res) => {
        let {apptId} = req.body
    
        sequelize.query(`
        UPDATE cc_appointments 
        SET approved = true
        WHERE appt_id = ${apptId};
        insert into cc_emp_appts (emp_id, appt_id)
        values (${nextEmp}, ${apptId}),
        (${nextEmp + 1}, ${apptId});
        `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
                nextEmp += 2
            })
            .catch(err => console.log(err))
    },

    getAllClients: (req, res) => {
        sequelize.query(`
            SELECT * FROM cc_users
            JOIN cc_clients
            ON cc_users.user_id = cc_clients.user_id;
        `)
        .then ((dbRes) => {
            res.status(200).send(dbRes[0])
        })
        .catch((err) => {
            console.log(err)
            res.status(500).send('sequelize error')
        })
    },
    getPendingAppointments: (req, res) => {
        sequelize.query(`
        SELECT * FROM cc_appointments 
            WHERE approved = false
            ORDER BY date DESC;
        `)
        .then((dbRes) => {
            res.status(200).send(dbRes[0])
        })
    },
    getPastAppointments: (req, res) => {
        sequelize.query(`
        SELECT a.appt_id, a.date, a.service_type, a.approved, a.completed, u.first_name, u.last_name 
        FROM cc_appointments a
        JOIN cc_emp_appts ea on a.appt_id = ea.appt_id
        JOIN cc_employees e on e.emp_id = ea.emp_id
        JOIN cc_users u on e.user_id = u.user_id
        WHERE a.approved = true AND a.completed = true
        ORDER BY a.date desc;
        `)
        .then((dbRes) => {
            res.status(200).send(dbRes[0])
        })
    },
    completeAppointment: (req, res) => {
        let {apptId} = req.body
        sequelize.query(`
        UPDATE cc_appointments 
        SET completed = true
            WHERE appt_id = ${apptId};
        `)
        .then((dbRes) => {
            res.status(200).send(dbRes[0])
        })
}
}
