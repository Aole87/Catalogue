# Category Hierarchy & Domain Architecture

## 1. Overview & Tree Structure

Automotive parts require deep, multi-level category navigation (e.g. `Brakes -> Brake Pads -> Front Brake Pads`). The Category domain provides an efficient, self-referencing hierarchy with strict cycle detection and deletion safety.

```
Automotive Parts
├── ระบบเบรก (brakes)
│   ├── ผ้าเบรกหน้า (front-brake-pads)
│   └── ผ้าเบรกหลัง (rear-brake-pads)
├── ไส้กรอง (filters)
│   ├── กรองน้ำมันเครื่อง (oil-filters)
│   └── กรองอากาศ (air-filters)
└── เครื่องยนต์และระบบจุดระเบิด (engine)
    └── หัวเทียน (spark-plugs)
```

---

## 2. Category Relational Model

```prisma
model Category {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  parentId    String?   @map("parent_id") @db.Uuid
  name        String
  slug        String    @unique
  description String?
  imageUrl    String?   @map("image_url")
  sortOrder   Int       @default(0) @map("sort_order")
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  parent      Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: Restrict)
  children    Category[] @relation("CategoryHierarchy")
  products    Product[]

  @@map("categories")
}
```

---

## 3. Key Architectural Safeguards

1. **Cycle Prevention:**
   - Attempting to set a category's parent to itself (`parentId === id`) is rejected.
   - Attempting to set a category's parent to any of its own descendants (`A -> B -> C -> A`) is detected via iterative descendant traversal and rejected with `400 Bad Request`.
2. **Product Orphan Safety:**
   - Deleting a category that contains active products is rejected with `409 Conflict`. Products must be reassigned prior to category deletion.
3. **Subcategory Orphan Safety:**
   - Deleting a category that has active child subcategories is rejected with `409 Conflict`.
4. **N+1 Avoidance on Tree Retrieval:**
   - `GET /api/v1/categories/tree` fetches all active categories in **1 single flat SQL query** and constructs the nested parent-child tree entirely in-memory in `O(N)` time.

---

## 4. API Endpoints

| Endpoint | Method | Auth / Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/categories/tree` | `GET` | Public | Nested category tree structure for navigation |
| `/api/v1/categories` | `GET` | Public | Flat list of active categories |
| `/api/v1/categories/:id` | `GET` | Public | Category detail by UUID |
| `/api/v1/categories/slug/:slug` | `GET` | Public | Category detail by URL-safe slug |
| `/api/v1/admin/categories` | `GET` | `category.read` | List all categories including inactive ones |
| `/api/v1/admin/categories` | `POST` | `category.create` | Create a new root or subcategory |
| `/api/v1/admin/categories/:id` | `PATCH` | `category.update` | Update category details and hierarchy with cycle checks |
| `/api/v1/admin/categories/:id` | `DELETE` | `category.delete` | Soft-delete category with orphan safety checks |
