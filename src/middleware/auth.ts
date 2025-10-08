import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

interface AutenticacaoRequest extends Request {
    usuarioId?: string;
}

function Auth(req:Request, res:Response, next:NextFunction) {
    console.log("Cheguei no middleware e bloqueei")
    const authHeader = req.headers.authorization
    console.log(authHeader)
    if (!authHeader) {
        return res.status(401).json({mensagem:"Token não enviado"})
    }
    const token = authHeader.split(' ')[1]!

    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
        if (err) {
            console.log(err)
            return res.status(401).json({mensagem:"Token inválido"})
        }
        if (typeof decoded === 'string' || !decoded||!("ususarioId" in decoded)) {
            return res.status(401).json({mensagem:"Token inválido"})
        }
        req.usuarioId = decoded.usuarioId
        next()
    })



    /*/if (token === "seu_token_secreto") {
        console.log("Token válido, prossiga para a próxima etapa")
        return next()
    }*/
    return res.status(401).json({mensagem:"Bloqueia tudo!"})

}

export default Auth