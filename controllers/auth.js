const { response } = require('express');
const Usuario = require('../Schemas/usuario');
const bcrypt = require ('bcryptjs');
const { generarJWT } = require('../helpers/jwt');
const usuario = require('../Schemas/usuario');

const crearUsuario = async (req,res = response) => {


    const { email , password } = req.body;

    try {

        const existEmail = await Usuario.findOne({email});
        if(existEmail){
            return res.status(400).json({
                ok:false,
                msg:'El correo ya existe'
            })
        }

        const usuario = new Usuario(req.body);

        //encriptar contraseña

        const salt =  bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);

        await usuario.save();

        //Generar el JWT

         const token = await generarJWT(usuario.id);
   
       res.json({
           ok:true,
           usuario,
           token
       });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'Hable con el administrador'
        })
    }

   
}


const login = async ( req, res = response ) => {
    //console.log(req.body)
    const { email, password } = req.body;
    
    try {
        
        const usuarioDB = await usuario.findOne({ email });
        if ( !usuarioDB ) {
            return res.status(404).json({
                ok: false,
                msg: 'Email no encontrado'
            });
        }

        // Validar el password
        const validPassword = bcrypt.compareSync( password, usuarioDB.password );
        if ( !validPassword ) {
            return res.status(400).json({
                ok: false,
                msg: 'La contraseña no es valida'
            });
        }


        // Generar el JWT
        const token = await generarJWT( usuarioDB.id );
        
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}

const renewToken = async(req, res = response) => {

    const uid = req.uid;

    const token = await generarJWT(uid);

    const usuario = await Usuario.findById(uid);
    console.log(req.uid);
    console.log(usuario);
    res.json({
        ok:true,
        usuario,
       token
    })
}

module.exports = {
    crearUsuario,
    login,
    renewToken
}