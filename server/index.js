const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'nghtshftrs_super_secret_key';

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration du stockage Cloudinary pour Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Détermine le dossier selon le type de fichier
    let folderName = 'nghtshftrs/gallery';
    if (file.fieldname.includes('member') || ['car_photo', 'id_card_photo', 'profile_photo'].includes(file.fieldname)) {
        folderName = 'nghtshftrs/members';
    }
    if (file.fieldname.includes('event') || ['location_image', 'route_image'].includes(file.fieldname)) {
        folderName = 'nghtshftrs/events';
    }

    return {
      folder: folderName,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      public_id: Date.now() + '-' + file.originalname.split('.')[0],
    };
  },
});

const upload = multer({ storage: storage });

// Database Connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // SSL est obligatoire pour TiDB Cloud
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
});

// Petit test de log pour confirmer la connexion au démarrage
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Erreur de connexion TiDB:', err.message);
    } else {
        console.log('✅ Connecté avec succès à TiDB Cloud (nghtshftrs)');
        connection.release();
    }
});
// -------------------------

// Admin Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- PUBLIC ROUTES ---

// VERIFY ACCESS CODE
app.post('/api/verify-access', (req, res) => {
    const { code } = req.body;
    db.query('SELECT * FROM members WHERE access_code = ?', [code], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(401).json({ message: 'ACCESS DENIED' });
        res.json({ status: 'granted', member: results[0] });
    });
});

// GET LEADERBOARD
app.get('/api/leaderboard', (req, res) => {
    db.query('SELECT nickname, profile_photo, car_model, wins_1st, wins_2nd, wins_3rd, (wins_1st * 3 + wins_2nd * 2 + wins_3rd) as score FROM members ORDER BY score DESC LIMIT 10', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// GET ALL EVENTS (Public)
app.get('/api/events', (req, res) => {
    const query = `
        SELECT e.*, (SELECT COUNT(*) FROM participations p WHERE p.event_id = e.id) as participant_count 
        FROM events e 
        ORDER BY e.date DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// GET PARTICIPATION STATUS (Public)
app.get('/api/events/:id/participation-status/:memberId', (req, res) => {
    db.query('SELECT * FROM participations WHERE event_id = ? AND member_id = ?', [req.params.id, req.params.memberId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ isRegistered: results.length > 0 });
    });
});

// GET MEMBER PROFILE (Public)
app.get('/api/profile/:nickname', (req, res) => {
    const query = `
        SELECT nickname, profile_photo, bio, social_links, theme_color, font_family, background_url, music_url, show_car, car_model, car_photo, wins_1st, wins_2nd, wins_3rd 
        FROM members 
        WHERE nickname = ?
    `;
    db.query(query, [req.params.nickname], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: 'Profile not found' });
        res.json(results[0]);
    });
});

// UPDATE MEMBER PROFILE (Private)
app.put('/api/member/profile', (req, res) => {
    const { access_code, bio, social_links, theme_color, font_family, background_url, music_url, show_car } = req.body;
    
    // First verify access code
    db.query('SELECT id FROM members WHERE access_code = ?', [access_code], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(401).json({ message: 'ACCESS DENIED' });

        const memberId = results[0].id;
        const query = `
            UPDATE members 
            SET bio = ?, social_links = ?, theme_color = ?, font_family = ?, background_url = ?, music_url = ?, show_car = ? 
            WHERE id = ?
        `;
        const values = [
            bio || '', 
            typeof social_links === 'string' ? social_links : JSON.stringify(social_links || []), 
            theme_color || '#ff2d55', 
            font_family || 'Inter', 
            background_url || '', 
            music_url || '', 
            show_car !== undefined ? show_car : true, 
            memberId
        ];

        db.query(query, values, (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Profile updated successfully' });
        });
    });
});

// REGISTER FOR EVENT (Public)
app.post('/api/events/:id/register', (req, res) => {
    const { memberId } = req.body;
    db.query('INSERT INTO participations (event_id, member_id) VALUES (?, ?)', [req.params.id, memberId], (err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Already registered' });
            return res.status(500).json(err);
        }
        res.json({ message: 'Registration successful!' });
    });
});

app.get('/api/gallery', (req, res) => {
    db.query('SELECT * FROM gallery', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// --- ADMIN ROUTES ---

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM admins WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const admin = results[0];
        const isMatch = (password === admin.password); // Plain text fallback

        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '2h' });
        res.json({ token });
    });
});

// Manage Members
app.get('/api/admin/members', authenticateToken, (req, res) => {
    console.log('Admin request for members list...');
    db.query('SELECT * FROM members ORDER BY created_at DESC', (err, results) => {
        if (err) {
            console.error('Database error fetching members:', err);
            return res.status(500).json(err);
        }
        console.log(`Found ${results.length} members.`);
        res.json(results);
    });
});

const memberUploadFields = [
    { name: 'car_photo', maxCount: 1 },
    { name: 'id_card_photo', maxCount: 1 },
    { name: 'profile_photo', maxCount: 1 }
];

app.post('/api/admin/members', authenticateToken, upload.fields(memberUploadFields), (req, res) => {
    const { nickname, car_model, access_code, wins_1st, wins_2nd, wins_3rd } = req.body;
    
    const car_photo = req.files['car_photo'] ? req.files['car_photo'][0].path : req.body.car_photo;
    const id_card_photo = req.files['id_card_photo'] ? req.files['id_card_photo'][0].path : req.body.id_card_photo;
    const profile_photo = req.files['profile_photo'] ? req.files['profile_photo'][0].path : req.body.profile_photo;

    db.query('INSERT INTO members (nickname, car_model, car_photo, id_card_photo, profile_photo, access_code, wins_1st, wins_2nd, wins_3rd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
    [nickname, car_model, car_photo, id_card_photo, profile_photo, access_code, wins_1st || 0, wins_2nd || 0, wins_3rd || 0], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Member created!' });
    });
});

app.put('/api/admin/members/:id', authenticateToken, upload.fields(memberUploadFields), (req, res) => {
    const { nickname, car_model, access_code, wins_1st, wins_2nd, wins_3rd } = req.body;
    
    let car_photo = req.body.car_photo;
    let id_card_photo = req.body.id_card_photo;
    let profile_photo = req.body.profile_photo;

    if (req.files['car_photo']) car_photo = req.files['car_photo'][0].path;
    if (req.files['id_card_photo']) id_card_photo = req.files['id_card_photo'][0].path;
    if (req.files['profile_photo']) profile_photo = req.files['profile_photo'][0].path;

    db.query('UPDATE members SET nickname=?, car_model=?, car_photo=?, id_card_photo=?, profile_photo=?, access_code=?, wins_1st=?, wins_2nd=?, wins_3rd=? WHERE id=?', 
    [nickname, car_model, car_photo, id_card_photo, profile_photo, access_code, wins_1st, wins_2nd, wins_3rd, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Member updated!' });
    });
});

app.delete('/api/admin/members/:id', authenticateToken, (req, res) => {
    db.query('DELETE FROM members WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Member deleted!' });
    });
});

// Manage Events
const eventUploadFields = [
    { name: 'location_image', maxCount: 1 },
    { name: 'route_image', maxCount: 1 }
];

app.post('/api/admin/events', authenticateToken, upload.fields(eventUploadFields), (req, res) => {
    const { title, type, date, location, reward, price } = req.body;
    
    const location_image = req.files['location_image'] ? req.files['location_image'][0].path : (req.body.location_image || null);
    const route_image = req.files['route_image'] ? req.files['route_image'][0].path : (req.body.route_image || null);

    const numericPrice = parseFloat(price) || 0;

    const values = [
        title || '', 
        type || 'Other', 
        date || '', 
        location || '', 
        location_image, 
        route_image, 
        reward || '', 
        numericPrice
    ];

    db.query('INSERT INTO events (title, type, date, location, location_image, route_image, reward, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
    values, (err) => {
        if (err) {
            console.error('Database error in POST /api/admin/events:', err);
            return res.status(500).json({ error: err.message, details: err });
        }
        res.json({ message: 'Event added!' });
    });
});

app.put('/api/admin/events/:id', authenticateToken, upload.fields(eventUploadFields), (req, res) => {
    const { title, type, date, location, reward, price } = req.body;
    
    let location_image = req.files['location_image'] ? req.files['location_image'][0].path : (req.body.location_image || null);
    let route_image = req.files['route_image'] ? req.files['route_image'][0].path : (req.body.route_image || null);

    const numericPrice = parseFloat(price) || 0;

    const values = [
        title || '', 
        type || 'Other', 
        date || '', 
        location || '', 
        location_image, 
        route_image, 
        reward || '', 
        numericPrice,
        req.params.id
    ];

    db.query('UPDATE events SET title=?, type=?, date=?, location=?, location_image=?, route_image=?, reward=?, price=? WHERE id=?', 
    values, (err) => {
        if (err) {
            console.error('Database error in PUT /api/admin/events:', err);
            return res.status(500).json({ error: err.message, details: err });
        }
        res.json({ message: 'Event updated!' });
    });
});

// Get participants for an event (Admin)
app.get('/api/admin/events/:id/participants', authenticateToken, (req, res) => {
    const query = `
        SELECT m.id, m.nickname, m.car_model, m.profile_photo, p.qualifying_time, p.is_dnf
        FROM members m
        JOIN participations p ON m.id = p.member_id
        WHERE p.event_id = ?
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Update participant qualification (Admin)
app.put('/api/admin/events/:id/participants/:memberId', authenticateToken, (req, res) => {
    const { qualifying_time, is_dnf } = req.body;
    db.query('UPDATE participations SET qualifying_time = ?, is_dnf = ? WHERE event_id = ? AND member_id = ?', 
    [qualifying_time, is_dnf, req.params.id, req.params.memberId], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Qualification updated!' });
    });
});

app.delete('/api/admin/events/:id', authenticateToken, (req, res) => {
    db.query('DELETE FROM events WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Event deleted!' });
    });
});

// Manage Gallery
app.post('/api/admin/gallery', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const url = req.file.path;
    db.query('INSERT INTO gallery (url) VALUES (?)', [url], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Image added!' });
    });
});

app.delete('/api/admin/gallery/:id', authenticateToken, (req, res) => {
    db.query('DELETE FROM gallery WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Image deleted!' });
    });
});

app.listen(PORT, () => {
    console.log(`Dynamic NGHTSHFTRS Server running on port ${PORT}`);
});
