#!/bin/bash

# A simple script to test the book-calendar webhook
# Replace <YOUR_APP_DOMAIN>, <YOUR_AGENT_ID>, and <YOUR_SECRET_TOKEN> with actual values

DOMAIN="http://localhost:3000"
AGENT_ID="test_agent_id"
SECRET="your_development_secret"

curl -X POST "$DOMAIN/api/elevenlabs/tools/book-calendar?agent_id=$AGENT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SECRET" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+15550102030",
    "date": "2026-06-01",
    "time": "14:30",
    "service": "Initial Consultation"
  }'
