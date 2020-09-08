import os
from datetime import date, datetime

from flask import Flask, render_template, render_template, url_for, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = {}


@app.route("/")
def index():
    return render_template('index.html', channels=channels.keys())


@app.route("/messages", methods=['POST'])
def messages():
    channel_name = request.form.get('channel_name')
    if(channel_name not in channels.keys()):
        return jsonify({'success': False})
    else:
        type(channels[channel_name]['messages'])
        return jsonify({'success': True, 'messages': channels[channel_name]['messages']})


@app.route('/channels', methods=['GET'])
def get_channels():
    print("requset for channel came")
    if len(channels.keys()) == 0:
        return jsonify({'success': False})
    else:
        return jsonify({'success': True, 'channels': channels.keys()})


@socketio.on('new message')
def addMessage(data):
    messages_box = channels[data['channel_name']]
    message_count = messages_box['count']
    if message_count >= 100:
        messages_box['messages'].pop(0)
        message_count -= 1
    message_count += 1
    messages_box['count'] = message_count
    curr_time = str(datetime.now())
    curr_time = curr_time[:-7]
    msg = {'time': curr_time,
           'username': data['display_name'], 'message': data['message']}
    messages_box['messages'].append(msg)
    channels[data['channel_name']] = messages_box
    response = {}
    response = msg
    response['channel_name'] = data['channel_name']
    print("message response")
    print(response)
    emit('new message', response, broadcast=True)


@socketio.on('new channel')
def addChannel(data):
    response = {}
    if data['channel_name'] in channels.keys():
        response['success'] = False
    else:
        messages_box = {}
        messages_box['count'] = 0
        messages_box['messages'] = []
        channels[data['channel_name']] = messages_box
        response['success'] = True
        response['channel_name'] = data['channel_name']

    emit('new channel', (response), broadcast=True)
    print(channels)
