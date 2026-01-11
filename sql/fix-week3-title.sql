UPDATE exercises SET
  title = 'Il Filtro Risorse: Trova Quello che Hai Già'
WHERE book_slug = 'risolutore' AND week_number = 3;

SELECT week_number, title FROM exercises
WHERE book_slug = 'risolutore' AND week_number = 3;
