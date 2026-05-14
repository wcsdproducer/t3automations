#!/bin/bash

# A simple script to test the book-calendar webhook
# Replace <YOUR_APP_DOMAIN>, <YOUR_AGENT_ID>, and <YOUR_SECRET_TOKEN> with actual values

DOMAIN="http://localhost:9003"
AGENT_ID="agent_3901krgpa3e5eaxs3ncvbhqxjq38"
SECRET="8e49cb112e70b6545afd7a59f914d74de2cd769a0925ef49138f03942a74c8fe"

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
