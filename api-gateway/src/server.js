import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { createProxyMiddleware } from 'http-proxy-middleware';
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());

// For parsed endpoints (CRUD forms, etc)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[GATEWAY] [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Service URLs
const SERVICES = {
  USER_SERVICE: process.env.USER_SERVICE_URL || 'http://localhost:7001',
  DATASET_SERVICE: process.env.DATASET_SERVICE_URL || 'http://localhost:7002',
  PAYMENT_SERVICE: process.env.PAYMENT_SERVICE_URL || 'http://localhost:7003',
  ANALYTICS_SERVICE: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:7004'
};

// CRUD Form - Server-side rendered page to create new users
app.get('/crud', (req, res) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CRUD</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
        <script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.slim.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
    </head>
    <body>
        <div class="container">
            <div class="row">
                <form id="crudForm" style="width: 100%;">
                    <div class="form-row">
                        <div class="col-12 mt-3"><h4>Create a new user</h4></div>

                        <div class="form-group col-md-6">
                            <label for="email">Email</label>
                            <input type="email" class="form-control" id="email" name="email" required>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="password">Password</label>
                            <input type="password" class="form-control" id="password" name="password" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="firstName">First name</label>
                            <input type="text" class="form-control" id="firstName" name="firstName" required>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="lastName">Last name</label>
                            <input type="text" class="form-control" id="lastName" name="lastName" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="address">Address</label>
                        <input type="text" class="form-control" id="address" name="address" placeholder="1234 Main St">
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="phonenumber">Phone number</label>
                            <input type="text" class="form-control" id="phonenumber" name="phonenumber">
                        </div>
                        <div class="form-group col-md-3">
                            <label for="gender">Sex</label>
                            <select name="gender" class="form-control" id="gender">
                                <option value="1">Male</option>
                                <option value="0">Female</option>
                            </select>
                        </div>
                        <div class="form-group col-md-3">
                            <label for="roleId">Role</label>
                            <select name="roleId" class="form-control" id="roleId">
                                <option value="1">Admin</option>
                                <option value="2">Provider</option>
                                <option value="3">Consumer</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary">Sign in</button>
                    <div id="message" style="margin-top: 20px;"></div>
                </form>
            </div>
        </div>

        <script>
            document.getElementById('crudForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const data = {
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value,
                    address: document.getElementById('address').value,
                    phonenumber: document.getElementById('phonenumber').value,
                    gender: document.getElementById('gender').value,
                    roleId: document.getElementById('roleId').value
                };

                try {
                    const response = await fetch('/post-crud', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });

                    const result = await response.json();
                    const messageDiv = document.getElementById('message');

                    if (result.errCode === 0) {
                        messageDiv.innerHTML = '<div class="alert alert-success">User created successfully! Redirecting to users list...</div>';
                        setTimeout(() => {
                            window.location.href = '/get-crud';
                        }, 1500);
                    } else {
                        messageDiv.innerHTML = '<div class="alert alert-danger">Error: ' + (result.errMessage || result.message) + '</div>';
                    }
                } catch (error) {
                    document.getElementById('message').innerHTML = '<div class="alert alert-danger">Error: ' + error.message + '</div>';
                }
            });
        </script>
    </body>
    </html>
  `;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(htmlContent);
});

// POST CRUD - Create new user via API
app.post('/post-crud', async (req, res) => {
  try {
    const response = await axios.post('http://user-service:7001/api/create-new-user', req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      errCode: -1,
      errMessage: error.message
    });
  }
});

// GET CRUD - Display all users
app.get('/get-crud', async (req, res) => {
  try {
    const response = await axios.get('http://user-service:7001/api/get-all-users?id=ALL');
    const users = response.data.users || [];
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Get CRUD</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
          <style>
              table, th, td {
                  border: 1px solid black;
                  border-collapse: collapse;
              }
              th, td {
                  padding: 15px;
                  text-align: left;
              }
              table#t01 {
                  width: 100%;
                  background-color: #f1f1c1;
              }
          </style>
      </head>
      <body>
          <div class="container mt-4">
              <h2>Users List</h2>
              <table style="width:100%">
                  <tr>
                      <th>Email</th>
                      <th>First name</th>
                      <th>Last name</th>
                      <th>Address</th>
                      <th>Action</th>
                  </tr>
                  ${users.map(user => `
                      <tr>
                          <td>${user.email}</td>
                          <td>${user.firstName}</td>
                          <td>${user.lastName}</td>
                          <td>${user.address || ''}</td>
                          <td>
                              <a href="/edit-crud?id=${user.id}" class="btn btn-outline-warning btn-sm">Edit</a>
                              <a href="/delete-crud?id=${user.id}" class="btn btn-outline-danger btn-sm">Delete</a>
                          </td>
                      </tr>
                  `).join('')}
              </table>
              <a href="/crud" class="btn btn-primary mt-3">Create New User</a>
          </div>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlContent);
  } catch (error) {
    res.status(500).send('<h1>Error loading users</h1><p>' + error.message + '</p>');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'API Gateway is running',
    timestamp: new Date().toISOString()
  });
});

// Service status endpoint
app.get('/api/status', async (req, res) => {
  try {
    const statuses = {};

    // Check each service
    const services = Object.entries(SERVICES);
    for (const [name, url] of services) {
      try {
        await axios.get(`${url}/health`, { timeout: 2000 });
        statuses[name] = { status: 'up', url };
      } catch (error) {
        statuses[name] = { status: 'down', url, error: error.message };
      }
    }

    res.json({
      gateway: 'up',
      services: statuses
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Route user service - using axios instead of proxy
app.post('/api/login', async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.USER_SERVICE}/api/login`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('[GATEWAY] Login error:', error.message);
    res.status(error.response?.status || 503).json({
      errCode: -1,
      message: error.response?.data?.message || 'User Service unavailable'
    });
  }
});

app.get('/api/get-all-users', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.USER_SERVICE}/api/get-all-users`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'User Service unavailable' });
  }
});

app.post('/api/create-new-user', async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.USER_SERVICE}/api/create-new-user`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'User Service unavailable' });
  }
});

app.put('/api/edit-user', async (req, res) => {
  try {
    const response = await axios.put(`${SERVICES.USER_SERVICE}/api/edit-user`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'User Service unavailable' });
  }
});

app.delete('/api/delete-user', async (req, res) => {
  try {
    const response = await axios.delete(`${SERVICES.USER_SERVICE}/api/delete-user`, { data: req.body });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'User Service unavailable' });
  }
});

app.get('/api/allcode', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.USER_SERVICE}/api/allcode`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'User Service unavailable' });
  }
});

// Route dataset service
app.get('/api/datasets', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.DATASET_SERVICE}/api/datasets`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    console.error('[GATEWAY] Dataset Service error:', error.message);
    res.status(error.response?.status || 503).json({ error: 'Dataset Service unavailable' });
  }
});

app.get('/api/datasets/:id', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.DATASET_SERVICE}/api/datasets/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Dataset Service unavailable' });
  }
});

app.post('/api/datasets/:id/purchase', async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.DATASET_SERVICE}/api/datasets/${req.params.id}/purchase`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Dataset Service unavailable' });
  }
});

// Route payment service
app.get('/api/orders', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.PAYMENT_SERVICE}/api/orders`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    console.error('[GATEWAY] Payment Service error:', error.message);
    res.status(error.response?.status || 503).json({ error: 'Payment Service unavailable' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.PAYMENT_SERVICE}/api/orders`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('[GATEWAY] Payment Service error (POST /api/orders):', error.message);
    res.status(error.response?.status || 503).json({ error: 'Payment Service unavailable' });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.PAYMENT_SERVICE}/api/payments`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Payment Service unavailable' });
  }
});

app.get('/api/subscriptions', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.PAYMENT_SERVICE}/api/subscriptions`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Payment Service unavailable' });
  }
});

app.post('/api/subscriptions', async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.PAYMENT_SERVICE}/api/subscriptions`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Payment Service unavailable' });
  }
});

// Route analytics service
app.get('/api/get-analytics', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.ANALYTICS_SERVICE}/api/get-analytics`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    console.error('[GATEWAY] Analytics Service error:', error.message);
    res.status(error.response?.status || 503).json({ error: 'Analytics Service unavailable' });
  }
});

app.get('/api/get-available-months', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.ANALYTICS_SERVICE}/api/get-available-months`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Analytics Service unavailable' });
  }
});

app.get('/api/get-datasets-by-day', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.ANALYTICS_SERVICE}/api/get-datasets-by-day`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Analytics Service unavailable' });
  }
});

app.post('/api/calculate-monthly', async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.ANALYTICS_SERVICE}/api/calculate-monthly`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Analytics Service unavailable' });
  }
});

app.post('/api/recalculate-analytics-monthly', async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.ANALYTICS_SERVICE}/api/recalculate-analytics-monthly`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Analytics Service unavailable' });
  }
});

app.post('/api/recalculate-analytics', async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.ANALYTICS_SERVICE}/api/recalculate-analytics`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Analytics Service unavailable' });
  }
});

app.get('/api/debug-data', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.ANALYTICS_SERVICE}/api/debug-data`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Analytics Service unavailable' });
  }
});

// Additional payment routes with ID parameters
app.get('/api/payments/:id', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.PAYMENT_SERVICE}/api/payments/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Payment Service unavailable' });
  }
});

app.post('/api/payments/:id', async (req, res) => {
  try {
    const response = await axios.post(`${SERVICES.PAYMENT_SERVICE}/api/payments/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Payment Service unavailable' });
  }
});

app.put('/api/payments/:id', async (req, res) => {
  try {
    const response = await axios.put(`${SERVICES.PAYMENT_SERVICE}/api/payments/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Payment Service unavailable' });
  }
});

app.get('/api/payments/:id/status', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.PAYMENT_SERVICE}/api/payments/${req.params.id}/status`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Payment Service unavailable' });
  }
});

// Additional subscription routes with ID parameters
app.get('/api/subscriptions/:id', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.PAYMENT_SERVICE}/api/subscriptions/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Payment Service unavailable' });
  }
});

app.put('/api/subscriptions/:id', async (req, res) => {
  try {
    const response = await axios.put(`${SERVICES.PAYMENT_SERVICE}/api/subscriptions/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Payment Service unavailable' });
  }
});

app.delete('/api/subscriptions/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${SERVICES.PAYMENT_SERVICE}/api/subscriptions/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Payment Service unavailable' });
  }
});

app.get('/api/subscriptions/:id/download', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.PAYMENT_SERVICE}/api/subscriptions/${req.params.id}/download`, { 
      params: req.query,
      responseType: 'text'
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="subscription_${req.params.id}.csv"`);
    res.send(response.data);
  } catch (error) {
    res.status(error.response?.status || 503).json({ error: 'Payment Service unavailable' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[GATEWAY] Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 6969;
app.listen(PORT, () => {
  console.log(`✅ API Gateway is running on port ${PORT}`);
  console.log(`   User Service: ${SERVICES.USER_SERVICE}`);
  console.log(`   Dataset Service: ${SERVICES.DATASET_SERVICE}`);
  console.log(`   Payment Service: ${SERVICES.PAYMENT_SERVICE}`);
  console.log(`   Analytics Service: ${SERVICES.ANALYTICS_SERVICE}`);
});

export default app;
