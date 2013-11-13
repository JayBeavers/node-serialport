## Proposed API (Streams + WHATWG Serial) ##

	var serialPortFactory = require('serialport');
	
	var serialPort;
	serialPortFactory.list(ports =>	{
		var firmataArduinos = ports.filter(port =>
				port.manufacturer.search('arduino') > -1
				&& port.product.search('firmata');
	
		if (firmataArduinos.length) {
			serialPort = firmataArduinos[0].open( { baudrate: '57600' } );
		}
	});