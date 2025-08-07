-- Melihat semua data categories dengan hierarki
SELECT 
    c.id,
    c.name,
    c.slug,
    c.parent_id,
    p.name as parent_name,
    c.display_order,
    c.is_active
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
ORDER BY 
    CASE WHEN c.parent_id IS NULL THEN 0 ELSE 1 END,
    c.display_order,
    c.name;

-- Menampilkan hasil untuk debugging
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE 'Categories Data:';
    RAISE NOTICE '==================';
    
    FOR rec IN 
        SELECT 
            c.name,
            c.slug,
            COALESCE(p.name, 'ROOT') as parent_name,
            c.display_order,
            c.is_active
        FROM categories c
        LEFT JOIN categories p ON c.parent_id = p.id
        ORDER BY 
            CASE WHEN c.parent_id IS NULL THEN 0 ELSE 1 END,
            c.display_order,
            c.name
    LOOP
        RAISE NOTICE 'Name: %, Parent: %, Order: %, Active: %', 
            rec.name, rec.parent_name, rec.display_order, rec.is_active;
    END LOOP;
END $$;