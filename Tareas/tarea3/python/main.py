import os
import redis

client = redis.Redis(
    host='10.246.157.227',
    port=6379,
)

def handle_message(message):
    print('Mensaje recibido:', message['data'].decode('utf-8'))

canal = 'test'
pubsub = client.pubsub()
pubsub.subscribe(canal)

for message in pubsub.listen():
    if message['type'] == 'message':
        handle_message(message)