# Notes app

api endpoints

POST    http://localhost:3000/api/auth/sign_up
POST    http://localhost:3000/api/auth/sign_in
POST    http://localhost:3000/api/auth/refresh
POST    http://localhost:3000/api/auth/logout

POST    http://localhost:3000/api/tenant
PUT     http://localhost:3000/api/tenant
POST    http://localhost:3000/api/tenant
DELETE  http://localhost:3000/api/tenant
GET     http://localhost:3000/api/tenant/all
POST    http://localhost:3000/api/tenant/upgrade
GET     http://localhost:3000/api/tenant/list

POST    http://localhost:3000/api/user
DELETE  http://localhost:3000/api/user/:id

GET     http://localhost:3000/api/admin
DELETE  http://localhost:3000/api/admin/:id
POST    http://localhost:3000/api/admin/:id

POST    http://localhost:3000/api/note
GET     http://localhost:3000/api/note/:id
PATCH   http://localhost:3000/api/note/:id
DELETE  http://localhost:3000/api/note/:id