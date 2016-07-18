CREATE TABLE entities (
  id INTEGER NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE users (
   id INTEGER NOT NULL,
   time_created INTEGER NOT NULL,
   email TEXT NOT NULL,
   verified INTEGER NOT NULL,
   ime_verified INTEGER,
   name TEXT,
   bio TEXT,
   title TEXT,
   PRIMARY KEY(id),
   FOREIGN KEY(id) REFERENCES entities(id)
);

CREATE TABLE power_users (
  user_id INTEGER NOT NULL,
  power_level INTEGER NOT NULL,
  PRIMARY KEY(user_id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE followings (
  user_id INTEGER NOT NULL,
  entitiy_id INTEGER NOT NULL,
  last_updated INTEGER NOT NULL,
  PRIMARY KEY(user_id),
  FOREIGN KEY(user_id) REFERENCES (user_id)
);

CREATE TABLE tags (
  id INTEGER NOT NULL,
  name TEXT NOT NULL,
  PRIMARY KEY(id),
  CONSTRAINT unique_names UNIQUE (name)
);

CREATE TABLE tagged_items (
  tag_id INTEGER NOT NULL,
  entity_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  PRIMARY KEY(tag_id, entity_id),
  FOREIGN KEY(tag_id) REFERENCES tags(id),
  FOREIGN KEY(entity_id) REFERENCES entities(id),
  CONSTRAINT rating_limits CHECK (rating > 0 AND rating < 6)
);

CREATE TABLE projects (
   id INTEGER NOT NULL,
   project_owner_id INTEGER NOT NULL,
   time_created INTEGER NOT NULL,
   time_updated INTEGER NOT NULL,
   name TEXT NOT NULL,
   showcase_id INTEGER,
   basic_info TEXT,
   detailed_info TEXT,
   PRIMARY KEY(id),
   FOREIGN KEY(id) REFERENCES entities(id),
   FOREIGN KEY(project_owner_id) REFERENCES users(id),
   FOREIGN KEY(showcase_id) REFERENCES showcases(id)
);

CREATE TABLE showcases (
  id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY(project_id) REFERENCES projects(id)
);

CREATE TABLE showcase_items (
  showcase_id INTEGER NOT NULL,
  asset_path TEXT NOT NULL,
  media_type TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  PRIMARY KEY(showcase_id, asset_path),
  FOREIGN KEY(showcase_id) REFERENCES showcases(id),
  CONSTRAINT asset_uniqueness UNIQUE (asset_path)
);

CREATE TABLE project_members (
  project_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  time_added INTEGER NOT NULL,
  PRIMARY KEY(project_id, user_id),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(project_id) REFERENCES projects(id)
);

CREATE TABLE contracts (
   id INTEGER NOT NULL,
   time_created INTEGER NOT NULL,
   time_updated INTEGER NOT NULL,
   contractor_id INTEGER NOT NULL,
   project_id INTEGER NOT NULL,
   project_owner_id INTEGER NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id) REFERENCES entities(id),
   FOREIGN KEY(contractor) REFERENCES users(id),
   FOREIGN KEY(project_id) REFERENCES projects(id),
   FOREIGN KEY(project_owner_id) REFERENCES users(id)
);

CREATE TABLE contract_members (
  contract_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  time_added INTEGER NOT NULL,
  PRIMARY KEY(contract_id, user_id),
  FOREIGN KEY(contract_id) REFERENCES contracts(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE messages (
   id INTEGER NOT NULL,
   time_created INTEGER NOT NULL,
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
   time_created INTEGER NOT NULL,
   reporter_id INTEGER NOT NULL,
   reportee_id INTEGER NOT NULL,
   reason TEXT NOT NULL,
   page_reported_on TEXT NOT NULL,
   status TEXT,
   PRIMARY KEY(id),
   FOREIGN KEY(reporter_id) REFERENCES users(id),
   FOREIGN KEY(reportee_id) REFERENCES users(id),
   CONSTRAINT status_check CHECK(status IN ('Accepted, Unresolved, Rejected'))
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
