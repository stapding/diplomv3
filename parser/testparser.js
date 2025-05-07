const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../backend/db'); // <-- 1. Подключаем модуль БД (укажите правильный путь)

// --- Функции getTotalPages, parseCatalogPage, parseAllPages, parseMultipleCatalogs остаются без изменений ---

// Функция для определения количества страниц
async function getTotalPages(url) {
    try {
        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);
        const pagination = $('.b-pagination');
        const lastPageLink = pagination.find('a[href]:not(.b-pagination_arrow)').last();
        const lastPageHref = lastPageLink.attr('href');
        const lastPageNumber = lastPageHref ? parseInt(lastPageHref.match(/PAGEN_1=(\d+)/)?.[1], 10) : 1;
        return lastPageNumber;
    } catch (error) {
        console.error(`Ошибка при определении количества страниц для ${url}:`, error.message);
        return 1;
    }
}

// Функция для парсинга товаров на одной странице
async function parseCatalogPage(url, categoryId) {
    try {
        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);
        const catalogItems = $('#catalog-feed .b-good_inner');
        const itemsData = [];

        catalogItems.each((index, element) => {
            const item = $(element);
            const imageElement = item.find('.b-good_pic .prev-pic-test');
            let image = null;
            const backgroundImage = imageElement.css('background-image');
            if (backgroundImage) {
                const imageUrlMatch = backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
                if (imageUrlMatch && imageUrlMatch[1]) {
                    const relativeImageUrl = imageUrlMatch[1];
                    if (relativeImageUrl && !relativeImageUrl.startsWith('http')) {
                        image = `https://vetapteka1.ru${relativeImageUrl}`;
                    } else {
                        image = relativeImageUrl;
                    }
                }
            }
            // Если изображение не найдено, можно установить значение по умолчанию или пропустить товар
            if (!image) {
                console.warn(`Изображение не найдено для товара на странице ${url}, элемент ${index + 1}`);
                image = 'default_image_path.jpg'; // Или другое значение по умолчанию
            }


            const titleElement = item.find('.b-good_title a');
            const title = titleElement.text().trim();
            const link = titleElement.attr('href') ? `https://vetapteka1.ru${titleElement.attr('href')}` : null;

            const priceElement = item.find('.b-good_price .price-current');
            let price = priceElement.text().trim();
            price = price.replace(/[^\d]/g, '');
            // Преобразуем цену в число, если она пустая, ставим 0 или другое значение
            const priceInt = price ? parseInt(price, 10) : 0;


            const quantityElement = item.find('.b-good_offer .product-item-quantity');
            let quantity = quantityElement.text().trim();
            // Преобразуем количество в число, если оно пустое, ставим 0
            const quantityInt = quantity ? parseInt(quantity.replace(/[^\d]/g, ''), 10) : 0;


            // Добавляем categoryId в объект
            itemsData.push({ image, title, link, price: priceInt, quantity: quantityInt, categoryId });
        });
        return itemsData;
    } catch (error) {
        console.error(`Ошибка при парсинге страницы ${url}:`, error.message);
        return [];
    }
}

// Функция для парсинга всех страниц одного каталога
async function parseAllPages(baseUrl, categoryId) {
    try {
        console.log(`Начинаем парсинг каталога: ${baseUrl} (Категория ID: ${categoryId})`);
        const totalPages = await getTotalPages(baseUrl);
        console.log(`Всего страниц для парсинга в ${baseUrl}: ${totalPages}`);
        const allItems = [];
        for (let i = 1; i <= totalPages; i++) {
            const pageUrl = `${baseUrl}?PAGEN_1=${i}#catalog-list`;
            console.log(`Парсим страницу: ${pageUrl}`);
            const items = await parseCatalogPage(pageUrl, categoryId);
            allItems.push(...items);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Задержка
        }
        console.log(`Завершён парсинг каталога: ${baseUrl}`);
        return allItems;
    } catch (error) {
        console.error(`Ошибка при парсинге каталога ${baseUrl}:`, error.message);
        return [];
    }
}

// Функция для парсинга нескольких каталогов
async function parseMultipleCatalogs(urls) {
    let allParsedItems = [];
    for (const [index, url] of urls.entries()) {
        const categoryId = index + 1;
        const items = await parseAllPages(url, categoryId);
        allParsedItems = allParsedItems.concat(items);
    }
    return allParsedItems;
}

// Массив URL-адресов для парсинга
const baseUrls = [
    'https://vetapteka1.ru/catalogue/medicine/imunnye_preparaty_i_pribiotiki/', // categoryId: 1
    'https://vetapteka1.ru/catalogue/medicine/syvorotki_i_globuliny/',         // categoryId: 2
    'https://vetapteka1.ru/catalogue/medicine/protivogribkovye_preparaty/',    // categoryId: 3
    'https://vetapteka1.ru/catalogue/medicine/lekarstva_dlya_glaz/',           // categoryId: 4
    'https://vetapteka1.ru/catalogue/medicine/preparaty_pri_allergii/',        // categoryId: 5
    'https://vetapteka1.ru/catalogue/medicine/rastvory/'                       // categoryId: 6
];

// Функция для вставки данных в БД или обновления существующих
async function insertDataIntoDB(products) {
    const upsertQuery = `
        INSERT INTO products (category_id, name, price, quantity, image)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name) DO UPDATE SET
            category_id = EXCLUDED.category_id,
            price = EXCLUDED.price,
            quantity = EXCLUDED.quantity,
            image = EXCLUDED.image;
    `;
    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
        // Проверка наличия обязательных полей перед вставкой/обновлением
        if (!product.title || !product.image || product.price === undefined || product.quantity === undefined || product.categoryId === undefined) {
            console.warn('Пропуск товара из-за отсутствия обязательных данных:', product);
            skippedCount++;
            continue;
        }
        const values = [
            product.categoryId,
            product.title,
            product.price,
            product.quantity,
            product.image
        ];
        try {
            const result = await db.query(upsertQuery, values);
            if (result.rowCount > 0) {
                if (result.command === 'INSERT') {
                    insertedCount++;
                } else if (result.command === 'UPDATE') {
                    updatedCount++;
                } else {
                    updatedCount++;
                }

            } else {
                console.warn(`Не удалось вставить или обновить товар "${product.title}".`);
                skippedCount++;
            }
        } catch (error) {
            console.error(`Ошибка при вставке/обновлении товара "${product.title}":`, error.message);
            skippedCount++; // Считаем ошибку как пропуск
        }
    }
    console.log(`\nВставка/обновление в базе данных завершена.`);
    console.log(`Успешно вставлено новых: ${insertedCount} товаров.`);
    console.log(`Успешно обновлено: ${updatedCount} товаров.`);
    console.log(`Пропущено (ошибки или отсутств. данные): ${skippedCount} товаров.`);
}


// Запуск парсинга и вставки в БД
parseMultipleCatalogs(baseUrls)
.then(async (data) => {
    console.log('\nПарсинг всех каталогов завершён.');
    console.log(`Всего найдено товаров: ${data.length}`);
    // console.log(JSON.stringify(data, null, 2)); // Можно закомментировать вывод в консоль

    if (data.length > 0) {
        console.log('\nНачинаем вставку данных в базу данных...');
        await insertDataIntoDB(data); // <-- 2. Вызываем функцию вставки
    } else {
        console.log('Нет данных для вставки в базу данных.');
    }
})
.catch(error => {
    console.error('Произошла общая ошибка:', error);
})
.finally(async () => {
    // Закрываем пул соединений после завершения всех операций
    await db.pool.end();
    console.log('Соединение с базой данных закрыто.');
});