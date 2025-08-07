-- Query untuk melihat data categories dengan hierarki
SELECT 
    c.id,
    c.name,
    c.slug,
    c.description,
    c.parent_id,
    p.name as parent_name,
    c.display_order,
    c.is_active,
    c.created_at
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
WHERE c.is_active = true
ORDER BY 
    CASE WHEN c.parent_id IS NULL THEN 0 ELSE 1 END,
    c.display_order,
    c.name;

-- Query untuk melihat kategori utama (parent categories)
SELECT 
    id,
    name,
    slug,
    description,
    display_order
FROM categories 
WHERE parent_id IS NULL 
    AND is_active = true
ORDER BY display_order, name;

-- Query untuk melihat subkategori dengan parent mereka
SELECT 
    c.id,
    c.name as subcategory_name,
    c.slug as subcategory_slug,
    p.name as parent_name,
    p.slug as parent_slug,
    c.display_order
FROM categories c
JOIN categories p ON c.parent_id = p.id
WHERE c.is_active = true
ORDER BY p.display_order, p.name, c.display_order, c.name;