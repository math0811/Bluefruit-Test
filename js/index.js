let bluefruit = {
  serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
  rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective  
}

// = Globals ========================================

var ConnectedDeviceId = null // når man er forbundet til en device, gemmer den device id'et her.

// = Events =========================================

function onLoad () {
  document.addEventListener('deviceready', onDeviceReady, false)
}

function onDeviceReady () {
  refreshDeviceList()
} // refresher devicelist når appen åbnes

function onReceivedDeviceData (data) {
  document.getElementById('receiveDiv').innerHTML = 'Received: ' + bytesToString(data) + '<br/>'
} // når den modtager data fra bluetooth devicen, så viser den hvilken data den har fået.

// = Functionality ==================================

function refreshDeviceList () {
  document.getElementById('bleDeviceList').innerHTML = ''

  if (cordova.platformId === 'android') {
    ble.scan([], 5, handleDeviceDiscovered, alert)
  } else {
    ble.scan([bluefruit.serviceUUID], 5, handleDeviceDiscovered, handleError)
  }
} // Scanner nye devices den må scanne i maks 5 sekunder. 

function connect (deviceId) {
  document.getElementById('debugDiv').innerHTML = deviceId

  ble.connect(deviceId, handleBleConnection(deviceId), handleError)
} // denne funktion bruges til at forbinde til en bluetooth enhed. 

function setData (data) {
  document.getElementById('messageInput').value = data
} // sætter teksten i tekstboxen til værende hvad vi nu skriver i vores html kode.

function sendDataToConnectedDevice () {
  let data = stringToBytes(document.getElementById('messageInput').value)

  ble.writeWithoutResponse(ConnectedDeviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic, data, handleSentDataToDevice, handleError)
} // sender hvad der står i tekstboxen (hvad der er skrevet i value=) til bluetooth devicen - arduionoen.

function disconnect () {
  ble.disconnect(deviceId, handleDisconnected, handleError)
} // Disconnecter fra den nu forbundne bluetooth device.

// = Handlers =======================================

function handleDeviceDiscovered (device) { // hver eneste gang scanfunktionen "refreshdevicelist" finder en enhed, sætter den det videre til handleDeviceDiscovered.
  if (device.name !== 'GRINGO') {
    return null // scanfunktionen vil kun vise devicenavnet GRINGO i listen
  } 

  let listItem = document.createElement('li')
  listItem.classList.add('ble-device')
  listItem.innerHTML = device.name + ', ' + device.id
  listItem.onclick = function () {
    connect(device.id) // onlick connecter til device. dette er på hver eneste enhed i refreshDeviceList. Vi har dog kun GRINGO grundet if-sætningen.
  }

  document.getElementById('bleDeviceList').appendChild(listItem) // tilføjer enheden til listen
}

function handleBleConnection (deviceId) { // hvis ble.connect er succesfuld bliver denne funktion kørt.
  return function () { // den sætter den globale variabel. 
    ConnectedDeviceId = deviceId

    setConnectionStatus('Connected')
    document.getElementById('bleId').innerHTML = deviceId // opdaterer device id'et

    ble.startNotification(deviceId, bluefruit.serviceUUID, bluefruit.rxCharacteristic, onReceivedDeviceData, handleError) 
  }
}

function handleSentDataToDevice () { 
  document.getElementById('sendDiv').innerHTML = 'Sent: ' + document.getElementById('messageInput').value + '<br/>'  // displayer hvad der er blevet sendt til bluetooth enheden.
}

function handleDisconnected () {
  setConnectionStatus('Disconnected') // når noget er blevet disconnected, skriver den i status at den er disconnected.
}

function handleError (reason) {
  alert('ERROR: ' + JSON.stringify(reason))  // Vis fejl når der er en fejl. 
}

// = Utils ==========================================

function bytesToString (input) { 
  return String.fromCharCode.apply(null, new Uint8Array(input)) // Bytes til en string (tekst).
}

function stringToBytes (input) { // laver string om til en bytearray
  return new Uint8Array(input.length)
    .map(function (_, i) {
      return input.charCodeAt(i)
    }) 
    .buffer
}

function setConnectionStatus (status) { // Sætter den visuelle connection status.
  document.getElementById('statusDiv').innerHTML = 'Status: ' + status
}
