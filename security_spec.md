# Security Specification - LOGI MARKETING

## 1. Data Invariants
1. Products can be read publicly by any visitor (`allow read: if true`).
2. Product creation, updates, and deletion must satisfy strict payload structure (`id`, `name`, `price`, `category`, `stock`, `images`).
3. Images can be read publicly so all devices, phones, and visitors can display product assets (`allow read: if true`).
4. Orders can be created by any shopper checking out with valid contact details and non-empty items.
5. Inquiries can be submitted by any visitor with valid contact details.

## 2. Dirty Dozen Payloads (Rejection Matrix)
1. Product with negative price or non-numeric price -> Rejected.
2. Product missing required title or empty title -> Rejected.
3. Product with spoofed extra unwhitelisted system root fields -> Rejected.
4. Product with invalid string ID containing illegal characters -> Rejected.
5. Order with empty line items list -> Rejected.
6. Order with invalid status string not in enum -> Rejected.
7. Order with negative total -> Rejected.
8. Image record missing URL -> Rejected.
9. Image record with invalid URL type -> Rejected.
10. Inquiry missing sender email -> Rejected.
11. Inquiry with payload size over 2000 chars -> Rejected.
12. Arbitrary collection write to undefined collection -> Rejected by default deny.
