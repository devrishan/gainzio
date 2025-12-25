<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../lib/response.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get user products
    $user = require_auth(['member', 'admin']);
    $pdo = get_pdo();
    
    $stmt = $pdo->prepare('
        SELECT 
            up.id,
            up.product_name,
            up.order_id,
            up.transaction_id,
            up.order_date,
            up.amount_paid,
            up.payment_method,
            up.product_link,
            up.notes,
            up.status,
            up.created_at,
            s.name AS store_name,
            c.name AS category_name,
            (
                SELECT COUNT(*)
                FROM proof_files pf
                WHERE pf.user_product_id = up.id
            ) AS proof_count
        FROM user_products up
        INNER JOIN stores s ON s.id = up.store_id
        INNER JOIN product_categories c ON c.id = up.category_id
        WHERE up.user_id = :user_id
        ORDER BY up.created_at DESC
    ');
    
    $stmt->execute([':user_id' => $user['id']]);
    $products = $stmt->fetchAll() ?: [];
    
    success_response([
        'products' => array_map(static fn($p) => [
            'id' => (int) $p['id'],
            'product_name' => $p['product_name'],
            'store_name' => $p['store_name'],
            'category_name' => $p['category_name'],
            'order_id' => $p['order_id'],
            'transaction_id' => $p['transaction_id'],
            'order_date' => $p['order_date'],
            'amount_paid' => (float) $p['amount_paid'],
            'payment_method' => $p['payment_method'],
            'product_link' => $p['product_link'],
            'notes' => $p['notes'],
            'status' => $p['status'],
            'proof_count' => (int) $p['proof_count'],
            'created_at' => $p['created_at']
        ], $products)
    ]);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create new user product
    require_once __DIR__ . '/../lib/validators.php';
    
    $user = require_auth(['member', 'admin']);
    $pdo = get_pdo();
    
    $input = decode_json_input();
    $missing = require_fields($input, [
        'store_id', 'category_id', 'product_name', 
        'amount_paid', 'payment_method'
    ]);
    
    if (!empty($missing)) {
        error_response('Missing required fields: ' . implode(', ', $missing), 422);
    }
    
    try {
        $stmt = $pdo->prepare('
            INSERT INTO user_products (
                user_id, store_id, category_id, product_name,
                order_id, transaction_id, order_date, amount_paid,
                payment_method, product_link, notes
            ) VALUES (
                :user_id, :store_id, :category_id, :product_name,
                :order_id, :transaction_id, :order_date, :amount_paid,
                :payment_method, :product_link, :notes
            )
        ');
        
        $stmt->execute([
            ':user_id' => $user['id'],
            ':store_id' => $input['store_id'],
            ':category_id' => $input['category_id'],
            ':product_name' => $input['product_name'],
            ':order_id' => $input['order_id'] ?? null,
            ':transaction_id' => $input['transaction_id'] ?? null,
            ':order_date' => $input['order_date'] ?? null,
            ':amount_paid' => $input['amount_paid'],
            ':payment_method' => $input['payment_method'],
            ':product_link' => $input['product_link'] ?? null,
            ':notes' => $input['notes'] ?? null
        ]);
        
        $productId = $pdo->lastInsertId();
        
        success_response([
            'message' => 'Product added successfully',
            'product_id' => (int) $productId
        ], 201);
        
    } catch (PDOException $e) {
        error_response('Failed to add product: ' . $e->getMessage(), 500);
    }
    
} else {
    error_response('Method not allowed.', 405);
}
