import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected successfully to SQLite database at:', dbPath);
  }
});

// Helper function to run SQL queries in a promise wrapper (clean code)
export const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Database Initialization & Seeding
export const initDatabase = async () => {
  // 1. Create Users Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('parent', 'teacher', 'admin')) NOT NULL,
      whatsapp TEXT,
      student_code TEXT,
      child_name TEXT,
      points INTEGER DEFAULT 0
    )
  `);

  // 2. Create Homeworks Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS homeworks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      due_date TEXT NOT NULL,
      description TEXT,
      file_path TEXT,
      file_name TEXT,
      teacher_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES users(id)
    )
  `);

  // 3. Create Solutions Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS solutions (
      id TEXT PRIMARY KEY,
      homework_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      graded INTEGER DEFAULT 0,
      grade TEXT,
      teacher_comment TEXT,
      FOREIGN KEY (homework_id) REFERENCES homeworks(id),
      FOREIGN KEY (student_id) REFERENCES users(id)
    )
  `);

  // 4. Create Chat Messages Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      text TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4b. Create Courses Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      age_group TEXT NOT NULL,
      lessons_count INTEGER DEFAULT 12,
      rating REAL DEFAULT 5.0,
      price TEXT NOT NULL,
      image_url TEXT,
      teacher_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4c. Create Enrollments Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, course_id),
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )
  `);

  // 4d. Create Recordings Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS recordings (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      file_path TEXT NOT NULL,
      duration TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )
  `);

  // 5. SECURE IMMUTABILITY: SQLite Triggers to strictly block Chat Updates and Deletes
  await dbRun(`
    CREATE TRIGGER IF NOT EXISTS prevent_chat_update 
    BEFORE UPDATE ON chat_messages
    BEGIN 
      SELECT RAISE(FAIL, 'Chat messages cannot be modified.'); 
    END;
  `);

  await dbRun(`
    CREATE TRIGGER IF NOT EXISTS prevent_chat_delete 
    BEFORE DELETE ON chat_messages
    BEGIN 
      SELECT RAISE(FAIL, 'Chat messages cannot be deleted.'); 
    END;
  `);

  console.log('Database tables and immutability triggers configured.');

  // 6. Seed mock roles if table is empty
  const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    console.log('Seeding initial mock accounts...');
    const hashedPw = await bcrypt.hash('password123', 10);

    // Parent/Student seed
    await dbRun(`
      INSERT INTO users (id, name, email, password, role, whatsapp, student_code, child_name, points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'parent_123',
      'أبو أحمد (ولي الأمر)',
      'parent@stars.com',
      hashedPw,
      'parent',
      '+966501234567',
      'STD-8492',
      'أحمد',
      150
    ]);

    // Teacher seed
    await dbRun(`
      INSERT INTO users (id, name, email, password, role, whatsapp)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'teacher_789',
      'الأستاذة سارة',
      'teacher@stars.com',
      hashedPw,
      'teacher',
      '+966509998887'
    ]);

    // Admin seed
    await dbRun(`
      INSERT INTO users (id, name, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `, [
      'admin_001',
      'مدير المنصة (أدمن)',
      'admin@stars.com',
      hashedPw,
      'admin'
    ]);

    console.log('Seeding mock users complete (Default password: "password123").');
  }

  // 7. Seed mock courses if table is empty
  const courseCount = await dbGet('SELECT COUNT(*) as count FROM courses');
  if (courseCount.count === 0) {
    console.log('Seeding initial mock courses in EGP...');
    const initialCourses = [
      {
        id: 'math-1',
        title: 'رياضيات الفضاء الاستكشافية للأطفال',
        subject: 'الرياضيات',
        ageGroup: '6-8 سنوات',
        lessonsCount: 12,
        rating: 4.9,
        price: '250 ج.م',
        imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80',
        teacherName: 'الأستاذة سارة'
      },
      {
        id: 'science-1',
        title: 'مختبر العلوم الصغير: تجارب تفاعلية',
        subject: 'العلوم',
        ageGroup: '8-11 سنة',
        lessonsCount: 16,
        rating: 4.8,
        price: '300 ج.م',
        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80',
        teacherName: 'الأستاذ خالد'
      },
      {
        id: 'code-1',
        title: 'برمجة الألعاب باستخدام سكراتش (Scratch)',
        subject: 'البرمجة',
        ageGroup: '9-12 سنة',
        lessonsCount: 20,
        rating: 5.0,
        price: '350 ج.م',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
        teacherName: 'المهندس أحمد'
      },
      {
        id: 'math-2',
        title: 'العمليات الحسابية الذهنية السريعة',
        subject: 'الرياضيات',
        ageGroup: '7-9 سنوات',
        lessonsCount: 10,
        rating: 4.7,
        price: '200 ج.م',
        imageUrl: 'https://images.unsplash.com/photo-1453733190148-c44698c26578?auto=format&fit=crop&w=400&q=80',
        teacherName: 'الأستاذة سارة'
      }
    ];

    for (const c of initialCourses) {
      await dbRun(`
        INSERT INTO courses (id, title, subject, age_group, lessons_count, rating, price, image_url, teacher_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [c.id, c.title, c.subject, c.ageGroup, c.lessonsCount, c.rating, c.price, c.imageUrl, c.teacherName]);
    }
    console.log('Seeding courses completed.');
  }

  // 8. Seed sample enrollment if empty
  const enrollmentCount = await dbGet('SELECT COUNT(*) as count FROM enrollments');
  if (enrollmentCount.count === 0) {
    await dbRun(`
      INSERT INTO enrollments (id, student_id, course_id)
      VALUES (?, ?, ?)
    `, ['enr_1', 'parent_123', 'math-1']);
    console.log('Seeded initial enrollment for demo parent in math-1.');
  }

  // 9. Seed sample recording if empty
  const recordingCount = await dbGet('SELECT COUNT(*) as count FROM recordings');
  if (recordingCount.count === 0) {
    await dbRun(`
      INSERT INTO recordings (id, course_id, title, file_path, duration)
      VALUES (?, ?, ?, ?, ?)
    `, ['rec_demo_1', 'math-1', 'الدرس الأول: مقدمة في الأرقام الفلكية والأشكال الهندسية', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', '25:00']);
    console.log('Seeded initial course recording.');
  }
};

export default db;
