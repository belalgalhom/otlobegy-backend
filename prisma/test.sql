DO $$
DECLARE
  next_val INT;
BEGIN
  SELECT COALESCE(
    MAX(CAST(SUBSTRING("ticketNumber" FROM 5) AS INTEGER)), 0
  ) + 1
  INTO next_val
  FROM support_tickets
  WHERE "ticketNumber" ~ '^TKT-[0-9]+$';
 
  EXECUTE format(
    'CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START %s',
    next_val
  );
END;
$$;