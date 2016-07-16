CREATE TABLE users (
  id INTEGER NOT NULL,
  name TEXT NOT NULL,
  verified INTEGER NOT NULL,
  permissions INTEGER NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE projects (
  id INTEGER,
  name TEXT NOT NULL,
  project_owner_id INTEGER NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY(project_owner_id) REFERENCES users(id)
);

CREATE TABLE contracts (
  id INTEGER,
  contractor_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  project_owner_id INTEGER NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY(contractor) REFERENCES users(id),
  FOREIGN KEY(project_id) REFERENCES projects(id),
  FOREIGN KEY(project_owner_id) REFERENCES users(id)
);

CREATE TABLE projects (
  id INTEGER,
  project_owner_id INTEGER NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY(project_owner_id) REFERENCES users(id)
);

CREATE TABLE messages (
  id INTEGER,
  user_id_one INTEGER NOT NULL,
  user_id_two INTEGER NOT NULL,
  message TEXT NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY(user_id_one) REFERENCES users(id),
  FOREIGN KEY(user_id_two) REFERENCES users(id)
);

CREATE TABLE contacts (
  contacter_id INTEGER NOT NULL,
  contacee_id INTEGER NOT NULL,
  PRIMARY KEY(contacter_id, contactee_id),
  FOREIGN KEY(contacter_id) REFERENCES users(id),
  FOREIGN KEY(contacee_id) REFERENCES users(id)
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

INSERT INTO packages (shipping_customer, receiving_customer, destination_address, sent_on, due_on)
  VALUES (2, 1, 1, '2016-06-27 14:31:03', '2016-06-28 08:00:00');
