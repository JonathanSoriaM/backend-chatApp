const { comprobarJWK } = require('../helpers/jwt');
const { io } = require('../index');
const { usuarioConectado , usuarioDesconectado, grabarMensaje } = require ('../controllers/socket')

// Mensajes de Sockets
io.on('connection', client => {
    console.log('Cliente conectado');

   // esto lee el token  
   // console.log(client.handshake.headers['x-token']);
    
   const [valido, uid] = comprobarJWK(client.handshake.headers['x-token'])

  // console.log(valido , uid);

    if( !valido) { return client.disconnect();}

    usuarioConectado(uid);

// ingresar al usuario a una sala especifica

//sala global , client.id , 

    client.join( uid);


    // Escuchar del cliente el mensaje personal

    client.on('mensaje-personal',async (payload) => {
       // console.log(payload);
       //Grabar Mensaje

       await grabarMensaje(payload);



        io.to(payload.para).emit('mensaje-personal',payload)
    })

    client.on('disconnect', () => {
        console.log('Cliente desconectado');
        usuarioDesconectado(uid);
    });

    /*client.on('mensaje', ( payload ) => {
        console.log('Mensaje', payload);

        io.emit( 'mensaje', { admin: 'Nuevo mensaje' } );

    });

*/
});
