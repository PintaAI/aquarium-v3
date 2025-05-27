# Mobile Vocabulary API Reference

This document provides details about the vocabulary API endpoints available for mobile applications.

## Base URL

```
https://pejuangkorea.vercel.app/api/mobile/vocab
```

## Endpoints

### Get Vocabulary Collections

```http
GET /api/mobile/vocab
```

Retrieves all vocabulary collections with their items. Can be filtered by type (WORD or SENTENCE).

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | (Optional) Filter collections by vocabulary type. Values: `WORD` or `SENTENCE` |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Basic Korean Words",
      "description": "Essential Korean vocabulary for beginners",
      "icon": "FaBook",
      "items": [
        {
          "id": 1,
          "korean": "안녕하세요",
          "indonesian": "Halo",
          "type": "WORD",
          "isChecked": false,
          "createdAt": "2025-05-01T00:00:00Z",
          "updatedAt": "2025-05-01T00:00:00Z",
          "collectionId": 1
        }
      ]
    }
  ]
}
```

### Get Collection Items

```http
GET /api/mobile/vocab?collectionId={id}
```

Retrieves all vocabulary items from a specific collection. Can be filtered by type.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| collectionId | number | (Required) The ID of the collection |
| type | string | (Optional) Filter items by type. Values: `WORD` or `SENTENCE` |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "korean": "안녕하세요",
      "indonesian": "Halo",
      "type": "WORD",
      "isChecked": false,
      "createdAt": "2025-05-01T00:00:00Z",
      "updatedAt": "2025-05-01T00:00:00Z",
      "collectionId": 1
    }
  ]
}
```

### Search Vocabulary

```http
GET /api/mobile/vocab?search={query}
```

Search for vocabulary items across all collections.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | (Required) Search query. Matches against Korean or Indonesian text |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "korean": "안녕하세요",
      "indonesian": "Halo",
      "type": "WORD",
      "isChecked": false,
      "createdAt": "2025-05-01T00:00:00Z",
      "updatedAt": "2025-05-01T00:00:00Z",
      "collectionId": 1,
      "collection": {
        "title": "Basic Korean Words"
      }
    }
  ]
}
```

## Error Responses

When an error occurs, the API will return:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common error status codes:

- `404` - Collection not found
- `500` - Server error

## Data Types

### VocabularyCollection

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier |
| title | string | Collection title |
| description | string? | Optional description |
| icon | string | Icon identifier (default: "FaBook") |
| items | VocabularyItem[] | Array of vocabulary items |

### VocabularyItem

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier |
| korean | string | Korean text |
| indonesian | string | Indonesian translation |
| type | "WORD" \| "SENTENCE" | Type of vocabulary |
| isChecked | boolean | Whether item has been checked/learned |
| collectionId | number | ID of parent collection |
| createdAt | string | Creation timestamp |
| updatedAt | string | Last update timestamp |

## Examples

### Get Word Collections

```http
GET /api/mobile/vocab?type=WORD
```

### Get Sentence Collections

```http
GET /api/mobile/vocab?type=SENTENCE
```

### Get Items from Collection

```http
GET /api/mobile/vocab?collectionId=1
```

### Search Vocabulary

```http
GET /api/mobile/vocab?search=안녕
