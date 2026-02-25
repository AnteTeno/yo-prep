-- Testikysymykset ladataan automaattisesti käynnistyksessä (H2 in-memory)

INSERT INTO questions (exam_code, subject, question_number, question_text, correct_answer, points, difficulty)
VALUES ('pmat_k2025', 'mathematics', 1, 'Laske 2 + 2', '4', 2, 'easy');

INSERT INTO questions (exam_code, subject, question_number, question_text, correct_answer, points, difficulty)
VALUES ('pmat_k2025', 'mathematics', 2, 'Ratkaise yhtälö: 2x + 5 = 15', 'x = 5', 4, 'medium');

INSERT INTO questions (exam_code, subject, question_number, question_text, correct_answer, points, difficulty)
VALUES ('pmat_k2025', 'mathematics', 3, 'Derivoi funktio f(x) = 3x^2 + 2x - 1', 'f''(x) = 6x + 2', 6, 'hard');

INSERT INTO questions (exam_code, subject, question_number, question_text, correct_answer, points, difficulty)
VALUES ('pfys_k2025', 'physics', 1, 'Mikä on valon nopeus tyhjiössä?', '299 792 458 m/s', 2, 'easy');

INSERT INTO questions (exam_code, subject, question_number, question_text, correct_answer, points, difficulty)
VALUES ('pfys_k2025', 'physics', 2, 'Laske kappaleen kiihtyvyys, kun massa on 10 kg ja voima 50 N', '5 m/s^2', 4, 'medium');

INSERT INTO questions (exam_code, subject, question_number, question_text, correct_answer, points, difficulty)
VALUES ('pkem_k2025', 'chemistry', 1, 'Mikä on veden kemiallinen kaava?', 'H2O', 2, 'easy');

INSERT INTO questions (exam_code, subject, question_number, question_text, correct_answer, points, difficulty)
VALUES ('peng_k2025', 'english', 1, 'Käännä englanniksi: Minä rakastan ohjelmointia', 'I love programming', 3, 'medium');

INSERT INTO questions (exam_code, subject, question_number, question_text, correct_answer, points, difficulty)
VALUES ('phis_k2025', 'history', 1, 'Minä vuonna Suomi itsenäistyi?', '1917', 2, 'easy');
