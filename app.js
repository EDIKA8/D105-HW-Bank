const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const accountsFilePath = path.join(__dirname, 'accounts.json');

function loadAccounts() {
    const data = fs.readFileSync(accountsFilePath, 'utf-8');
    return JSON.parse(data);
}

function saveAccounts(accounts) {
    fs.writeFileSync(accountsFilePath, JSON.stringify(accounts, null, 2));
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/create', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'create.html'));
});

app.get('/transfer', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'transfer.html'));
});

app.get('/api/accounts', (req, res) => {
    const accounts = loadAccounts();
    res.json(accounts);
});

app.post('/api/create', (req, res) => {
    const { name, initialBalance } = req.body;
    const accounts = loadAccounts();
    const newAccount = {
        id: accounts.length + 1,
        name,
        balance: parseFloat(initialBalance)
    };
    accounts.push(newAccount);
    saveAccounts(accounts);
    res.redirect('/');
});

app.post('/api/transfer', (req, res) => {
    const { fromAccountId, toAccountId, amount } = req.body;
    const accounts = loadAccounts();

    const fromAccount = accounts.find(acc => acc.id == fromAccountId);
    const toAccount = accounts.find(acc => acc.id == toAccountId);

    if (!fromAccount || !toAccount) {
        return res.send('Invalid account ID');
    }

    if (fromAccount.balance < amount) {
        return res.send('Insufficient funds');
    }

    fromAccount.balance -= parseFloat(amount);
    toAccount.balance += parseFloat(amount);

    saveAccounts(accounts);
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
