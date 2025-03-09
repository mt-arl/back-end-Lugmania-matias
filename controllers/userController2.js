// userController.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

const userController2 = {
    // Create new user
    createUser: async (req, res) => {
        try {
            const { cedula, first_name, last_name, address, phone, email, password, gender, id_rol } = req.body;

            // Validate required fields
            if (!cedula || !first_name || !last_name || !email || !password || !gender || !id_rol) {
                return res.status(400).json({
                    success: false,
                    message: 'Por favor complete todos los campos requeridos (cédula, nombre, apellido, email, contraseña, género)'
                });
            }

            // Check if email or cedula already exists
            const [existingUser] = await pool.query(
                'SELECT id FROM users WHERE email = ? OR cedula = ?',
                [email, cedula]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un usuario con este email o cédula'
                });
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);


            // Set default role (user)
            const [result] = await pool.query(
                'INSERT INTO users (cedula, first_name, last_name, address, phone, email, password, gender, id_rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [cedula, first_name, last_name, address || null, phone || null, email, hashedPassword, gender, id_rol]
            );

            res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                user: {
                    id: result.insertId,
                    cedula,
                    first_name,
                    last_name,
                    email,
                    role: id_rol
                }
            });
            enviarCorreo(
                email,
                "Bienvenido a Holistic Center",
                `Hola ${first_name} ${last_name},

                ¡Gracias por unirte a Holistic Center! Este correo confirma tu registro exitoso.

            Saludos,
            El equipo de Holistic Center`
            ).then(() => console.log("Correo enviado correctamente"))
                .catch((error) => console.error("Error al enviar correo:", error));



        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear el usuario',
                error: error.message
            });
        }
    },
    // Get all users
    getAllUsers: async (req, res) => {
        try {
            const [users] = await pool.query('SELECT id, cedula, first_name, last_name, address, phone, email, gender, id_rol FROM users');
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching users', error: error.message });
        }
    },

    // Get user by ID
    getUserById: async (req, res) => {
        try {
            const [user] = await pool.query(
                'SELECT id, cedula, first_name, last_name, address, phone, email, gender, id_rol FROM users WHERE id = ?',
                [req.params.id]
            );

            if (user.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json(user[0]);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user', error: error.message });
        }
    },



    // Update user
    updateUser: async (req, res) => {
        try {
            const { cedula, first_name, last_name, address, phone, email, gender, id_rol } = req.body;
            const userId = req.params.id;

            // Check if user exists
            const [existingUser] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);

            if (existingUser.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if email or cedula is already used by another user
            const [duplicateCheck] = await pool.query(
                'SELECT id FROM users WHERE (email = ? OR cedula = ?) AND id != ?',
                [email, cedula, userId]
            );

            if (duplicateCheck.length > 0) {
                return res.status(400).json({ message: 'Email or cedula already in use by another user' });
            }

            await pool.query(
                'UPDATE users SET cedula = ?, first_name = ?, last_name = ?, address = ?, phone = ?, email = ?, gender = ?, id_rol = ? WHERE id = ?',
                [cedula, first_name, last_name, address, phone, email, gender, id_rol, userId]
            );

            res.json({ message: 'User updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating user', error: error.message });
        }
    },

    // Delete user
    deleteUser: async (req, res) => {
        try {
            const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting user', error: error.message });
        }
    },

    // Update password
    updatePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.params.id;

            // Get current user
            const [user] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);

            if (user.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Verify current password
            const isValid = await bcrypt.compare(currentPassword, user[0].password);

            if (!isValid) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

            res.json({ message: 'Password updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating password', error: error.message });
        }
    }
};

module.exports = userController2;