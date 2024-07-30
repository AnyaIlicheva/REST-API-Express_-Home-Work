//импортируем express и наши собственные модули: Валидации и Схемы валидации данных
const express = require ('express');
const fs = require('fs');
const path = require('path');
const Joi = require('joi');

const userSchema = Joi.object({
    firstName: Joi.string().min(2).required(),
    secondName: Joi.string().min(2).required(),
    age: Joi.number().min(0).required(),
    city: Joi.string().min(2)
});

//инициализируем приложение express
const app = express();
//создаем уникальный ID для каждой статьи
let uniqueID = 0;

const usersListPath = path.join(__dirname, 'users.json');
//определяем нашу базу данных для хранения статей
//const users = [];

//обработчик, который позволяет в теле запроса получать JSON
app.use(express.json());

//Роут(обработчик) позволяет получить всех пользователей
app.get('/users', (req, res) => {
    const usersJson = fs.readFileSync(usersListPath, 'utf-8');
    const usersData = JSON.parse(usersJson);
    res.send({ users: usersData });
});

//роут(обработчик) позволяет получить конкретного пользователя
app.get('/users/:id', (req, res) => {
    const usersJson = fs.readFileSync(usersListPath, 'utf-8');
    const usersData = JSON.parse(usersJson);
    const user = usersData.find((user) => user.id === Number(req.params.id));

    if (user) {
        res.send({ user });
    } else {
        res.status(404);
        res.send({ user: null, message: 'Пользователь не найден' });
    }
});

//роут(обработчик) добавление нового пользователя
    app.post('/users', (req, res) => {
    const validateData = userSchema.validate(req.body);
    if (validateData.error) {
        return res.status(400).send({error: validateData.error.details})
    };
    const usersJson = fs.readFileSync(usersListPath, 'utf-8');
    const usersData = JSON.parse(usersJson);

    uniqueID += 1;

    usersData.push({
        id: uniqueID, //"id": 1+1
        ...req.body // spread оператор, 
    });
    fs.writeFileSync(usersListPath, JSON.stringify(usersData));
    
    res.send({
        id: uniqueID,
    });
});
//роут обновления статьи
    app.put('/users/:id', (req, res) => {
        const validateData = userSchema.validate(req.body);
    if (validateData.error) {
        return res.status(400).send({error: validateData.error.details})
    };
        const usersJson = fs.readFileSync(usersListPath, 'utf-8');
        const usersData = JSON.parse(usersJson);

        const user = usersData.find((user) => user.id === Number(req.params.id));

        if (user) {
            user.firstName = req.body.firstName;
            user.secondName = req.body.secondName;
            user.age = req.body.age;
            user.city = req.body.city;

            fs.writeFileSync(usersListPath, JSON.stringify(usersData));
            
            res.send({ user });
        } else {
            res.status(404);
            res.send({ user: null, message: 'Пользователь не найден' });
        }
});

//роут удаления статьи
app.delete('/users/:id', (req, res) => {
    const usersJson = fs.readFileSync(usersListPath, 'utf-8');
    const usersData = JSON.parse(usersJson);

    const usersIndex = usersData.findIndex((user) => user.id === Number(req.params.id));

    if (usersIndex > -1) {
        usersData.splice(usersIndex, 1); // Удаляет один элемент с позиции [userIndex], а цифра(единичка) - это количество удаляемых элементов, начиная с данной позиции

        fs.writeFileSync(usersListPath, JSON.stringify(usersData));
        res.send({ message: 'Пользователь успешно удален!' });
    } else {
        res.status(404);
        res.send({ message: 'Пользователь не найден!' });
    }
});
//Обработка несуществующих роутов
app.use((req, res) => {
    res.status(404). send({
        message: 'URL not found!'
    })
});

app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});