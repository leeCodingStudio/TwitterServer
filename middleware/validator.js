import { validationResult } from 'express-validator'

// 404처리

export const validate = (req, res, next) =>{
    const errors = validationResult(req)
    if(errors.isEmpty()){
        return next()
    }
    return res.status(400).json( {message: errors.array()})
}