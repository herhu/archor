# API Reference — Validation App

Base URL (default): `{{baseUrl}}`

---

## Authentication — Get a Token (Client Credentials)

If your IdP supports **OAuth2 Client Credentials**, run:

```bash
curl -X POST "{{tokenUrl}}" \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "grant_type=client_credentials" \
-d "client_id={{clientId}}" \
-d "client_secret={{clientSecret}}" \
-d "scope={{scope}}"
```

**Then copy `access_token` from the response and set:**

```bash
export TOKEN="<access_token>"
```

All examples below assume:

```bash
-H "Authorization: Bearer {{token}}"
```

> **Scopes convention (domain-based):**
>
> * Read: `domain:read`
> * Write: `domain:write`

---

## Endpoints


### POST `/notifications`

**Auth:** Yes
**Required scope:** patient:write
**Description:** Create resource

```bash
curl -X POST "{{baseUrl}}/notifications" \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{
  "customerId": "example_customerId",
  "priority": 1,
  "meta": {
    "example": true
  },
  "enabled": true
}'
```


### GET `/notifications`

**Auth:** Yes
**Required scope:** patient:read
**Description:** List resources

```bash
curl -X GET "{{baseUrl}}/notifications" \
  -H "Authorization: Bearer {{token}}"
```


### GET `/notifications/:id`

**Auth:** Yes
**Required scope:** patient:read
**Description:** Get resource by id

```bash
curl -X GET "{{baseUrl}}/notifications/:id" \
  -H "Authorization: Bearer {{token}}"
```


### PATCH `/notifications/:id`

**Auth:** Yes
**Required scope:** patient:write
**Description:** Update resource

```bash
curl -X PATCH "{{baseUrl}}/notifications/:id" \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json" \
  -d '{
  "customerId": "example_customerId",
  "priority": 1,
  "meta": {
    "example": true
  },
  "enabled": true
}'
```


### DELETE `/notifications/:id`

**Auth:** Yes
**Required scope:** patient:write
**Description:** Delete resource

```bash
curl -X DELETE "{{baseUrl}}/notifications/:id" \
  -H "Authorization: Bearer {{token}}"
```


### PATCH `/notifications/toggle`

**Auth:** Yes
**Required scope:** notifications:toggle
**Description:** Operation: Toggle

```bash
curl -X PATCH "{{baseUrl}}/notifications/toggle" \
  -H "Authorization: Bearer {{token}}"
```


### GET `/notifications/status`

**Auth:** No
**Required scope:** patient:read
**Description:** Operation: Status

```bash
curl -X GET "{{baseUrl}}/notifications/status"
```

