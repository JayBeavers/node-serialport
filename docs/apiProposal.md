## Proposed API (Streams + WHATWG Serial) ##

	var serialPortFactory = require('serialport');
	
	serialPortFactory.on('error', console.error);
	serialPortFactory.list(ports =>	{
		var firmataArduinos = ports.filter(port =>
			port.manufacturer.search('arduino') > -1 &&
			port.product.search('firmata') > -1);
	
		if (firmataArduinos.length) {
			var serialPort = firmataArduinos[0].open( { baudrate: '57600' } );

			serialPort.on('error', console.error);
			serialPort.on('data', console.log);

			serialPort.write('hello, serialPort');
		}
	});
	
## Proposed API (Streams + WHATWG Serial), return Q Promise if no callback ##

	var serialPortFactory = require('serialport');
	
	serialPortFactory.list().then(ports =>	{
		var firmataArduinos = ports.filter(port =>
			port.manufacturer.search('arduino') > -1 &&
			port.product.search('firmata') > -1);
	
		if (firmataArduinos.length) {
			var serialPort = firmataArduinos[0].open( { baudrate: '57600' } );

			serialPort.on('error', console.error);
			serialPort.on('data', console.log);

			serialPort.write('hello, serialPort');
		})
		.catch(console.error);
