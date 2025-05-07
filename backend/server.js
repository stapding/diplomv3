// backend/server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001; // Use port 3001 for the backend

// Middleware
app.use(cors()); // Allow requests from your frontend origin
app.use(express.json()); // Parse JSON request bodies

// --- API Endpoints ---

// Registration Endpoint
app.post('/api/register', async (req, res) => {
  const { firstName, middleName, lastName, email, password } = req.body;

  // Basic validation
  if (!firstName || !middleName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash the password
    const saltRounds = 10; // Adjust complexity as needed
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const regDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    const newUserQuery = `
      INSERT INTO users (first_name, middle_name, last_name, email, password, reg_date, role)
      VALUES ($1, $2, $3, $4, $5, $6, 'client')
      RETURNING user_id, email, first_name, last_name, role;
    `;
    const newUserResult = await db.query(newUserQuery, [
      firstName,
      middleName,
      lastName,
      email,
      hashedPassword,
      regDate
    ]);

    console.log('User registered:', newUserResult.rows[0]);
    res.status(201).json({ message: 'Пользователь успешно зарегистрирован.', user: newUserResult.rows[0] });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Внутренняя ошибка сервера при регистрации, попробуйте ещё раз.' });
  }
});

// Обновленный endpoint для авторизации в backend/server.js
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Требуется адрес электронной почты и пароль.' });
  }

  try {
    // Сначала ищем пользователя в таблице users
    const userQuery = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = null;
    let isDoctor = false;

    if (userQuery.rows.length > 0) {
      user = userQuery.rows[0];
    } else {
      // Если пользователь не найден в таблице users, ищем в таблице doctors
      const doctorQuery = await db.query('SELECT * FROM doctors WHERE email = $1', [email]);
      if (doctorQuery.rows.length > 0) {
        user = doctorQuery.rows[0];
        isDoctor = true;
      }
    }

    // Если пользователь не найден ни в одной таблице
    if (!user) {
      return res.status(401).json({ message: 'Неверный адрес электронной почты или пароль' });
    }

    // Сравниваем введенный пароль с хешированным паролем из БД
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Неверный адрес электронной почты или пароль' });
    }

    // Пароли совпадают - генерируем JWT
    let userPayload;
    let userData;

    if (isDoctor) {
      userPayload = {
        userId: user.doctor_id,
        email: user.email,
        firstName: user.first_name,
        role: 'doctor', // Явно устанавливаем роль doctor для врачей
      };

      userData = {
        userId: user.doctor_id,
        firstName: user.first_name,
        middleName: user.middle_name,
        lastName: user.last_name,
        email: user.email,
        experienceAge: user.experience_age,
        description: user.description,
        imagePath: user.image_path,
        role: 'doctor'
      };
    } else {
      userPayload = {
        userId: user.user_id,
        email: user.email,
        firstName: user.first_name,
        role: user.role,
      };

      userData = {
        userId: user.user_id,
        firstName: user.first_name,
        middleName: user.middle_name,
        lastName: user.last_name,
        email: user.email,
        regDate: user.reg_date,
        role: user.role
      };
    }

    const token = jwt.sign(
      userPayload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Отправляем токен и информацию о пользователе клиенту
    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: userData
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

// Endpoint для получения новостей с информацией об отделении
app.get('/api/news', async (req, res) => {
  try {
    const newsQuery = `
      SELECT
        news.news_id,
        news.title,
        news.subtitle,
        news.content,
        news.news_date,
        branches.name AS branch_name,
        branches.address AS branch_address
      FROM news
      JOIN branches ON news.branch_id = branches.branch_id
      ORDER BY news.news_date DESC;
    `;
    const newsResult = await db.query(newsQuery);
    res.status(200).json(newsResult.rows);
  } catch (err) {
    console.error('Error fetching news with branches:', err);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
});

// Endpoint для получения конкретной новости по ID
app.get('/api/news/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const newsQuery = `
      SELECT
        news.news_id,
        news.title,
        news.subtitle,
        news.content,
        news.news_date,
        branches.name AS branch_name,
        branches.address AS branch_address
      FROM news
      JOIN branches ON news.branch_id = branches.branch_id
      WHERE news.news_id = $1;
    `;
    const newsResult = await db.query(newsQuery, [id]);

    if (newsResult.rows.length === 0) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.status(200).json(newsResult.rows[0]);
  } catch (err) {
    console.error('Error fetching news item:', err);
    res.status(500).json({ message: 'Failed to fetch news item' });
  }
});

// Endpoint для добавления новости
app.post('/api/news', async (req, res) => {
  const { title, subtitle, content, branch } = req.body;

  try {
    // Получите branch_id на основе названия филиала
    const branchQuery = `SELECT branch_id FROM branches WHERE address = $1`;
    const branchResult = await db.query(branchQuery, [branch]);

    if (branchResult.rows.length === 0) {
      return res.status(400).json({ message: 'Branch not found' });
    }

    const branch_id = branchResult.rows[0].branch_id;

    // Вставьте новую новость
    const newsQuery = `
      INSERT INTO news (title, subtitle, content, news_date, branch_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING news_id;
    `;
    const newsDate = new Date().toISOString().slice(0, 10);
    const newsResult = await db.query(newsQuery, [title, subtitle, content, newsDate, branch_id]);

    // Получаем полные данные созданной новости вместе с информацией о филиале
    const newsId = newsResult.rows[0].news_id;
    const completeNewsQuery = `
      SELECT 
        n.news_id, n.title, n.subtitle, n.content, n.news_date,
        b.name AS branch_name, b.address AS branch_address
      FROM news n
      JOIN branches b ON n.branch_id = b.branch_id
      WHERE n.news_id = $1;
    `;
    const completeNewsResult = await db.query(completeNewsQuery, [newsId]);

    res.status(201).json({
      message: 'News item created successfully',
      news: completeNewsResult.rows[0]
    });
  } catch (err) {
    console.error('Error creating news item:', err);
    res.status(500).json({ message: 'Failed to create news item' });
  }
});

// Endpoint для редактирования новости по ID
app.put('/api/news/:id', async (req, res) => {
  const { id } = req.params;
  const { title, subtitle, content, branch } = req.body;

  try {
    // Получите branch_id на основе названия филиала
    const branchQuery = `SELECT branch_id FROM branches WHERE address = $1`;
    const branchResult = await db.query(branchQuery, [branch]);

    if (branchResult.rows.length === 0) {
      return res.status(400).json({ message: 'Branch not found' });
    }

    const branch_id = branchResult.rows[0].branch_id;

    // Обновите новость
    const updateQuery = `
      UPDATE news
      SET title = $1, subtitle = $2, content = $3, branch_id = $4
      WHERE news_id = $5
      RETURNING news_id;
    `;
    const updateResult = await db.query(updateQuery, [title, subtitle, content, branch_id, id]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Получаем полные данные обновленной новости вместе с информацией о филиале
    const newsId = updateResult.rows[0].news_id;
    const completeNewsQuery = `
      SELECT
        n.news_id, n.title, n.subtitle, n.content, n.news_date,
        b.name AS branch_name, b.address AS branch_address
      FROM news n
      JOIN branches b ON n.branch_id = b.branch_id
      WHERE n.news_id = $1;
    `;
    const completeNewsResult = await db.query(completeNewsQuery, [newsId]);

    res.status(200).json({
      message: 'News item updated successfully',
      news: completeNewsResult.rows[0]
    });
  } catch (err) {
    console.error('Error updating news item:', err);
    res.status(500).json({ message: 'Failed to update news item' });
  }
});

// Endpoint для удаления новости по ID
app.delete('/api/news/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Выполните запрос к базе данных для удаления новости с указанным ID
    const deleteQuery = `
      DELETE FROM news
      WHERE news_id = $1;
    `;
    await db.query(deleteQuery, [id]);

    // Отправьте успешный ответ
    res.status(200).json({ message: 'News item deleted successfully' });
  } catch (err) {
    console.error('Error deleting news item:', err);
    res.status(500).json({ message: 'Failed to delete news item' });
  }
});

// Endpoint для получения списка отделений
app.get('/api/branches', async (req, res) => {
  try {
    const branchesQuery = `
      SELECT
        branch_id,
        name,
        address,
        description
      FROM branches
      ORDER BY name;
    `;
    const branchesResult = await db.query(branchesQuery);
    res.status(200).json(branchesResult.rows);
  } catch (err) {
    console.error('Error fetching branches:', err);
    res.status(500).json({ message: 'Failed to fetch branches' });
  }
});

// Endpoint для получения списка услуг из прайс-листа
app.get('/api/price-lists', async (req, res) => {
  try {
    const priceListsQuery = `
      SELECT
        price_list_id,
        service,
        price,
        specialties.name AS specialty_name
      FROM price_lists
      JOIN specialties ON price_lists.specialty_id = specialties.specialty_id
      ORDER BY service;
    `;
    const priceListsResult = await db.query(priceListsQuery);
    res.status(200).json(priceListsResult.rows);
  } catch (err) {
    console.error('Error fetching price lists:', err);
    res.status(500).json({ message: 'Failed to fetch price lists' });
  }
});

// Endpoint для получения списка расписания докторов
app.get('/api/schedule', async (req, res) => {
  try {
    const scheduleQuery = `
      SELECT
        d.doctor_id,
        d.first_name,
        d.middle_name,
        d.last_name,
        d.image_path,
        s.name AS specialty_name,
        sc.day_week,
        b.address
      FROM doctors d
      JOIN doctors_specialties ds ON d.doctor_id = ds.doctor_id
      JOIN specialties s ON ds.specialty_id = s.specialty_id
      JOIN schedules sc ON d.doctor_id = sc.doctor_id
      JOIN branches b ON sc.branch_id = b.branch_id
      ORDER BY d.last_name, d.first_name, sc.day_week;
    `;
    const scheduleResult = await db.query(scheduleQuery);
    res.status(200).json(scheduleResult.rows);
  } catch (err) {
    console.error('Error fetching schedule data:', err);
    res.status(500).json({ message: 'Failed to fetch schedule data' });
  }
});

// Endpoint для получения данных для отображения на профиле варча
app.get('/api/doctors/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Получаем данные о враче
    const doctorQuery = `
      SELECT
        doctor_id,
        first_name,
        middle_name,
        last_name,
        email,
        experience_age,
        description,
        image_path
      FROM doctors
      WHERE doctor_id = $1;
    `;
    const doctorResult = await db.query(doctorQuery, [id]);

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const doctor = doctorResult.rows[0];

    // Получаем специальности врача
    const specialtiesQuery = `
      SELECT
        s.name
      FROM specialties s
      JOIN doctors_specialties ds ON s.specialty_id = ds.specialty_id
      WHERE ds.doctor_id = $1;
    `;
    const specialtiesResult = await db.query(specialtiesQuery, [id]);
    doctor.specialties = specialtiesResult.rows.map(row => row.name);

    // Получаем отзывы о враче с именами пользователей
    const reviewsQuery = `
      SELECT
        r.review_id,
        r.title,
        r.context,
        r.mark,
        r.rev_date,
        r.user_id,
        u.first_name,
        u.last_name
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.doctor_id = $1
      ORDER BY r.rev_date DESC;
    `;
    const reviewsResult = await db.query(reviewsQuery, [id]);
    doctor.reviews = reviewsResult.rows;

    // Получаем клиники, где работает врач
    const branchesQuery = `
            SELECT DISTINCT
                b.branch_id,
                b.name,
                b.address
            FROM branches b
            JOIN schedules s ON b.branch_id = s.branch_id
            WHERE s.doctor_id = $1;
        `;
    const branchesResult = await db.query(branchesQuery, [id]);
    doctor.branches = branchesResult.rows;

    res.status(200).json(doctor);
  } catch (err) {
    console.error('Error fetching doctor data:', err);
    res.status(500).json({ message: 'Failed to fetch doctor data' });
  }
});

// Middleware для проверки JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }

    req.user = user;
    next();
  });
};

// Endpoint для получения данных профиля пользователя
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let userQuery;
    let userParams = [userId];

    if (role === 'doctor') {
      userQuery = `
        SELECT doctor_id as user_id, first_name, middle_name, last_name, email 
        FROM doctors 
        WHERE doctor_id = $1
      `;
    } else {
      userQuery = `
        SELECT user_id, first_name, middle_name, last_name, email 
        FROM users 
        WHERE user_id = $1
      `;
    }

    const userResult = await db.query(userQuery, userParams);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.status(200).json(userResult.rows[0]);
  } catch (err) {
    console.error('Ошибка при получении данных профиля:', err);
    res.status(500).json({ message: 'Не удалось получить данные профиля' });
  }
});

// Endpoint для обновления данных профиля пользователя
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const { first_name, middle_name, last_name } = req.body;

    // Базовая валидация
    if (!first_name || !last_name) {
      return res.status(400).json({ message: 'Имя и фамилия обязательны' });
    }

    let updateQuery;
    let queryParams = [first_name, middle_name, last_name, userId];

    if (role === 'doctor') {
      updateQuery = `
        UPDATE doctors 
        SET first_name = $1, middle_name = $2, last_name = $3 
        WHERE doctor_id = $4 
        RETURNING doctor_id as user_id, first_name, middle_name, last_name, email
      `;
    } else {
      updateQuery = `
        UPDATE users 
        SET first_name = $1, middle_name = $2, last_name = $3 
        WHERE user_id = $4 
        RETURNING user_id, first_name, middle_name, last_name, email
      `;
    }

    const result = await db.query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при обновлении профиля:', err);
    res.status(500).json({ message: 'Не удалось обновить данные профиля' });
  }
});

// Endpoint для создания отзыва
app.post('/api/reviews', authenticateToken, async (req, res) => {
  const { title, context, mark, doctor_id } = req.body;
  const user_id = req.user.userId; // Получаем ID пользователя из JWT

  try {
    // Валидация данных
    if (!title || !context || !mark || !doctor_id || !user_id) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Проверка, оставлял ли пользователь уже отзыв этому врачу
    const existingReview = await db.query(
      'SELECT * FROM reviews WHERE user_id = $1 AND doctor_id = $2',
      [user_id, doctor_id]
    );

    if (existingReview.rows.length > 0) {
      return res
      .status(409)
      .json({ message: 'User has already reviewed this doctor' });
    }

    // Создание отзыва
    const rev_date = new Date().toISOString().slice(0, 10);
    const newReviewQuery = `
      INSERT INTO reviews (title, context, mark, rev_date, doctor_id, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING review_id;
    `;
    const newReviewResult = await db.query(newReviewQuery, [
      title,
      context,
      mark,
      rev_date,
      doctor_id,
      user_id,
    ]);

    // Получаем полные данные созданного отзыва вместе с информацией о пользователе
    const reviewId = newReviewResult.rows[0].review_id;
    const completeReviewQuery = `
      SELECT 
        r.review_id, r.title, r.context, r.mark, r.rev_date, r.user_id, r.doctor_id,
        u.first_name, u.last_name
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.review_id = $1;
    `;
    const completeReviewResult = await db.query(completeReviewQuery, [reviewId]);

    res.status(201).json({
      message: 'Review created successfully',
      review: completeReviewResult.rows[0],
    });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ message: 'Failed to create review' });
  }
});

// Endpoint для удаления отзыва
app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.userId;
  const role = req.user.role;

  try {
    // Проверка, является ли пользователь автором отзыва или менеджером
    if (role === 'manager') {
      // Менеджеры могут удалять любые отзывы
      await db.query('DELETE FROM reviews WHERE review_id = $1', [id]);
      res.status(200).json({ message: 'Review deleted successfully' });
    } else {
      // Обычные пользователи могут удалять только свои отзывы
      const reviewCheck = await db.query(
        'SELECT * FROM reviews WHERE review_id = $1 AND user_id = $2',
        [id, user_id]
      );

      if (reviewCheck.rows.length === 0) {
        return res
        .status(403)
        .json({ message: 'You are not authorized to delete this review' });
      }

      // Удаление отзыва
      await db.query('DELETE FROM reviews WHERE review_id = $1', [id]);
      res.status(200).json({ message: 'Review deleted successfully' });
    }
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

// Endpoint для получения трех случайных отзывов с оценкой 5
app.get('/api/testimonials', async (req, res) => {
  try {
    const testimonialsQuery = `
      SELECT
        r.context,
        r.mark,
        u.first_name,
        u.last_name
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.mark = 5
      ORDER BY RANDOM()
      LIMIT 3;
    `;
    const testimonialsResult = await db.query(testimonialsQuery);
    res.status(200).json(testimonialsResult.rows);
  } catch (err) {
    console.error('Error fetching testimonials:', err);
    res.status(500).json({ message: 'Failed to fetch testimonials' });
  }
});

// Endpoint для создания запроса на запись
app.post('/api/requests', authenticateToken, async (req, res) => {
  const { appointment_type, pet_name, pet_type, comment, user_phone } = req.body;
  const user_id = req.user.userId;
  const status = 'Ожидание';

  try {
    // Валидация данных
    if (!appointment_type || !pet_name || !pet_type || !user_phone) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
    }

    // Проверка допустимых значений ENUM
    const allowedAppointmentTypes = ['Осмотр', 'Хирургическая операция', 'Посещение больного'];
    const allowedPetTypes = ['Собака', 'Кот', 'Другое'];

    if (!allowedAppointmentTypes.includes(appointment_type)) {
      return res.status(400).json({ message: 'Недопустимый тип приема' });
    }

    if (!allowedPetTypes.includes(pet_type)) {
      return res.status(400).json({ message: 'Недопустимый тип питомца' });
    }

    // Создание запроса с NULL для doctor_id и branch_id
    const req_date = new Date().toISOString().slice(0, 10);
    const newRequestQuery = `
      INSERT INTO requests (user_id, user_phone, req_date, status, appointment_type, pet_name, pet_type, comment, doctor_id, branch_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, NULL)
      RETURNING *;
    `;
    const newRequestResult = await db.query(newRequestQuery, [
      user_id,
      user_phone,
      req_date,
      status,
      appointment_type,
      pet_name,
      pet_type,
      comment,
    ]);

    res.status(201).json({
      message: 'Запрос на запись успешно создан',
      request: newRequestResult.rows[0],
    });
  } catch (err) {
    console.error('Ошибка при создании запроса:', err);
    res.status(500).json({ message: 'Не удалось создать запрос: ' + err.message });
  }
});

// Endpoint для получения списка категорий товаров
app.get('/api/categories', async (req, res) => {
  try {
    const categoriesQuery = `
      SELECT
        category_id,
        name,
        description
      FROM categories
      ORDER BY name;
    `;
    const categoriesResult = await db.query(categoriesQuery);
    res.status(200).json(categoriesResult.rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Endpoint для получения списка товаров (с возможностью фильтрации по категории)
app.get('/api/products', async (req, res) => {
  const { category_id } = req.query; // Получаем ID категории из query parameters

  try {
    let productsQuery = `
      SELECT
        p.product_id,
        p.category_id,
        p.name,
        p.price,
        p.quantity,
        p.image,
        c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
    `;
    const queryParams = [];

    if (category_id) {
      productsQuery += ` WHERE p.category_id = $1`;
      queryParams.push(category_id);
    }

    productsQuery += ` ORDER BY p.name;`;

    const productsResult = await db.query(productsQuery, queryParams);
    res.status(200).json(productsResult.rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// backend/server.js
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { cart } = req.body;
  const user_id = req.user.userId;

  try {
    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: 'Корзина пуста' });
    }

    const ord_date = new Date().toISOString();
    const status = 'Сборка';

    // Создание заказа
    const newOrderQuery = `
      INSERT INTO orders (user_id, ord_date, status)
      VALUES ($1, $2, $3)
      RETURNING order_id;
    `;
    const newOrderResult = await db.query(newOrderQuery, [user_id, ord_date, status]);
    const order_id = newOrderResult.rows[0].order_id;

    // Добавление товаров в заказ и обновление количества в products
    for (const item of cart) {
      const addProductToOrderQuery = `
        INSERT INTO orders_products (order_id, product_id, quantity)
        VALUES ($1, $2, $3);
      `;
      await db.query(addProductToOrderQuery, [order_id, item.product_id, item.quantity]);

      // Уменьшение количества товара на складе
      const updateProductQuantityQuery = `
        UPDATE products
        SET quantity = quantity - $1
        WHERE product_id = $2;
      `;
      await db.query(updateProductQuantityQuery, [item.quantity, item.product_id]);
    }

    res.status(201).json({ message: 'Заказ успешно создан', order_id: order_id });
  } catch (err) {
    console.error('Ошибка при создании заказа:', err);
    res.status(500).json({ message: 'Не удалось создать заказ' });
  }
});

// Endpoint для получения списка заказов
app.get('/api/orders', authenticateToken, async (req, res) => {
  const user_id = req.user.userId;
  const role = req.user.role;

  try {
    let ordersQuery = `
      SELECT
        o.order_id,
        o.user_id,
        o.ord_date,
        o.status,
        u.first_name,
        u.last_name,
        SUM(op.quantity * p.price) AS totalPrice,
        JSON_AGG(JSON_BUILD_OBJECT(
          'id', p.product_id,
          'name', p.name,
          'category', c.name,
          'price', p.price,
          'quantity', op.quantity,
          'image', p.image
        )) AS items
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      JOIN orders_products op ON o.order_id = op.order_id
      JOIN products p ON op.product_id = p.product_id
      JOIN categories c ON p.category_id = c.category_id
      WHERE 1=1
    `;

    const queryParams = [];

    if (role !== 'manager') {
      ordersQuery += ` AND o.user_id = $1`;
      queryParams.push(user_id);
    }

    ordersQuery += `
      GROUP BY o.order_id, o.user_id, o.ord_date, o.status, u.first_name, u.last_name
      ORDER BY o.ord_date DESC;
    `;

    const ordersResult = await db.query(ordersQuery, queryParams);

    const ordersWithFullName = ordersResult.rows.map(order => {
      let fullName = '';
      if (order.first_name) fullName += order.first_name;
      if (order.last_name) {
        if (fullName) fullName += ' ';
        fullName += order.last_name;
      }

      return {
        ...order,
        customerName: fullName || 'Имя не указано'
      };
    });

    res.status(200).json(ordersWithFullName);
  } catch (err) {
    console.error('Ошибка при получении заказов:', err);
    res.status(500).json({ message: 'Не удалось получить заказы' });
  }
});

// Endpoint для обновления статуса заказа
app.put('/api/orders/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const role = req.user.role;

  try {
    if (role !== 'manager') {
      return res.status(403).json({ message: 'У вас нет прав для изменения статуса заказа' });
    }

    const updateOrderQuery = `
      UPDATE orders
      SET status = $1
      WHERE order_id = $2
      RETURNING *;
    `;
    const updateOrderResult = await db.query(updateOrderQuery, [status, id]);

    if (updateOrderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    res.status(200).json({ message: 'Статус заказа успешно обновлен', order: updateOrderResult.rows[0] });
  } catch (err) {
    console.error('Ошибка при обновлении статуса заказа:', err);
    res.status(500).json({ message: 'Не удалось обновить статус заказа' });
  }
});

// Endpoint для получения заявок пользователя
app.get('/api/user/requests', authenticateToken, async (req, res) => {
  const user_id = req.user.userId;

  try {
    const requestsQuery = `
      SELECT
        r.request_id,
        r.doctor_id,
        r.branch_id,
        r.user_phone,
        r.req_date,
        r.status,
        r.appointment_type,
        r.pet_name,
        r.pet_type,
        r.comment,
        r.come_date,
        d.first_name,
        d.middle_name,
        d.last_name,
        b.name AS branch_name,
        b.address AS branch_address
      FROM requests r
      LEFT JOIN doctors d ON r.doctor_id = d.doctor_id
      LEFT JOIN branches b ON r.branch_id = b.branch_id
      WHERE r.user_id = $1 AND (r.status = 'Активно' OR r.status = 'Завершено')
      ORDER BY r.req_date DESC;
    `;

    const requestsResult = await db.query(requestsQuery, [user_id]);
    res.status(200).json(requestsResult.rows);
  } catch (err) {
    console.error('Ошибка при получении заявок:', err);
    res.status(500).json({ message: 'Не удалось получить список заявок' });
  }
});

// Endpoint для получения всех заявок (для менеджера)
app.get('/api/manager/requests', authenticateToken, async (req, res) => {
  const role = req.user.role;

  // Проверка прав доступа
  if (role !== 'manager') {
    return res.status(403).json({ message: 'У вас нет прав для просмотра всех заявок' });
  }

  try {
    const requestsQuery = `
      SELECT
        r.request_id,
        r.doctor_id,
        r.branch_id,
        r.user_id,
        r.user_phone,
        r.req_date,
        r.status,
        r.appointment_type,
        r.pet_name,
        r.pet_type,
        r.comment,
        r.come_date,
        d.first_name AS doctor_first_name,
        d.middle_name AS doctor_middle_name,
        d.last_name AS doctor_last_name,
        u.first_name AS user_first_name,
        u.middle_name AS user_middle_name,
        u.last_name AS user_last_name,
        b.name AS branch_name,
        b.address AS branch_address
      FROM requests r
      LEFT JOIN doctors d ON r.doctor_id = d.doctor_id
      LEFT JOIN users u ON r.user_id = u.user_id
      LEFT JOIN branches b ON r.branch_id = b.branch_id
      ORDER BY r.req_date DESC;
    `;

    const requestsResult = await db.query(requestsQuery);
    res.status(200).json(requestsResult.rows);
  } catch (err) {
    console.error('Ошибка при получении заявок:', err);
    res.status(500).json({ message: 'Не удалось получить список заявок' });
  }
});

// Endpoint для получения списка всех врачей
app.get('/api/doctors', async (req, res) => {
  try {
    const doctorsQuery = `
      SELECT
        doctor_id,
        first_name,
        middle_name,
        last_name
      FROM doctors
      ORDER BY last_name, first_name;
    `;
    const doctorsResult = await db.query(doctorsQuery);
    res.status(200).json(doctorsResult.rows);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ message: 'Failed to fetch doctors' });
  }
});

// Endpoint для получения заявок доктора
app.get('/api/doctor/requests', authenticateToken, async (req, res) => {
  const doctor_id = req.user.userId;
  const role = req.user.role;

  // Проверка прав доступа
  if (role !== 'doctor') {
    return res.status(403).json({ message: 'У вас нет прав для просмотра записей доктора' });
  }

  try {
    const requestsQuery = `
      SELECT
        r.request_id,
        r.user_id,
        r.user_phone,
        r.req_date,
        r.status,
        r.appointment_type,
        r.pet_name,
        r.pet_type,
        r.comment,
        r.come_date,
        u.first_name AS user_first_name,
        u.middle_name AS user_middle_name,
        u.last_name AS user_last_name,
        b.name AS branch_name,
        b.address AS branch_address
      FROM requests r
      JOIN users u ON r.user_id = u.user_id
      LEFT JOIN branches b ON r.branch_id = b.branch_id
      WHERE r.doctor_id = $1 AND (r.status = 'Активно' OR r.status = 'Завершено')
      ORDER BY r.come_date ASC;
    `;

    const requestsResult = await db.query(requestsQuery, [doctor_id]);
    res.status(200).json(requestsResult.rows);
  } catch (err) {
    console.error('Ошибка при получении записей:', err);
    res.status(500).json({ message: 'Не удалось получить список записей' });
  }
});

// Endpoint для обновления статуса заявки
app.put('/api/doctor/requests/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.userId;
  const role = req.user.role;

  try {
    // Проверка наличия заявки
    const requestQuery = `SELECT * FROM requests WHERE request_id = $1`;
    const requestResult = await db.query(requestQuery, [id]);

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    const request = requestResult.rows[0];

    // Проверка прав доступа
    if (role === 'doctor' && request.doctor_id !== userId) {
      return res.status(403).json({ message: 'У вас нет прав для изменения этой заявки' });
    }

    if (role !== 'manager' && role !== 'doctor') {
      return res.status(403).json({ message: 'У вас нет прав для изменения заявок' });
    }

    // Обновление статуса
    const updateRequestQuery = `
      UPDATE requests
      SET status = $1
      WHERE request_id = $2
      RETURNING *;
    `;
    const updateResult = await db.query(updateRequestQuery, [status, id]);

    res.status(200).json({
      message: 'Статус заявки успешно обновлен',
      request: updateResult.rows[0]
    });
  } catch (err) {
    console.error('Ошибка при обновлении статуса заявки:', err);
    res.status(500).json({ message: 'Не удалось обновить статус заявки' });
  }
});

// Endpoint для назначения/обновления записи
app.put('/api/manager/requests/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { doctorId, branchAddress, comeDate, status, appointmentType } = req.body;
  const role = req.user.role;

  // Проверка прав доступа
  if (role !== 'manager') {
    return res.status(403).json({ message: 'У вас нет прав для изменения записей' });
  }

  try {
    // Получаем branch_id по адресу
    let branch_id = null;
    if (branchAddress) {
      const branchQuery = `SELECT branch_id FROM branches WHERE address = $1`;
      const branchResult = await db.query(branchQuery, [branchAddress]);
      if (branchResult.rows.length > 0) {
        branch_id = branchResult.rows[0].branch_id;
      }
    }

    // Обновляем запись
    const updateFields = [];
    const queryParams = [];
    let paramCounter = 1;

    if (doctorId) {
      updateFields.push(`doctor_id = $${paramCounter++}`);
      queryParams.push(doctorId);
    }

    if (branch_id) {
      updateFields.push(`branch_id = $${paramCounter++}`);
      queryParams.push(branch_id);
    }

    if (comeDate) {
      updateFields.push(`come_date = $${paramCounter++}`);
      queryParams.push(comeDate);
    }

    if (status) {
      updateFields.push(`status = $${paramCounter++}`);
      queryParams.push(status);
    }

    if (appointmentType) {
      updateFields.push(`appointment_type = $${paramCounter++}`);
      queryParams.push(appointmentType);
    }

    // Добавляем ID записи в параметры
    queryParams.push(id);

    const updateRequestQuery = `
      UPDATE requests
      SET ${updateFields.join(', ')}
      WHERE request_id = $${paramCounter}
      RETURNING *;
    `;

    const updateResult = await db.query(updateRequestQuery, queryParams);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }

    res.status(200).json({
      message: 'Запись успешно обновлена',
      request: updateResult.rows[0]
    });
  } catch (err) {
    console.error('Ошибка при обновлении записи:', err);
    res.status(500).json({ message: 'Не удалось обновить запись' });
  }
});

// Endpoint для удаления записи
app.delete('/api/manager/requests/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const role = req.user.role;

  // Проверка прав доступа
  if (role !== 'manager') {
    return res.status(403).json({ message: 'У вас нет прав для удаления записей' });
  }

  try {
    const deleteRequestQuery = `
      DELETE FROM requests
      WHERE request_id = $1
      RETURNING *;
    `;

    const deleteResult = await db.query(deleteRequestQuery, [id]);

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }

    res.status(200).json({
      message: 'Запись успешно удалена'
    });
  } catch (err) {
    console.error('Ошибка при удалении записи:', err);
    res.status(500).json({ message: 'Не удалось удалить запись' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});