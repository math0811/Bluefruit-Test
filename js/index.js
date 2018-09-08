let bluefruit = {
  serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
  rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
}

// = Globals ========================================

var ConnectedDeviceId = null

// = Events =========================================

function onLoad () {
  document.addEventListener('deviceready', onDeviceReady, false)
}

function onDeviceReady () {
  refreshDeviceList()
}

function onReceivedDeviceData (data) {
  document.getElementById('receiveDiv').innerHTML = 'Received: ' + bytesToString(data) + '<br/>'
}

// = Functionality ==================================

function refreshDeviceList () {
  document.getElementById('bleDeviceList').innerHTML = ''

  if (cordova.platformId === 'android') {
    ble.scan([], 5, handleDeviceDiscovered, alert)
  } else {
    ble.scan([bluefruit.serviceUUID], 5, handleDeviceDiscovered, handleError)
  }
}

function connect (deviceId) {
  document.getElementById('debugDiv').innerHTML = deviceId

  ble.connect(deviceId, handleBleConnection(deviceId), handleError)
}

function setData (data) {
  document.getElementById('messageInput').value = data
}

function sendDataToConnectedDevice () {
  let data = stringToBytes(document.getElementById('messageInput').value)

  ble.writeWithoutResponse(ConnectedDeviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic, data, handleSendDataToDevice, handleError)
}

function disconnect () {
  ble.disconnect(deviceId, handleDisconnect, handleError)
}

// = Handlers =======================================

function handleDeviceDiscovered (device) {
  if (device.name !== 'GRINGO') {
    return null
  }

  let listItem = document.createElement('li')
  listItem.classList.add('ble-device')
  listItem.innerHTML = device.name + ', ' + device.id
  listItem.onclick = function () {
    connect(device.id)
  }

  document.getElementById('bleDeviceList').appendChild(listItem)
}

function handleBleConnection (deviceId) {
  return function () {
    ConnectedDeviceId = deviceId

    setConnectionStatus('Connected')
    document.getElementById('bleId').innerHTML = deviceId

    ble.startNotification(deviceId, bluefruit.serviceUUID, bluefruit.rxCharacteristic, onReceivedDeviceData, handleError)
  }
}

function handleSendDataToDevice () {
  document.getElementById('sendDiv').innerHTML = 'Sent: ' + document.getElementById('messageInput').value + '<br/>'
}

function handleDisconnect () {
  setConnectionStatus('Disconnected')
}

function handleError (reason) {
  alert('ERROR: ' + JSON.stringify(reason))
}

// = Utils ==========================================

function bytesToString (input) {
  return String.fromCharCode.apply(null, new Uint8Array(input))
}

function stringToBytes (input) {
  return new Uint8Array(input.length)
    .map(function (_, i) {
      return input.charCodeAt(i)
    })
    .buffer
}

function setConnectionStatus (status) {
  document.getElementById('statusDiv').innerHTML = 'Status: ' + status
}
