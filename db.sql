CREATE TABLE users (
   id INTEGER NOT NULL,
   time_created INTEGER NOT NULL,
   email TEXT NOT NULL,
   verified INTEGER NOT NULL,
   ime_verified INTEGER,
   name TEXT,
   PRIMARY KEY(id)
);

CREATE TABLE power_users (
  user_id INTEGER NOT NULL,
  power_level INTEGER NOT NULL,
  PRIMARY KEY(user_id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE projects (
   id INTEGER NOT NULL,
   name TEXT NOT NULL,
   project_owner_id INTEGER NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(project_owner_id) REFERENCES users(id)
);

CREATE TABLE project_members (
  project_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  PRIMARY KEY(project_id, user_id),
  FOREIGN KEY(project_id) REFERENCES projects(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE contracts (
   id INTEGER NOT NULL,
   contractor_id INTEGER NOT NULL,
   project_id INTEGER NOT NULL,
   project_owner_id INTEGER NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(contractor) REFERENCES users(id),
   FOREIGN KEY(project_id) REFERENCES projects(id),
   FOREIGN KEY(project_owner_id) REFERENCES users(id)
);

CREATE TABLE messages (
   id INTEGER NOT NULL,
   sender_id INTEGER NOT NULL,
   receiver_id INTEGER NOT NULL,
   message TEXT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(sender_id) REFERENCES users(id),
   FOREIGN KEY(receiver_id) REFERENCES users(id)
);

CREATE TABLE contacts (
   contacter_id INTEGER NOT NULL,
   contacee_id INTEGER NOT NULL,
   PRIMARY KEY(contacter_id, contactee_id),
   FOREIGN KEY(contacter_id) REFERENCES users(id),
   FOREIGN KEY(contacee_id) REFERENCES users(id)
);

CREATE TABLE reports (
   id INTEGER NOT NULL,
   reporter_id INTEGER NOT NULL,
   reportee_id INTEGER NOT NULL,
   reason TEXT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(reporter_id) REFERENCES users(id),
   FOREIGN KEY(reportee_id) REFERENCES users(id)
);





INSERT INTO customers (id, name, phone, email)
   VALUES (1, 'William Windsor', '+44 1582 872171', 'wwindsor@example.org');
INSERT INTO customers (id, name, phone, email)
   VALUES (2, 'Nils Olav', '+44 131 314 0326', 'mrpenguin@example.org');

INSERT INTO addresses (id, street, city, country, planet)
   VALUES (1, 'Whipsnade Zoo', 'Whipsnade', 'England', 'Earth');
INSERT INTO addresses (id, street, city, country, planet)
   VALUES (2, '134 Corstorphine Road', 'Edinburgh', 'Scotland', 'Earth');

INSERT INTO customer_addresses (customer, address) values (1, 1);
INSERT INTO customer_addresses (customer, address) values (2, 2);

INSERT INTO packages (shipping_customer, receiving_customer,
destination_address, sent_on, due_on)
   VALUES (2, 1, 1, '2016-06-27 14:31:03', '2016-06-28 08:00:00');
